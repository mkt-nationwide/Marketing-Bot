const { google } = require('googleapis');
const fs = require('fs');

async function main() {
  try {
    const creds = JSON.parse(fs.readFileSync('/Users/nationwide-editor/Downloads/marketing-line-bot-dc58b9957524.json', 'utf8'));
    const auth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.get({
      spreadsheetId: '1LkjLgL13wNrPc7yz7zIZUUR-AykbaZ6MDdhgL1SCZxs'
    });

    const sheet = response.data.sheets.find(s => s.properties.sheetId === 1341823839);
    if (sheet) {
      console.log('SHEET_NAME_IS:' + sheet.properties.title);
    } else {
      console.log('SHEET_NOT_FOUND');
    }
  } catch (e) {
    console.error(e.message);
  }
}

main();
