function generateFlexMessage(lead) {
  return {
    type: "flex",
    altText: "New Marketing Lead",
    contents: {
      type: "bubble",
      size: "kilo",
      header: {
        type: "box",
        layout: "vertical",
        contents: [
          {
            type: "text",
            text: "New Marketing Lead",
            weight: "bold",
            color: "#ffffff",
            size: "xl"
          }
        ],
        backgroundColor: "#1DB446"
      },
      body: {
        type: "box",
        layout: "vertical",
        spacing: "md",
        contents: [
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: "บริษัท", size: "sm", color: "#aaaaaa", flex: 1 },
              { type: "text", text: lead.company || "-", size: "sm", color: "#666666", flex: 2, wrap: true }
            ]
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: "ชื่อลูกค้า", size: "sm", color: "#aaaaaa", flex: 1 },
              { type: "text", text: lead.customerName || "-", size: "sm", color: "#666666", flex: 2, wrap: true }
            ]
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: "ประเภทโรงงาน", size: "sm", color: "#aaaaaa", flex: 1 },
              { type: "text", text: lead.factoryType || "-", size: "sm", color: "#666666", flex: 2, wrap: true }
            ]
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: "เบอร์โทร", size: "sm", color: "#aaaaaa", flex: 1 },
              { type: "text", text: lead.phone || "-", size: "sm", color: "#666666", flex: 2, wrap: true }
            ]
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: "เขต", size: "sm", color: "#aaaaaa", flex: 1 },
              { type: "text", text: lead.district || "-", size: "sm", color: "#666666", flex: 2, wrap: true }
            ]
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: "จังหวัด", size: "sm", color: "#aaaaaa", flex: 1 },
              { type: "text", text: lead.province || "-", size: "sm", color: "#666666", flex: 2, wrap: true }
            ]
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: "แผนก", size: "sm", color: "#aaaaaa", flex: 1 },
              { type: "text", text: lead.department || "-", size: "sm", color: "#666666", flex: 2, wrap: true }
            ]
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: "สินค้า", size: "sm", color: "#aaaaaa", flex: 1 },
              { type: "text", text: lead.product || "-", size: "sm", color: "#666666", flex: 2, wrap: true }
            ]
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: "Note", size: "sm", color: "#aaaaaa", flex: 1 },
              { type: "text", text: lead.note || "-", size: "sm", color: "#666666", flex: 2, wrap: true }
            ]
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: "ช่องทางติดต่อ", size: "sm", color: "#aaaaaa", flex: 1 },
              { type: "text", text: lead.contactChannel || "-", size: "sm", color: "#666666", flex: 2, wrap: true }
            ]
          },
          {
            type: "box",
            layout: "horizontal",
            contents: [
              { type: "text", text: "ส่งต่อ", size: "sm", color: "#aaaaaa", flex: 1 },
              { type: "text", text: lead.forwardTo || "-", size: "sm", color: "#666666", flex: 2, wrap: true }
            ]
          }
        ]
      }
    }
  };
}

module.exports = { generateFlexMessage };
