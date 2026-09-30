const line = require('@line/bot-sdk');
const { getLeads } = require('../src/googleSheets');
const { generateFlexMessage } = require('../src/flexMessage');
const { GoogleGenAI } = require('@google/genai');

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || 'dummy'
});

// Initialize Gemini AI
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || 'dummy' 
});

module.exports = async function handler(req, res) {
  // Handle GET requests for LIFF Share Target Picker
  if (req.method === 'GET') {
    if (req.query.noliff) {
      return res.status(400).send("กรุณาตั้งค่า LIFF_ID ใน Vercel Environment Variables ก่อนใช้งานฟีเจอร์ส่งต่อครับ");
    }

    const html = `
    <!DOCTYPE html>
    <html lang="th">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>กำลังเตรียมข้อมูล...</title>
      <script src="https://static.line-scdn.net/liff/edge/2/sdk.js"></script>
    </head>
    <body style="font-family: sans-serif; text-align: center; padding-top: 50px;">
      <h2>กำลังเปิดหน้าต่างแชร์...</h2>
      <p>กรุณารอสักครู่</p>
      <script>
        async function main() {
          try {
            await liff.init({ liffId: "${process.env.LIFF_ID || ''}" });
            if (!liff.isLoggedIn()) {
              liff.login();
              return;
            }

            const urlParams = new URLSearchParams(window.location.search);
            const dataStr = urlParams.get('data');
            if (!dataStr) {
              alert('ไม่พบข้อมูลสำหรับแชร์');
              return;
            }

            const b64 = decodeURIComponent(dataStr);
            const binaryStr = atob(b64);
            const bytes = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) {
              bytes[i] = binaryStr.charCodeAt(i);
            }
            const utf8Str = new TextDecoder('utf-8').decode(bytes);
            const leadData = JSON.parse(utf8Str);

            const response = await fetch(window.location.pathname, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'generateFlex', lead: leadData })
            });

            const flexMsg = await response.json();

            if (liff.isApiAvailable('shareTargetPicker')) {
              await liff.shareTargetPicker([flexMsg]);
              liff.closeWindow();
            } else {
              alert('อุปกรณ์ของคุณไม่รองรับการแชร์แบบนี้ครับ');
            }
          } catch (err) {
            console.error(err);
            alert('เกิดข้อผิดพลาดในการแชร์: ' + err.message);
          }
        }
        main();
      </script>
    </body>
    </html>
    `;
    return res.status(200).setHeader('Content-Type', 'text/html').send(html);
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // Check if it's an internal call from LIFF to generate Flex JSON
    if (req.body.action === 'generateFlex' && req.body.lead) {
      const flexJSON = generateFlexMessage(req.body.lead, { isShared: true });
      return res.status(200).json(flexJSON);
    }

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

  // 1. Check for Lead generation command
  const triggers = [
    'ส่ง lead', 'ส่ง หลีด', 'ส่ง ลีด', 'ส่ง หรีด', 'ส่ง รีด',
    'ส่งlead', 'ส่งหลีด', 'ส่งลีด', 'ส่งหรีด', 'ส่งรีด'
  ];

  const matchedTrigger = triggers.find(t => text.startsWith(t));

  if (matchedTrigger) {
    try {
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

  // 2. Check for Gemini AI Mention
  if (text.includes('@marketing bot')) {
    try {
      const prompt = text.replace(/@marketing bot/g, '').trim();
      const allLeads = await getLeads({ limit: 100000 });
      const contextData = JSON.stringify(allLeads, null, 2);
      
      const systemInstruction = `คุณคือ AI ผู้ช่วยอัจฉริยะชื่อ Marketing Bot หน้าที่ของคุณคือการช่วยสรุป วิเคราะห์ และตอบคำถามเกี่ยวกับฐานข้อมูลลูกค้า (Lead) ของบริษัท
      
ข้อมูลด้านล่างนี้คือรายชื่อลูกค้าทั้งหมดจากระบบ เพื่อใช้เป็นบริบทในการตอบคำถาม:
\`\`\`json
${contextData}
\`\`\`

ข้อควรระวัง: 
- ให้ตอบคำถามโดยอิงจากข้อมูลนี้เป็นหลัก หากข้อมูลมีไม่เพียงพอให้บอกตามตรง
- ตอบด้วยภาษาไทยที่สุภาพ เป็นมืออาชีพ แต่อ่านง่าย ไม่ต้องยาวเกินไป`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.5-flash-lite',
        contents: prompt || 'สรุปข้อมูลลูกค้าล่าสุดให้ฟังหน่อย',
        config: {
          systemInstruction: systemInstruction
        }
      });

      const replyText = response.text || 'ขออภัยค่ะ ฉันไม่สามารถตอบคำถามนี้ได้';

      return client.replyMessage({
        replyToken: event.replyToken,
        messages: [{
          type: 'text',
          text: replyText,
          quickReply: {
            items: [
              {
                type: 'action',
                action: {
                  type: 'message',
                  label: 'วิเคราะห์เพิ่มเติม',
                  text: '@Marketing Bot ขอคำอธิบายเพิ่มเติมหน่อย'
                }
              },
              {
                type: 'action',
                action: {
                  type: 'message',
                  label: 'สรุปแบ่งตามแผนก',
                  text: '@Marketing Bot ช่วยสรุปลูกค้าแบ่งตามแผนกให้หน่อย'
                }
              },
              {
                type: 'action',
                action: {
                  type: 'message',
                  label: 'ดู 3 รายการล่าสุด',
                  text: 'ส่งหลีด 3'
                }
              }
            ]
          }
        }]
      });
    } catch (error) {
      console.error('Error generating AI content:', error);
      return client.replyMessage({
        replyToken: event.replyToken,
        messages: [{
          type: 'text',
          text: 'ขออภัยค่ะ ระบบ AI ขัดข้องชั่วคราว ไม่สามารถตอบคำถามได้ในขณะนี้'
        }]
      });
    }
  }

  return Promise.resolve(null);
}
