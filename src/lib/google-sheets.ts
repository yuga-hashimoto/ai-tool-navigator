import { google } from 'googleapis';

export async function appendSubscriber(email: string) {
  try {
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!serviceAccountJson) {
      const errorMsg = 'GOOGLE_SERVICE_ACCOUNT_JSON environment variable is not set. Google Sheets integration is disabled.';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    if (!spreadsheetId) {
      const errorMsg = 'GOOGLE_SHEET_ID environment variable is not set. Google Sheets integration is disabled.';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    // Parse the service account JSON
    let credentials;
    try {
      credentials = JSON.parse(serviceAccountJson);
    } catch (parseError) {
      console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:', parseError);
      throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_JSON format: JSON parse failed');
    }

    // Basic validation of credentials structure
    if (!credentials.client_email || !credentials.private_key) {
      console.error('GOOGLE_SERVICE_ACCOUNT_JSON is missing client_email or private_key');
      throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_JSON format: missing required fields');
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const date = new Date().toISOString();

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Sheet1!A:B', // Appends to columns A and B of Sheet1
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[email, date]],
      },
    });

    console.log(`Successfully appended subscriber ${email} to Google Sheet.`);
  } catch (error) {
    console.error('Error appending subscriber to Google Sheet:', error);
    // Rethrow so the caller knows the operation failed
    throw error;
  }
}

export interface ToolSubmissionData {
  name: string;
  url: string;
  description: string;
  category: string;
}

export async function appendToolSubmission(data: ToolSubmissionData) {
  try {
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!serviceAccountJson) {
      const errorMsg = 'GOOGLE_SERVICE_ACCOUNT_JSON environment variable is not set. Google Sheets integration is disabled.';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    if (!spreadsheetId) {
      const errorMsg = 'GOOGLE_SHEET_ID environment variable is not set. Google Sheets integration is disabled.';
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    // Parse the service account JSON
    let credentials;
    try {
      credentials = JSON.parse(serviceAccountJson);
    } catch (parseError) {
      console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:', parseError);
      throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_JSON format: JSON parse failed');
    }

    // Basic validation of credentials structure
    if (!credentials.client_email || !credentials.private_key) {
      console.error('GOOGLE_SERVICE_ACCOUNT_JSON is missing client_email or private_key');
      throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_JSON format: missing required fields');
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const date = new Date().toISOString();

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Submissions!A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[data.name, data.url, data.description, data.category, date]],
      },
    });

    console.log(`Successfully appended tool submission ${data.name} to Google Sheet.`);
  } catch (error) {
    console.error('Error appending tool submission to Google Sheet:', error);
    throw error;
  }
}
