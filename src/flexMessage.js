function generateFlexMessage(lead) {
  const rawPhone = lead.phone || "";
  const phoneNumber = rawPhone.replace(/[^0-9]/g, '').slice(0, 10);
  const telUri = phoneNumber ? `tel:${phoneNumber}` : "tel:000";

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
                flex: 0
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

          // Main Info Group (Soft rounded box)
          {
            type: "box",
            layout: "vertical",
            backgroundColor: "#f8f9fa", // Very light gray like the image
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

          // Note Box (Soft rounded box)
          {
            type: "box",
            layout: "vertical",
            margin: "md",
            backgroundColor: "#fff0f0", // Light red/pink to make it stand out softly
            paddingAll: "15px",
            cornerRadius: "12px",
            contents: [
              { type: "text", text: "📝 Note:", size: "xs", color: "#8c8c8c" },
              { type: "text", text: lead.note || "-", size: "sm", color: "#555555", wrap: true, margin: "sm" }
            ]
          },

          // Assignment & Action Group (Soft rounded box)
          {
            type: "box",
            layout: "vertical",
            backgroundColor: "#f4f7f6", // Light green/gray
            cornerRadius: "12px",
            paddingAll: "15px",
            margin: "md",
            contents: [
              {
                type: "box",
                layout: "horizontal",
                contents: [
                  { type: "text", text: "🏢 แผนก", size: "sm", color: "#8c8c8c", flex: 1 },
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
                    text: "ส่งต่อให้:",
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
              // Pill-shaped Button
              {
                type: "box",
                layout: "vertical",
                backgroundColor: "#2ecc71",
                cornerRadius: "30px", // Pill shape
                paddingAll: "12px",
                margin: "lg",
                action: {
                  type: "uri",
                  label: "📞 โทรติดต่อลูกค้า",
                  uri: telUri
                },
                contents: [
                  {
                    type: "text",
                    text: "📞 โทรติดต่อลูกค้า",
                    color: "#ffffff",
                    weight: "bold",
                    align: "center",
                    size: "md"
                  }
                ]
              }
            ]
          }
        ]
      }
    }
  };
}

module.exports = { generateFlexMessage };
