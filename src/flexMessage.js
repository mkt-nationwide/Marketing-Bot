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
                flex: 0,
                align: "start"
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
        ],
        backgroundColor: "#2c3e50",
        paddingAll: "20px",
        paddingBottom: "25px"
      },
      body: {
        type: "box",
        layout: "vertical",
        contents: [
          // Person Info Group
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
              { type: "text", text: "🏢 แผนก", size: "sm", color: "#8c8c8c", flex: 1 },
              { type: "text", text: lead.department || "-", size: "sm", color: "#111111", flex: 2, wrap: true }
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
          { type: "separator", margin: "lg", color: "#eeeeee" },
          
          // Factory & Location Info Group
          {
            type: "box",
            layout: "horizontal",
            margin: "lg",
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
          { type: "separator", margin: "lg", color: "#eeeeee" },

          // Product & Channel Group
          {
            type: "box",
            layout: "horizontal",
            margin: "lg",
            contents: [
              { type: "text", text: "📦 สินค้า", size: "sm", color: "#8c8c8c", flex: 1 },
              { type: "text", text: lead.product || "-", size: "sm", color: "#e74c3c", weight: "bold", flex: 2, wrap: true }
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
          },
          
          // Note Box
          {
            type: "box",
            layout: "vertical",
            margin: "lg",
            contents: [
              { type: "text", text: "📝 Note:", size: "xs", color: "#8c8c8c" },
              { type: "text", text: lead.note || "-", size: "sm", color: "#555555", wrap: true, margin: "sm" }
            ],
            backgroundColor: "#f8f9fa",
            paddingAll: "10px",
            cornerRadius: "8px"
          }
        ],
        paddingAll: "20px"
      },
      footer: {
        type: "box",
        layout: "vertical",
        spacing: "sm",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              {
                type: "text",
                text: "ส่งต่อให้:",
                size: "sm",
                color: "#8c8c8c",
                flex: 0,
                margin: "sm",
                align: "center",
                gravity: "center"
              },
              {
                type: "text",
                text: lead.forwardTo || "-",
                size: "md",
                color: "#2980b9",
                weight: "bold",
                align: "start",
                gravity: "center",
                margin: "md"
              }
            ],
            justifyContent: "center"
          },
          {
            type: "button",
            style: "primary",
            color: "#2ecc71",
            margin: "md",
            action: {
              type: "uri",
              label: "📞 โทรติดต่อลูกค้า",
              uri: telUri
            }
          }
        ],
        paddingAll: "15px",
        backgroundColor: "#ecf0f1"
      },
      styles: {
        header: { backgroundColor: "#2c3e50" },
        footer: { separator: false }
      }
    }
  };
}

module.exports = { generateFlexMessage };
