const { google } = require('googleapis');

async function getLatestLead() {
  const credentialsBase64 = process.env.GOOGLE_CREDENTIALS_BASE64;
  
  if (!credentialsBase64) {
    throw new Error("GOOGLE_CREDENTIALS_BASE64 is not set");
  }

  const credentialsJson = Buffer.from(credentialsBase64, 'base64').toString('utf8');
  const credentials = JSON.parse(credentialsJson);

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
  });

  const sheets = google.sheets({ version: 'v4', auth });
  
  const spreadsheetId = process.env.SPREADSHEET_ID;
  const sheetName = process.env.SHEET_NAME || 'Sheet1';

  if (!spreadsheetId) {
    throw new Error("SPREADSHEET_ID is not set");
  }

  // Fetch all rows to get the latest one. Alternatively, if the sheet is huge, 
  // we could append a formula, but fetching all is simpler for standard usage.
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:K`, // A to K covers 11 columns
  });

  const rows = response.data.values;
  if (!rows || rows.length <= 1) {
    return null; // No data (assuming row 1 is header)
  }

  // Get the last row
  const lastRow = rows[rows.length - 1];

  // Map columns to fields based on expected order:
  // 0: บริษัท, 1: ชื่อลูกค้า, 2: ประเภทโรงงาน, 3: เบอร์โทร, 4: เขต,
  // 5: จังหวัด, 6: แผนก, 7: สินค้า, 8: Note, 9: ช่องทางติดต่อ, 10: ส่งต่อ
  const lead = {
    company: lastRow[0] || '',
    customerName: lastRow[1] || '',
    factoryType: lastRow[2] || '',
    phone: lastRow[3] || '',
    district: lastRow[4] || '',
    province: lastRow[5] || '',
    department: lastRow[6] || '',
    product: lastRow[7] || '',
    note: lastRow[8] || '',
    contactChannel: lastRow[9] || '',
    forwardTo: lastRow[10] || ''
  };

  return lead;
}

module.exports = { getLatestLead };
