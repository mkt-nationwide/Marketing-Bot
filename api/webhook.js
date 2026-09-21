const line = require('@line/bot-sdk');
const { getLatestLead } = require('../src/googleSheets');
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

  const text = event.message.text.trim();

  if (text === 'ส่ง Lead') {
    try {
      const lead = await getLatestLead();
      
      if (!lead) {
        return client.replyMessage({
          replyToken: event.replyToken,
          messages: [{
            type: 'text',
            text: 'ไม่พบข้อมูล Lead ในระบบค่ะ'
          }]
        });
      }

      const flexMessage = generateFlexMessage(lead);
      return client.replyMessage({
        replyToken: event.replyToken,
        messages: [flexMessage]
      });
    } catch (error) {
      console.error('Error fetching lead:', error);
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
