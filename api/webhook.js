const line = require('@line/bot-sdk');
const { getLeads } = require('../src/googleSheets');
const { generateFlexMessage } = require('../src/flexMessage');

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || 'dummy'
});

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    const events = req.body.events;
    
    if (!events || events.length === 0) {
      return res.status(200).json({});
    }

    const results = await Promise.all(events.map(handleEvent));
    return res.status(200).json(results);
  } catch (err) {
    console.error('Error handling webhook:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
};

async function handleEvent(event) {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const text = event.message.text.trim().toLowerCase();

  const triggers = [
    'ส่ง lead', 'ส่ง หลีด', 'ส่ง ลีด', 'ส่ง หรีด', 'ส่ง รีด',
    'ส่งlead', 'ส่งหลีด', 'ส่งลีด', 'ส่งหรีด', 'ส่งรีด'
  ];

  const matchedTrigger = triggers.find(t => text.startsWith(t));

  if (matchedTrigger) {
    try {
      // Parse department and limit
      const remainder = text.slice(matchedTrigger.length).trim();
      const parts = remainder.split(/\s+/).filter(Boolean);
      
      let department = '';
      let limit = 1;

      if (parts.length > 0) {
        const lastPart = parts[parts.length - 1];
        if (!isNaN(lastPart)) {
          limit = parseInt(lastPart, 10);
          department = parts.slice(0, -1).join(' ');
        } else {
          department = parts.join(' ');
        }
      }

      // Max 5 for LINE array limit
      limit = Math.min(Math.max(limit, 1), 5);

      const leads = await getLeads({ department, limit });
      
      if (!leads || leads.length === 0) {
        return client.replyMessage({
          replyToken: event.replyToken,
          messages: [{
            type: 'text',
            text: department 
              ? `ไม่พบข้อมูล Lead ล่าสุดสำหรับแผนก "${department}" ค่ะ` 
              : 'ไม่พบข้อมูล Lead ในระบบค่ะ'
          }]
        });
      }

      // Create an array of individual flex messages
      const replyMessages = leads.map(lead => {
        return {
          type: 'flex',
          altText: '🎉 New Marketing Lead',
          contents: generateFlexMessage(lead).contents
        };
      });

      return client.replyMessage({
        replyToken: event.replyToken,
        messages: replyMessages
      });
    } catch (error) {
      console.error('Error fetching leads:', error);
      return client.replyMessage({
        replyToken: event.replyToken,
        messages: [{
          type: 'text',
          text: 'เกิดข้อผิดพลาดในการดึงข้อมูลจาก Google Sheets ค่ะ'
        }]
      });
    }
  }

  return Promise.resolve(null);
}
