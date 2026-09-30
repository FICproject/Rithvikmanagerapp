const http = require('http');

const BASE_URL = 'http://localhost:3000';

function makeRequest(path, method = 'GET', body = null, token = null) {
  return new Promise((resolve, reject) => {
    const parsed = new URL(`${BASE_URL}${path}`);
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: parsed.hostname,
        port: parsed.port,
        path: parsed.pathname + parsed.search,
        method,
        headers,
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          const buffer = Buffer.concat(chunks);
          const contentType = res.headers['content-type'] || '';
          if (contentType.includes('application/json')) {
            try {
              resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(buffer.toString('utf8')), buffer });
            } catch (e) {
              resolve({ status: res.statusCode, headers: res.headers, body: buffer.toString('utf8'), buffer });
            }
          } else {
            resolve({ status: res.statusCode, headers: res.headers, buffer, length: buffer.length });
          }
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runExportTests() {
  console.log('=== TESTING REAL REPORTS EXPORT ENDPOINTS ===');

  // 1. Login as Ramesh (State Manager TN)
  const loginRes = await makeRequest('/api/v1/auth/login', 'POST', { username: 'ramesh.state@forgeindia.in' });
  const tokenTN = loginRes.body.data.token;
  console.log('1. Authenticated State Manager TN. Status:', loginRes.status);

  // 2. Export CSV for Today
  const csvRes = await makeRequest('/api/v1/reports/export', 'POST', { format: 'CSV', period: 'TODAY' }, tokenTN);
  console.log('2. Export CSV Today Status:', csvRes.status, 'Filename:', csvRes.body.data.fileName, 'Records:', csvRes.body.data.recordCount);
  if (!csvRes.body.data.downloadUrl) throw new Error('Missing downloadUrl in CSV export');

  // Download raw CSV
  const csvDownload = await makeRequest(`/api/v1/reports/download/${csvRes.body.data.fileName}`);
  console.log('   Downloaded CSV bytes:', csvDownload.buffer.length, 'Content-Type:', csvDownload.headers['content-type']);
  const csvText = csvDownload.buffer.toString('utf8');
  console.log('   CSV Header check:', csvText.split('\n')[0]);
  console.log('   CSV Row count:', csvText.trim().split('\n').length - 1);

  // 3. Export Excel (.xlsx) for This Month
  const excelRes = await makeRequest('/api/v1/reports/export', 'POST', { format: 'EXCEL', period: 'THIS_MONTH' }, tokenTN);
  console.log('3. Export Excel This Month Status:', excelRes.status, 'Filename:', excelRes.body.data.fileName, 'Records:', excelRes.body.data.recordCount);
  const excelDownload = await makeRequest(`/api/v1/reports/download/${excelRes.body.data.fileName}`);
  console.log('   Downloaded Excel bytes:', excelDownload.buffer.length, 'Content-Type:', excelDownload.headers['content-type']);
  // Check XLSX magic bytes: PK\x03\x04 (zip archive)
  const isZip = excelDownload.buffer[0] === 0x50 && excelDownload.buffer[1] === 0x4b;
  console.log('   Valid XLSX zip header:', isZip);
  if (!isZip) throw new Error('Excel file is not a valid zip/xlsx archive!');

  // 4. Export PDF for Custom Dates (2026-09-01 to 2026-09-30)
  const pdfRes = await makeRequest('/api/v1/reports/export', 'POST', {
    format: 'PDF',
    period: 'CUSTOM',
    startDate: '2026-09-01',
    endDate: '2026-09-30',
  }, tokenTN);
  console.log('4. Export PDF Custom Dates Status:', pdfRes.status, 'Filename:', pdfRes.body.data.fileName, 'Records:', pdfRes.body.data.recordCount);
  const pdfDownload = await makeRequest(`/api/v1/reports/download/${pdfRes.body.data.fileName}`);
  console.log('   Downloaded PDF bytes:', pdfDownload.buffer.length, 'Content-Type:', pdfDownload.headers['content-type']);
  const isPdf = pdfDownload.buffer.slice(0, 4).toString() === '%PDF';
  console.log('   Valid PDF magic header (%PDF):', isPdf);
  if (!isPdf) throw new Error('PDF file is not a valid binary PDF document!');

  // 5. Test Scope Hierarchy Enforcement: MP Manager Rajesh only exports MP visits
  const loginMP = await makeRequest('/api/v1/auth/login', 'POST', { username: 'rajesh.division@forgeindia.in' });
  const tokenMP = loginMP.body.data.token;
  const mpExport = await makeRequest('/api/v1/reports/export', 'POST', { format: 'CSV', period: 'THIS_MONTH' }, tokenMP);
  console.log('5. MP Manager export Status:', mpExport.status, 'Records in MP Scope:', mpExport.body.data.recordCount);
  if (mpExport.body.data.recordCount !== 1) throw new Error(`Expected exactly 1 MP visit for Rajesh, got ${mpExport.body.data.recordCount}`);

  // 6. Test Invalid Custom Date Range (End date < Start date)
  const invalidDateRes = await makeRequest('/api/v1/reports/export', 'POST', {
    format: 'PDF',
    period: 'CUSTOM',
    startDate: '2026-09-30',
    endDate: '2026-09-01',
  }, tokenTN);
  console.log('6. Invalid Date Range Status (Expected 400):', invalidDateRes.status, invalidDateRes.body?.error?.code);
  if (invalidDateRes.status !== 400) throw new Error('Expected 400 for invalid date range');

  console.log('=== ALL REAL REPORT EXPORT TESTS PASSED SUCCESSFULLY! ===');
}

runExportTests().catch((err) => {
  console.error('Test failed:', err);
  process.exit(1);
});
