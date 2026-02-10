import { google } from 'googleapis';

export async function appendSubscriber(email: string) {
  try {
    const serviceAccountJson = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    if (!serviceAccountJson) {
      console.warn('GOOGLE_SERVICE_ACCOUNT_JSON environment variable is not set. Skipping Google Sheets update.');
      return;
    }

    if (!spreadsheetId) {
      console.warn('GOOGLE_SHEET_ID environment variable is not set. Skipping Google Sheets update.');
      return;
    }

    // Parse the service account JSON
    let credentials;
    try {
      credentials = JSON.parse(serviceAccountJson);
    } catch (parseError) {
      console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:', parseError);
      throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_JSON format');
    }

    const auth = new google.auth.GoogleAuth({
      credentials,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });

    const date = new Date().toISOString();

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'Subscribers!A:B', // Appends to columns A and B of Subscribers
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[email, date]],
      },
    });

    console.log(`Successfully appended subscriber ${email} to Google Sheet.`);
  } catch (error) {
    console.error('Error appending subscriber to Google Sheet:', error);
    // Rethrow or handle depending on desired behavior. 
    // Here we log and rethrow so the API route knows something went wrong with the integration,
    // though we might not want to fail the user request if just the sheet update fails.
    // For now, let's allow it to bubble up so we can decide in the route handler.
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
      console.warn('GOOGLE_SERVICE_ACCOUNT_JSON environment variable is not set. Skipping Google Sheets update.');
      return;
    }

    if (!spreadsheetId) {
      console.warn('GOOGLE_SHEET_ID environment variable is not set. Skipping Google Sheets update.');
      return;
    }

    // Parse the service account JSON
    let credentials;
    try {
      credentials = JSON.parse(serviceAccountJson);
    } catch (parseError) {
      console.error('Failed to parse GOOGLE_SERVICE_ACCOUNT_JSON:', parseError);
      throw new Error('Invalid GOOGLE_SERVICE_ACCOUNT_JSON format');
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
