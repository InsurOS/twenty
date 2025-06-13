import axios from 'axios';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// --- CONFIG ---
const RABBITSIGN_API_KEY_ID = process.env.RABBITSIGN_API_KEY_ID || '';
const RABBITSIGN_API_KEY_SECRET = process.env.RABBITSIGN_API_KEY_SECRET || '';
const PDF_PATH = process.argv[2] || 'test.pdf'; // Pass PDF path as first arg

function getCurrentUtcTime() {
  return new Date().toISOString().split('.')[0] + 'Z';
}

function getTodayInLocalTimezone() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function sha512(input: string): string {
  return crypto.createHash('sha512').update(input, 'utf8').digest('hex').toUpperCase();
}

async function main() {
  if (!RABBITSIGN_API_KEY_ID || !RABBITSIGN_API_KEY_SECRET) {
    console.error('Set RABBITSIGN_API_KEY_ID and RABBITSIGN_API_KEY_SECRET in env');
    process.exit(1);
  }
  if (!fs.existsSync(PDF_PATH)) {
    console.error('PDF file not found:', PDF_PATH);
    process.exit(1);
  }
  // --- Step 1: Get upload URL ---
  const path1 = '/api/v1/upload-url';
  const httpMethod1 = 'POST';
  const utcTime1 = getCurrentUtcTime();
  const signature1 = sha512(`${httpMethod1} ${path1} ${utcTime1} ${RABBITSIGN_API_KEY_SECRET}`);
  const headers1 = {
    'x-rabbitsign-api-key-id': RABBITSIGN_API_KEY_ID,
    'x-rabbitsign-api-signature': signature1,
    'x-rabbitsign-api-time-utc': utcTime1,
  };
  console.log('Requesting upload URL...');
  const uploadUrlResp = await axios.post('https://www.rabbitsign.com/api/v1/upload-url', null, { headers: headers1 });
  const uploadUrl = uploadUrlResp.data.uploadUrl;
  console.log('Upload URL:', uploadUrl);

  // --- Step 2: Upload PDF ---
  const pdfBuffer = fs.readFileSync(PDF_PATH);
  console.log('Uploading PDF...');
  await axios.put(uploadUrl, pdfBuffer, { headers: { 'Content-Type': 'binary/octet-stream' } });
  console.log('PDF uploaded.');

  // --- Step 3: Create folder (signing request) ---
  const path2 = '/api/v1/folder';
  const httpMethod2 = 'POST';
  const utcTime2 = getCurrentUtcTime();
  const signature2 = sha512(`${httpMethod2} ${path2} ${utcTime2} ${RABBITSIGN_API_KEY_SECRET}`);
  const headers2 = {
    'x-rabbitsign-api-key-id': RABBITSIGN_API_KEY_ID,
    'x-rabbitsign-api-signature': signature2,
    'x-rabbitsign-api-time-utc': utcTime2,
    'Content-Type': 'application/json',
  };
  const body2 = {
    folder: {
      title: path.basename(PDF_PATH),
      summary: 'Sent via API',
      docInfo: [
        {
          url: uploadUrl,
          docTitle: path.basename(PDF_PATH),
        },
      ],
      signerInfo: {
        "jordan@insuros.ca": {
          name: "Jordan",
          fields: [
            {
              id: 1,
              type: "SIGNATURE",
              currentValue: "",
              position: {
                docNumber: 0,
                pageIndex: 0,
                x: 100,
                y: 100,
                width: 120,
                height: 40,
              },
            },
          ],
        },
        "ronnie@insuros.ca": {
          name: "Ronnie",
          fields: [
            {
              id: 2,
              type: "SIGNATURE",
              currentValue: "",
              position: {
                docNumber: 0,
                pageIndex: 0,
                x: 100,
                y: 200, // Different Y position for Ronnie
                width: 120,
                height: 40,
              },
            },
          ],
        },
      },
    },
    date: getTodayInLocalTimezone(),
  };
  console.log('Creating folder (signing request)...');
  const folderResp = await axios.post('https://www.rabbitsign.com/api/v1/folder', body2, { headers: headers2 });
  console.log('Folder created! Response:', folderResp.data);
}

main().catch((err) => {
  console.error('Error:', err?.response?.data || err);
  process.exit(1);
}); 