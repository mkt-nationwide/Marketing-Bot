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
  const sheetName = process.env.SHEET_NAME || 'การตอบแบบฟอร์ม 4';

  if (!spreadsheetId) {
    throw new Error("SPREADSHEET_ID is not set");
  }

  // Fetch from A to Q (17 columns)
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `'${sheetName}'!A:Q`,
  });

  const rows = response.data.values;
  if (!rows || rows.length <= 1) {
    return null;
  }

  const lastRow = rows[rows.length - 1];

  // Combine products from columns K(10) to O(14)
  const products = [lastRow[10], lastRow[11], lastRow[12], lastRow[13], lastRow[14]]
    .filter(Boolean) // Remove empty values
    .join(', ');

  const lead = {
    timestamp: lastRow[0] || '',
    company: lastRow[1] || '',
    customerName: lastRow[2] || '',
    phone: lastRow[3] || '',
    district: lastRow[4] || '',
    province: lastRow[5] || '',
    contactChannel: lastRow[6] || '',
    forwardTo: lastRow[7] || '',
    factoryType: lastRow[8] || '',
    department: lastRow[9] || '',
    product: products || '-',
    note: lastRow[16] || ''
  };

  return lead;
}

module.exports = { getLatestLead };
