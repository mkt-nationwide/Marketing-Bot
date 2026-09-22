const { google } = require('googleapis');

async function getLeads(options = {}) {
  const { department, limit = 1 } = options;
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
    return [];
  }

  // Parse all rows (skipping header)
  let allLeads = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    
    // Skip completely empty rows
    if (!row || row.length === 0) continue;

    // Combine products from columns K(10) to O(14)
    const products = [row[10], row[11], row[12], row[13], row[14]]
      .filter(Boolean)
      .join(', ');

    allLeads.push({
      timestamp: row[0] || '',
      company: row[1] || '',
      customerName: row[2] || '',
      phone: row[3] || '',
      district: row[4] || '',
      province: row[5] || '',
      contactChannel: row[6] || '',
      forwardTo: row[7] || '',
      factoryType: row[8] || '',
      department: row[9] || '',
      product: products || '-',
      note: row[16] || ''
    });
  }

  // Filter by department if specified
  if (department) {
    const searchDept = department.toLowerCase();
    allLeads = allLeads.filter(lead => 
      lead.department && lead.department.toLowerCase().includes(searchDept)
    );
  }

  // Take the last N rows (latest)
  return allLeads.slice(-limit);
}

// Keep getLatestLead for backwards compatibility if needed, but we'll migrate webhook to use getLeads
async function getLatestLead() {
  const leads = await getLeads({ limit: 1 });
  return leads.length > 0 ? leads[0] : null;
}

module.exports = { getLeads, getLatestLead };
