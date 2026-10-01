const line = require('@line/bot-sdk');
const { getLeads } = require('../src/googleSheets');
const { generateFlexMessage } = require('../src/flexMessage');
const { GoogleGenAI } = require('@google/genai');

const client = new line.messagingApi.MessagingApiClient({
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || 'dummy'
});

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || 'dummy' 
});

module.exports = async function handler(req, res) {
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
      <style>
        body { font-family: sans-serif; text-align: center; padding-top: 50px; background: #f5f6fa; }
        .checkmark__circle {
          stroke-dasharray: 166; stroke-dashoffset: 166; stroke-width: 2; stroke-miterlimit: 10; stroke: #4bb71b; fill: none;
          animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }
        .checkmark {
          width: 80px; height: 80px; border-radius: 50%; display: block; stroke-width: 2; stroke: #fff; stroke-miterlimit: 10; margin: 20px auto;
          box-shadow: inset 0px 0px 0px #4bb71b;
          animation: fill .4s ease-in-out .4s forwards, scale .3s ease-in-out .9s both;
        }
        .checkmark__check {
          transform-origin: 50% 50%; stroke-dasharray: 48; stroke-dashoffset: 48;
          animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
        }
        @keyframes stroke { 100% { stroke-dashoffset: 0; } }
        @keyframes scale { 0%, 100% { transform: none; } 50% { transform: scale3d(1.1, 1.1, 1); } }
        @keyframes fill { 100% { box-shadow: inset 0px 0px 0px 50px #4bb71b; } }
      </style>
    </head>
    <body>
      <div id="content">
        <h2 style="color: #2c3e50;">พร้อมส่งต่อข้อมูล</h2>
        <p style="color: #7f8c8d;">ระบบดึงข้อมูลเสร็จสิ้น กรุณากดปุ่มด้านล่างเพื่อเลือกผู้รับ</p>
        <button id="shareBtn" style="background-color: #3498db; color: white; padding: 15px 30px; border: none; border-radius: 30px; font-size: 16px; font-weight: bold; margin-top: 20px; cursor: pointer; display: none;">📤 กดเพื่อเลือกเพื่อนที่จะแชร์</button>
      </div>
      <script>
        let flexMessageData = null;

        async function shareFlex() {
          try {
            if (liff.isApiAvailable('shareTargetPicker')) {
              const res = await liff.shareTargetPicker([flexMessageData]);
              if (res) {
                document.getElementById('content').innerHTML = \`
                  <svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
                    <circle class="checkmark__circle" cx="26" cy="26" r="25" fill="none"/>
                    <path class="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
                  </svg>
                  <h2 style="color: #4bb71b; margin-top: 20px;">ส่งต่อสำเร็จ!</h2>
                \`;
                setTimeout(() => liff.closeWindow(), 2000);
              } else {
                liff.closeWindow();
              }
            } else {
              alert('อุปกรณ์ของคุณไม่รองรับการแชร์แบบนี้ครับ');
            }
          } catch (err) {
            console.error(err);
            alert('เกิดข้อผิดพลาดในการแชร์: ' + (err.message || JSON.stringify(err, Object.getOwnPropertyNames(err))));
          }
        }

        async function main() {
          try {
            await liff.init({ liffId: "${process.env.LIFF_ID || ''}" });
            if (!liff.isLoggedIn()) {
              liff.login({ redirectUri: window.location.href });
              return;
            }

            const urlParams = new URLSearchParams(window.location.search);
            const rowStr = urlParams.get('row');
            if (!rowStr) {
              alert('ไม่พบข้อมูลสำหรับแชร์');
              return;
            }

            const response = await fetch(window.location.pathname, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ action: 'generateFlexByRow', row: parseInt(rowStr, 10) })
            });

            if (!response.ok) {
              throw new Error('โหลดข้อมูลไม่สำเร็จ (HTTP ' + response.status + ')');
            }

            flexMessageData = await response.json();
            
            const shareBtn = document.getElementById('shareBtn');
            shareBtn.style.display = 'inline-block';
            shareBtn.onclick = shareFlex;

            if (liff.isInClient()) {
              shareFlex();
            }
          } catch (err) {
            console.error(err);
            alert('เกิดข้อผิดพลาดในการโหลดข้อมูล: ' + err.message);
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
    if (req.body.action === 'generateFlexByRow' && typeof req.body.row === 'number') {
      const allLeads = await getLeads({ limit: 100000 });
      const lead = allLeads.find(l => l.rowIndex === req.body.row);
      if (!lead) {
        return res.status(404).json({ error: "ไม่พบข้อมูล Lead ในแถวนี้" });
      }
      const flexJSON = generateFlexMessage(lead, { isShared: true });
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

  if (text.includes('@marketing bot')) {
    try {
      const prompt = text.replace(/@marketing bot/g, '').trim();
      const allLeads = await getLeads({ limit: 100000 });
      const contextData = JSON.stringify(allLeads.map(l => {
        // Exclude rowIndex from AI context to save tokens
        const { rowIndex, ...rest } = l;
        return rest;
      }), null, 2);
      
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
