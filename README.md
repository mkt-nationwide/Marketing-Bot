# Marketing Lead LINE Bot (Vercel)

บอทสำหรับดึงข้อมูล Lead ล่าสุดจาก Google Sheets เมื่อผู้ใช้พิมพ์คำว่า "ส่ง Lead"

## การตั้งค่า Environment Variables

คุณต้องตั้งค่าตัวแปรเหล่านี้ใน Vercel Dashboard (Project Settings > Environment Variables) หรือในไฟล์ `.env` (สำหรับการรันทดสอบในเครื่อง):

- `CHANNEL_ACCESS_TOKEN`: Token จาก LINE Developers Console
- `CHANNEL_SECRET`: Secret จาก LINE Developers Console
- `SPREADSHEET_ID`: ID ของ Google Sheet (หาได้จาก URL ระหว่าง `/d/` และ `/edit`)
- `SHEET_NAME`: ชื่อ Sheet ที่เก็บข้อมูล (ค่าเริ่มต้นคือ `Sheet1`)
- `GOOGLE_CREDENTIALS_BASE64`: นำไฟล์ JSON ของ Google Service Account ไปแปลงเป็น Base64 แล้วนำค่ามาใส่ที่นี่

### วิธีการแปลงไฟล์ Google Service Account JSON เป็น Base64 (บน Mac/Linux)
```bash
base64 -i path/to/service-account.json | tr -d '\n'
```

## การนำไปใช้งานบน Vercel

1. Push โค้ดนี้ขึ้น GitHub / GitLab / Bitbucket
2. สร้างโปรเจกต์ใหม่ใน Vercel แล้วเชื่อมต่อกับ Repository
3. ใส่ Environment Variables ทั้งหมดในขั้นตอนการสร้างโปรเจกต์
4. กด Deploy
5. เมื่อ Deploy เสร็จสิ้น ให้นำ URL ที่ได้ (เช่น `https://your-bot.vercel.app/api/webhook`) ไปใส่ใน Webhook URL บนหน้า LINE Developers Console
6. อย่าลืมเปิดใช้งาน **Use webhook** ใน LINE Developers Console ด้วย

## โครงสร้างข้อมูลบน Google Sheets
โปรเจกต์นี้ดึงข้อมูลจากแถวล่าสุด โดยเรียงลำดับคอลัมน์ A-K ดังนี้:
- A: บริษัท
- B: ชื่อลูกค้า
- C: ประเภทโรงงาน
- D: เบอร์โทร
- E: เขต
- F: จังหวัด
- G: แผนก
- H: สินค้า
- I: Note
- J: ช่องทางติดต่อ
- K: ส่งต่อ

*(อย่าลืมแชร์สิทธิ์ Viewer หรือ Editor ให้กับอีเมลของ Google Service Account ที่สร้างขึ้น)*
