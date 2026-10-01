function formatThaiDate(dateString) {
  if (!dateString) return "";
  const datePart = dateString.split(" ")[0]; 
  const parts = datePart.split("/");
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    let year = parseInt(parts[2], 10);
    if (year < 2500) year += 543;
    return `${day}/${month}/${year}`;
  }
  return dateString;
}

function generateFlexMessage(lead, options = {}) {
  const isShared = options.isShared || false;
  const rawPhone = lead.phone || "";
  const phoneNumber = rawPhone.replace(/[^0-9]/g, '').slice(0, 10);
  const telUri = phoneNumber ? `tel:${phoneNumber}` : "tel:000";

  // Prepare LIFF URL for sharing
  const liffId = process.env.LIFF_ID || "";
  const shareUri = liffId 
    ? `https://liff.line.me/${liffId}?row=${lead.rowIndex || ''}`
    : `https://marketing-bot-eta.vercel.app/api/webhook?noliff=1`;

  const buttons = [
    {
      type: "box",
      layout: "vertical",
      backgroundColor: "#2ecc71",
      cornerRadius: "30px",
      paddingAll: "12px",
      flex: 1,
      action: {
        type: "uri",
        label: "📞 โทร",
        uri: telUri
      },
      contents: [
        {
          type: "text",
          text: "📞 โทรติดต่อ",
          color: "#ffffff",
          weight: "bold",
          align: "center",
          size: "sm"
        }
      ]
    }
  ];

  if (!isShared) {
    buttons.push({
      type: "box",
      layout: "vertical",
      backgroundColor: "#3498db",
      cornerRadius: "30px",
      paddingAll: "12px",
      flex: 1,
      action: {
        type: "uri",
        label: "📤 ส่งต่อ",
        uri: shareUri
      },
      contents: [
        {
          type: "text",
          text: "📤 ส่งต่อ",
          color: "#ffffff",
          weight: "bold",
          align: "center",
          size: "sm"
        }
      ]
    });
  }

  return {
    type: "flex",
    altText: "🎉 New Marketing Lead",
    contents: {
      type: "bubble",
      size: "giga",
      header: {
        type: "box",
        layout: "vertical",
        backgroundColor: "#2c3e50",
        paddingAll: "20px",
        paddingBottom: "25px",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "✨ NEW MARKETING LEAD",
                weight: "bold",
                color: "#ffffff",
                size: "sm",
                flex: 1
              },
              {
                type: "text",
                text: formatThaiDate(lead.timestamp),
                color: "#a8b8c8",
                size: "xs",
                align: "end",
                flex: 0,
                margin: "sm"
              }
            ]
          },
          {
            type: "text",
            text: lead.company || "-",
            weight: "bold",
            size: "xl",
            color: "#ffffff",
            margin: "md",
            wrap: true
          }
        ]
      },
      body: {
        type: "box",
        layout: "vertical",
        paddingAll: "20px",
        contents: [

          // Main Info Group
          {
            type: "box",
            layout: "vertical",
            backgroundColor: "#f8f9fa",
            cornerRadius: "12px",
            paddingAll: "15px",
            contents: [
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  { type: "text", text: "👤 ชื่อลูกค้า", size: "sm", color: "#8c8c8c", flex: 1 },
                  { type: "text", text: lead.customerName || "-", size: "sm", color: "#111111", flex: 2, wrap: true }
                ]
              },
              {
                type: "box",
                layout: "horizontal",
                margin: "md",
                contents: [
                  { type: "text", text: "💼 บริษัท", size: "sm", color: "#8c8c8c", flex: 1 },
                  { type: "text", text: lead.company || "-", size: "sm", color: "#111111", flex: 2, wrap: true }
                ]
              },
              {
                type: "box",
                layout: "horizontal",
                margin: "md",
                contents: [
                  { type: "text", text: "📞 เบอร์โทร", size: "sm", color: "#8c8c8c", flex: 1 },
                  { type: "text", text: lead.phone || "-", size: "sm", color: "#111111", flex: 2, weight: "bold", wrap: true }
                ]
              },
              {
                type: "box",
                layout: "horizontal",
                margin: "md",
                contents: [
                  { type: "text", text: "🏭 ประเภท", size: "sm", color: "#8c8c8c", flex: 1 },
                  { type: "text", text: lead.factoryType || "-", size: "sm", color: "#111111", flex: 2, wrap: true }
                ]
              },
              {
                type: "box",
                layout: "horizontal",
                margin: "md",
                contents: [
                  { type: "text", text: "📍 พื้นที่", size: "sm", color: "#8c8c8c", flex: 1 },
                  { type: "text", text: `${lead.district || '-'} / ${lead.province || '-'}`, size: "sm", color: "#111111", flex: 2, wrap: true }
                ]
              },
              {
                type: "box",
                layout: "horizontal",
                margin: "md",
                contents: [
                  { type: "text", text: "🌐 ช่องทาง", size: "sm", color: "#8c8c8c", flex: 1 },
                  { type: "text", text: lead.contactChannel || "-", size: "sm", color: "#111111", flex: 2, wrap: true }
                ]
              }
            ]
          },

          // Note Box
          {
            type: "box",
            layout: "vertical",
            margin: "md",
            backgroundColor: "#fff0f0",
            paddingAll: "15px",
            cornerRadius: "12px",
            contents: [
              { type: "text", text: "📝 Note:", size: "xs", color: "#8c8c8c" },
              { type: "text", text: lead.note || "-", size: "sm", color: "#555555", wrap: true, margin: "sm" }
            ]
          },

          // Assignment & Action Group
          {
            type: "box",
            layout: "vertical",
            backgroundColor: "#f4f7f6",
            cornerRadius: "12px",
            paddingAll: "15px",
            margin: "md",
            contents: [
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  { type: "text", text: "🏢 ส่งให้แผนก", size: "sm", color: "#8c8c8c", flex: 1 },
                  { type: "text", text: lead.department || "-", size: "sm", color: "#111111", flex: 2, wrap: true }
                ]
              },
              {
                type: "box",
                layout: "horizontal",
                margin: "md",
                contents: [
                  { type: "text", text: "📦 สินค้า", size: "sm", color: "#8c8c8c", flex: 1 },
                  { type: "text", text: lead.product || "-", size: "sm", color: "#e74c3c", weight: "bold", flex: 2, wrap: true }
                ]
              },
              { type: "separator", margin: "lg", color: "#e0e0e0" },
              {
                type: "box",
                layout: "horizontal",
                margin: "lg",
                contents: [
                  {
                    type: "text",
                    text: "ผู้รับเรื่อง:",
                    size: "sm",
                    color: "#8c8c8c",
                    flex: 1,
                    align: "start",
                    gravity: "center"
                  },
                  {
                    type: "text",
                    text: lead.forwardTo || "-",
                    size: "md",
                    color: "#2980b9",
                    weight: "bold",
                    flex: 2,
                    align: "start",
                    gravity: "center"
                  }
                ]
              },
              {
                type: "box",
                layout: "horizontal",
                margin: "lg",
                spacing: "md",
                contents: buttons
              }
            ]
          }
        ]
      }
    }
  };
}

module.exports = { generateFlexMessage };
