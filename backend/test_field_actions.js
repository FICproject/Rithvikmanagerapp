const http = require('http');
const { io } = require('socket.io-client');

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
        let data = '';
        res.on('data', (c) => (data += c));
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, body: data });
          }
        });
      }
    );
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('=== STARTING FIELD ACTIONS BACKEND SUITE ===');

  // Test 1: Login as Tamil Nadu State Manager (Ramesh)
  const loginRes = await makeRequest('/api/v1/auth/login', 'POST', { username: 'ramesh.state@forgeindia.in' });
  console.log('1. Login Status:', loginRes.status);
  const tokenTN = loginRes.body.data.token;
  if (!tokenTN) throw new Error('Failed to obtain JWT token for Ramesh');
  console.log('   Obtained valid JWT for Ramesh (State Manager TN):', tokenTN.slice(0, 25) + '...');

  // Test 2: Login as MP Division Manager (Rajesh)
  const loginMPRes = await makeRequest('/api/v1/auth/login', 'POST', { username: 'rajesh.division@forgeindia.in' });
  const tokenMP = loginMPRes.body.data.token;
  console.log('2. Obtained JWT for Rajesh (Division Manager MP):', tokenMP.slice(0, 25) + '...');

  // Test 3: Fetch Vendor within TN scope by Ramesh (Should Succeed 200)
  const vendorRes = await makeRequest('/api/v1/vendors/v-201', 'GET', null, tokenTN);
  console.log('3. TN Manager fetching TN Vendor v-201 Status:', vendorRes.status);
  console.log('   Vendor phone:', vendorRes.body.data.phone, 'Coordinates:', vendorRes.body.data.latitude, vendorRes.body.data.longitude);
  if (vendorRes.status !== 200) throw new Error('Expected 200 for authorized vendor access');

  // Test 4: Scope Enforcement - Ramesh (TN) tries to access MP vendor v-204 (Must return 403 Forbidden)
  const forbiddenVendorRes = await makeRequest('/api/v1/vendors/v-204', 'GET', null, tokenTN);
  console.log('4. TN Manager fetching MP Vendor v-204 Status:', forbiddenVendorRes.status);
  console.log('   Expected 403:', forbiddenVendorRes.body);
  if (forbiddenVendorRes.status !== 403) throw new Error('Expected 403 for unauthorized territory access');

  // Test 5: Rajesh (MP) fetching MP vendor v-204 (Should Succeed 200)
  const mpVendorRes = await makeRequest('/api/v1/vendors/v-204', 'GET', null, tokenMP);
  console.log('5. MP Manager fetching MP Vendor v-204 Status:', mpVendorRes.status);
  if (mpVendorRes.status !== 200) throw new Error('Expected 200 for MP manager accessing MP vendor');

  // Test 6: Fetch Task t-301 by Ramesh (TN)
  const taskRes = await makeRequest('/api/v1/tasks/t-301', 'GET', null, tokenTN);
  console.log('6. Task t-301 Contact:', taskRes.body.data.contactName, 'Phone:', taskRes.body.data.contactPhone, 'Coords:', taskRes.body.data.latitude, taskRes.body.data.longitude);
  if (taskRes.status !== 200) throw new Error('Expected 200 for task t-301');

  // Test 7: Scope Enforcement on Tasks - Ramesh (TN) accessing MP task t-303 (Must return 403 Forbidden)
  const forbiddenTaskRes = await makeRequest('/api/v1/tasks/t-303', 'GET', null, tokenTN);
  console.log('7. TN Manager fetching MP Task t-303 Status:', forbiddenTaskRes.status);
  if (forbiddenTaskRes.status !== 403) throw new Error('Expected 403 for unauthorized task access');

  // Test 8: Scope Enforcement on Issues - Ramesh (TN) accessing MP issue iss-503 (Must return 403 Forbidden)
  const forbiddenIssueRes = await makeRequest('/api/v1/issues/iss-503', 'GET', null, tokenTN);
  console.log('8. TN Manager fetching MP Issue iss-503 Status:', forbiddenIssueRes.status);
  if (forbiddenIssueRes.status !== 403) throw new Error('Expected 403 for unauthorized issue access');

  // Test 9: Anonymous Socket Connection Rejection
  console.log('9. Testing anonymous Socket.IO connection...');
  const anonymousSocket = io(BASE_URL, { reconnection: false, timeout: 2000 });
  await new Promise((resolve) => {
    anonymousSocket.on('connect_error', (err) => {
      console.log('   Anonymous socket rejected as expected:', err.message);
      anonymousSocket.disconnect();
      resolve();
    });
    anonymousSocket.on('connect', () => {
      throw new Error('Anonymous socket should NOT have connected!');
    });
  });

  // Test 10: Authenticated Socket Connection & Real-Time Event Delivery
  console.log('10. Testing authenticated Socket.IO connection with JWT & event delivery...');
  const authSocket = io(BASE_URL, {
    auth: { token: tokenTN },
    transports: ['websocket'],
  });

  await new Promise((resolve, reject) => {
    authSocket.on('connect', () => {
      console.log('   Authenticated socket connected successfully with id:', authSocket.id);
      resolve();
    });
    authSocket.on('connect_error', reject);
  });

  // Listen for real-time task update event
  const eventPromise = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('Timeout waiting for task.status.updated event')), 5000);
    authSocket.on('task.status.updated', (payload) => {
      clearTimeout(timer);
      console.log('   Received real-time socket event task.status.updated:', payload.type, payload.entityId, payload.data.status);
      resolve(payload);
    });
  });

  // Mutate task t-301 via REST PATCH
  const patchRes = await makeRequest('/api/v1/tasks/t-301/status', 'PATCH', { status: 'IN_PROGRESS', notes: 'Manager started field visit' }, tokenTN);
  console.log('   PATCH task t-301 status result:', patchRes.status, patchRes.body.data.status);

  const receivedPayload = await eventPromise;
  if (receivedPayload.entityId !== 't-301' || receivedPayload.data.status !== 'IN_PROGRESS') {
    throw new Error('Socket payload does not match expected update');
  }

  // Test 11: Audit log recorded
  const auditRes = await makeRequest('/api/v1/audit-logs', 'GET', null, tokenTN);
  console.log('11. Audit logs recorded count:', auditRes.body.data.length);
  const latestAudit = auditRes.body.data[0];
  console.log('   Latest audit entry:', latestAudit.entityType, latestAudit.entityId, latestAudit.previousStatus, '->', latestAudit.newStatus, 'by', latestAudit.actorId);

  authSocket.disconnect();
  console.log('=== ALL BACKEND INTEGRATION TESTS PASSED SUCCESSFULLY! ===');
  process.exit(0);
}

runTests().catch((err) => {
  console.error('TEST FAILED:', err);
  process.exit(1);
});
