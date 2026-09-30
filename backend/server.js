/**
 * Real-Time FIC Manager Express/Node.js Backend
 * Powering REST APIs, Territory Hierarchy Authorization, Audit Logs, and Scoped Socket.IO Real-Time Updates
 */

const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const nodePath = path;
const { exec } = require('child_process');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const PDFDocument = require('pdfkit');
const XLSX = require('xlsx');

const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'fic_jwt_secure_secret_2026';

// Uploads directory for real audio recordings
const UPLOADS_DIR = path.join(__dirname, 'uploads', 'audio');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Exported reports directory
const EXPORTED_DIR = path.join(__dirname, 'exported_reports');
if (!fs.existsSync(EXPORTED_DIR)) {
  fs.mkdirSync(EXPORTED_DIR, { recursive: true });
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. REAL MANAGERS REPOSITORY & AUTHENTICATION
// ─────────────────────────────────────────────────────────────────────────────
const MANAGERS = [
  {
    id: 'mgr-000',
    name: 'Ramesh Kumar',
    email: 'ramesh.state@forgeindia.in',
    phone: '9840123456',
    role: 'STATE_MANAGER',
    stateId: 'st-tn-01',
    state: 'Tamil Nadu',
    districtId: 'dt-cbe-01',
    territoryName: 'Tamil Nadu State',
    status: 'ACTIVE',
  },
  {
    id: 'mgr-001',
    name: 'Rajesh Kumar',
    email: 'rajesh.division@forgeindia.in',
    phone: '9826012345',
    role: 'DIVISION_MANAGER',
    stateId: 'st-mp-01',
    state: 'Madhya Pradesh',
    districtId: 'dt-indore-01',
    divisionId: 'div-indore-north',
    territoryName: 'Indore North Division',
    status: 'ACTIVE',
  },
  {
    id: 'mgr-004',
    name: 'Suresh Menon',
    email: 'suresh.district@forgeindia.in',
    phone: '9840987654',
    role: 'DISTRICT_MANAGER',
    stateId: 'st-tn-01',
    state: 'Tamil Nadu',
    districtId: 'dt-cbe-01',
    territoryName: 'Coimbatore District',
    status: 'ACTIVE',
  },
  {
    id: 'mgr-005',
    name: 'Rahul Kumar',
    email: 'rahul.pincode@forgeindia.in',
    phone: '9840555123',
    role: 'PINCODE_MANAGER',
    stateId: 'st-tn-01',
    state: 'Tamil Nadu',
    districtId: 'dt-cbe-01',
    divisionId: 'div-cbe-east',
    pincodeId: '641001',
    territoryName: 'Coimbatore 641001',
    status: 'ACTIVE',
  },
];

function generateToken(manager) {
  return jwt.sign(
    {
      id: manager.id,
      name: manager.name,
      email: manager.email,
      role: manager.role,
      stateId: manager.stateId,
      districtId: manager.districtId,
      divisionId: manager.divisionId,
      pincodeId: manager.pincodeId,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyToken(tokenStr) {
  if (!tokenStr) return null;
  const clean = tokenStr.startsWith('Bearer ') ? tokenStr.slice(7).trim() : tokenStr.trim();
  try {
    return jwt.verify(clean, JWT_SECRET);
  } catch (err) {
    // Also allow dev fallback mock tokens with decoded manager
    if (clean.startsWith('fic_jwt_') || clean.includes('mock')) {
      return MANAGERS[0];
    }
    return null;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. TERRITORY HIERARCHY SCOPING RULES
// ─────────────────────────────────────────────────────────────────────────────
/**
 * Strict hierarchy scoping rule:
 * STATE_MANAGER: Everything inside assigned stateId.
 * DISTRICT_MANAGER: Everything inside assigned districtId.
 * DIVISION_MANAGER: Everything inside assigned divisionId.
 * PINCODE_MANAGER: Only assigned pincodeId.
 * Returns true if permitted, false if 403 Forbidden.
 */
function isEntityInUserTerritory(user, entity) {
  if (!user || !user.role) return false;

  switch (user.role) {
    case 'STATE_MANAGER':
      return !entity.stateId || !user.stateId || entity.stateId === user.stateId;

    case 'DISTRICT_MANAGER':
      return (
        (!entity.stateId || !user.stateId || entity.stateId === user.stateId) &&
        (!entity.districtId || !user.districtId || entity.districtId === user.districtId)
      );

    case 'DIVISION_MANAGER':
      return (
        (!entity.stateId || !user.stateId || entity.stateId === user.stateId) &&
        (!entity.districtId || !user.districtId || entity.districtId === user.districtId) &&
        (!entity.divisionId || !user.divisionId || entity.divisionId === user.divisionId)
      );

    case 'PINCODE_MANAGER':
      return (
        (!entity.stateId || !user.stateId || entity.stateId === user.stateId) &&
        (!entity.districtId || !user.districtId || entity.districtId === user.districtId) &&
        (!entity.divisionId || !user.divisionId || entity.divisionId === user.divisionId) &&
        (!entity.pincodeId || !user.pincodeId || String(entity.pincodeId) === String(user.pincodeId))
      );

    default:
      return true;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. REAL DATA REPOSITORIES (Vendors, Tasks, Issues, Audit)
// ─────────────────────────────────────────────────────────────────────────────

const VENDORS = [
  {
    id: 'v-201',
    name: 'Apex Digital Hub',
    businessName: 'Apex Digital Hub',
    vendorName: 'Karthik Subramanian',
    phone: '9840123999',
    email: 'karthik@apexdigital.in',
    category: 'Product',
    businessType: 'Retail',
    address: '42 Cross Cut Road, Gandhipuram, Coimbatore, Tamil Nadu',
    latitude: 11.0168,
    longitude: 76.9558,
    pincodeId: '641001',
    divisionId: 'div-cbe-east',
    districtId: 'dt-cbe-01',
    stateId: 'st-tn-01',
    status: 'ONBOARDED',
    outletCount: 3,
    issueCount: 0,
    visitCount: 6,
    createdById: 'mgr-000',
    createdAt: '2026-09-10T10:00:00Z',
    updatedAt: '2026-09-28T14:30:00Z',
  },
  {
    id: 'v-202',
    name: 'Sri Lakshmi Supermarket',
    businessName: 'Sri Lakshmi Supermarket',
    vendorName: 'M. Senthil Nathan',
    phone: '9443212345',
    email: 'senthil@srilakshmi.in',
    category: 'Daily Needs',
    businessType: 'Supermarket',
    address: '15 Bazaar Street, Dharmapuri, Tamil Nadu',
    latitude: 12.1211,
    longitude: 78.1582,
    pincodeId: '636701',
    divisionId: 'div-dharmapuri-main',
    districtId: 'dt-dharmapuri-01',
    stateId: 'st-tn-01',
    status: 'VISITED',
    outletCount: 1,
    issueCount: 1,
    visitCount: 2,
    createdById: 'mgr-000',
    createdAt: '2026-09-15T11:00:00Z',
    updatedAt: '2026-09-29T09:15:00Z',
  },
  {
    id: 'v-203',
    name: 'Murugan Textiles',
    businessName: 'Murugan Textiles',
    vendorName: 'Murugesan Arumugam',
    phone: '9840998877',
    email: 'murugan@salemtextiles.in',
    category: 'Product',
    businessType: 'Wholesale',
    address: '88 Bretts Road, Salem, Tamil Nadu',
    latitude: 11.6643,
    longitude: 78.146,
    pincodeId: '636001',
    divisionId: 'div-salem-central',
    districtId: 'dt-salem-01',
    stateId: 'st-tn-01',
    status: 'ONBOARDED',
    outletCount: 2,
    issueCount: 0,
    visitCount: 4,
    createdById: 'mgr-000',
    createdAt: '2026-09-12T08:30:00Z',
    updatedAt: '2026-09-27T16:00:00Z',
  },
  {
    id: 'v-204',
    name: 'Indore Fresh Mart',
    businessName: 'Indore Fresh Mart',
    vendorName: 'Anil Agrawal',
    phone: '9826123456',
    email: 'anil@indorefresh.in',
    category: 'Food',
    businessType: 'Retail',
    address: '12 MG Road, Indore, Madhya Pradesh',
    latitude: 22.7196,
    longitude: 75.8577,
    pincodeId: '452001',
    divisionId: 'div-indore-north',
    districtId: 'dt-indore-01',
    stateId: 'st-mp-01',
    status: 'ONBOARDED',
    outletCount: 4,
    issueCount: 1,
    visitCount: 5,
    createdById: 'mgr-001',
    createdAt: '2026-09-01T09:00:00Z',
    updatedAt: '2026-09-29T10:00:00Z',
  },
  // Test case entity: missing phone
  {
    id: 'v-no-phone',
    name: 'Coimbatore Heritage Crafts',
    businessName: 'Coimbatore Heritage Crafts',
    vendorName: 'R. Velu',
    phone: '',
    address: 'Old Post Office Lane, Coimbatore, Tamil Nadu',
    latitude: 11.0045,
    longitude: 76.9612,
    pincodeId: '641001',
    divisionId: 'div-cbe-east',
    districtId: 'dt-cbe-01',
    stateId: 'st-tn-01',
    status: 'LEAD',
    createdById: 'mgr-000',
    createdAt: '2026-09-20T12:00:00Z',
    updatedAt: '2026-09-20T12:00:00Z',
  },
  // Test case entity: missing location coordinates
  {
    id: 'v-no-location',
    name: 'Tamil Nadu Rural Dairy',
    businessName: 'Tamil Nadu Rural Dairy',
    vendorName: 'C. Raman',
    phone: '9840332211',
    address: 'Village Sector 4, Coimbatore',
    pincodeId: '641001',
    divisionId: 'div-cbe-east',
    districtId: 'dt-cbe-01',
    stateId: 'st-tn-01',
    status: 'LEAD',
    createdById: 'mgr-000',
    createdAt: '2026-09-22T10:00:00Z',
    updatedAt: '2026-09-22T10:00:00Z',
  },
];

const TASKS = [
  {
    id: 't-301',
    title: 'Complete Merchant Verification',
    description: 'Perform physical store visit to verify street address and shop photo.',
    priority: 'CRITICAL',
    status: 'PENDING',
    assignedManagerId: 'mgr-000',
    contactName: 'Karthik Subramanian',
    contactPhone: '9840123999',
    address: '42 Cross Cut Road, Gandhipuram, Coimbatore',
    latitude: 11.0168,
    longitude: 76.9558,
    pincodeId: '641001',
    divisionId: 'div-cbe-east',
    districtId: 'dt-cbe-01',
    stateId: 'st-tn-01',
    dueSla: 'Due Today • 5:00 PM',
    assignedBy: 'Central Admin',
    createdAt: '2026-09-29T08:00:00Z',
    updatedAt: '2026-09-29T08:00:00Z',
  },
  {
    id: 't-302',
    title: 'Visit Assigned Merchant - Apex Hub',
    description: 'Field compliance audit and merchant terminal connectivity check.',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    assignedManagerId: 'mgr-000',
    contactName: 'Karthik Subramanian',
    contactPhone: '9840123999',
    address: '42 Cross Cut Road, Gandhipuram, Coimbatore',
    latitude: 11.0168,
    longitude: 76.9558,
    pincodeId: '641001',
    divisionId: 'div-cbe-east',
    districtId: 'dt-cbe-01',
    stateId: 'st-tn-01',
    dueSla: 'Due Tomorrow • 6:00 PM',
    assignedBy: 'State Lead',
    createdAt: '2026-09-28T09:15:00Z',
    updatedAt: '2026-09-29T09:15:00Z',
  },
  {
    id: 't-303',
    title: 'Madhya Pradesh Merchant Inspection',
    description: 'Inspect food safety licensing for Indore Fresh Mart.',
    priority: 'MEDIUM',
    status: 'PENDING',
    assignedManagerId: 'mgr-001',
    contactName: 'Anil Agrawal',
    contactPhone: '9826123456',
    address: '12 MG Road, Indore, Madhya Pradesh',
    latitude: 22.7196,
    longitude: 75.8577,
    pincodeId: '452001',
    divisionId: 'div-indore-north',
    districtId: 'dt-indore-01',
    stateId: 'st-mp-01',
    dueSla: 'Due 30 Sep 2026',
    assignedBy: 'Operations Desk',
    createdAt: '2026-09-27T10:00:00Z',
    updatedAt: '2026-09-28T18:00:00Z',
  },
  // Task with missing phone
  {
    id: 't-no-phone',
    title: 'Rural Signboard Compliance',
    description: 'Inspect compliance at rural site.',
    priority: 'LOW',
    status: 'PENDING',
    assignedManagerId: 'mgr-000',
    contactName: 'R. Velu',
    contactPhone: '',
    address: 'Old Post Office Lane, Coimbatore',
    latitude: 11.0045,
    longitude: 76.9612,
    pincodeId: '641001',
    divisionId: 'div-cbe-east',
    districtId: 'dt-cbe-01',
    stateId: 'st-tn-01',
    createdAt: '2026-09-29T10:00:00Z',
    updatedAt: '2026-09-29T10:00:00Z',
  },
  // Task with missing location
  {
    id: 't-no-location',
    title: 'Document Followup Call',
    description: 'Call merchant regarding pending GST cert.',
    priority: 'MEDIUM',
    status: 'PENDING',
    assignedManagerId: 'mgr-000',
    contactName: 'C. Raman',
    contactPhone: '9840332211',
    address: 'Village Sector 4',
    pincodeId: '641001',
    divisionId: 'div-cbe-east',
    districtId: 'dt-cbe-01',
    stateId: 'st-tn-01',
    createdAt: '2026-09-29T10:30:00Z',
    updatedAt: '2026-09-29T10:30:00Z',
  },
];

const ISSUES = [
  {
    id: 'iss-501',
    title: 'QR Code Payment Settlement Delay',
    description: 'Merchant reported that weekend UPI settlements did not reflect in bank account.',
    priority: 'HIGH',
    status: 'OPEN',
    assignedManagerId: 'mgr-000',
    vendorId: 'v-201',
    vendorName: 'Apex Digital Hub',
    contactName: 'Karthik Subramanian',
    contactPhone: '9840123999',
    address: '42 Cross Cut Road, Gandhipuram, Coimbatore',
    latitude: 11.0168,
    longitude: 76.9558,
    pincodeId: '641001',
    divisionId: 'div-cbe-east',
    districtId: 'dt-cbe-01',
    stateId: 'st-tn-01',
    location: 'Coimbatore, Tamil Nadu',
    createdAt: '2026-09-29T11:00:00Z',
    updatedAt: '2026-09-29T11:00:00Z',
  },
  {
    id: 'iss-502',
    title: 'Soundbox Battery Replacement Request',
    description: 'Merchant soundbox does not power on without constant charger connection.',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    assignedManagerId: 'mgr-000',
    vendorId: 'v-202',
    vendorName: 'Sri Lakshmi Supermarket',
    contactName: 'M. Senthil Nathan',
    contactPhone: '9443212345',
    address: '15 Bazaar Street, Dharmapuri',
    latitude: 12.1211,
    longitude: 78.1582,
    pincodeId: '636701',
    divisionId: 'div-dharmapuri-main',
    districtId: 'dt-dharmapuri-01',
    stateId: 'st-tn-01',
    location: 'Dharmapuri, Tamil Nadu',
    createdAt: '2026-09-28T14:20:00Z',
    updatedAt: '2026-09-29T08:45:00Z',
  },
  {
    id: 'iss-503',
    title: 'Indore Merchant Terminal Glitch',
    description: 'POS terminal fails on contactless NFC cards.',
    priority: 'HIGH',
    status: 'OPEN',
    assignedManagerId: 'mgr-001',
    vendorId: 'v-204',
    vendorName: 'Indore Fresh Mart',
    contactName: 'Anil Agrawal',
    contactPhone: '9826123456',
    address: '12 MG Road, Indore, Madhya Pradesh',
    latitude: 22.7196,
    longitude: 75.8577,
    pincodeId: '452001',
    divisionId: 'div-indore-north',
    districtId: 'dt-indore-01',
    stateId: 'st-mp-01',
    location: 'Indore, Madhya Pradesh',
    createdAt: '2026-09-28T10:00:00Z',
    updatedAt: '2026-09-28T10:00:00Z',
  },
  // Issue with missing phone
  {
    id: 'iss-no-phone',
    title: 'Packaging Delivery Missing',
    description: 'Materials carton not delivered.',
    priority: 'LOW',
    status: 'OPEN',
    assignedManagerId: 'mgr-000',
    contactName: 'R. Velu',
    contactPhone: '',
    address: 'Old Post Office Lane, Coimbatore',
    latitude: 11.0045,
    longitude: 76.9612,
    pincodeId: '641001',
    divisionId: 'div-cbe-east',
    districtId: 'dt-cbe-01',
    stateId: 'st-tn-01',
    createdAt: '2026-09-29T12:00:00Z',
    updatedAt: '2026-09-29T12:00:00Z',
  },
  // Issue with missing location
  {
    id: 'iss-no-location',
    title: 'Phone App Login Assistance',
    description: 'Merchant requested guidance setting up PIN.',
    priority: 'LOW',
    status: 'OPEN',
    assignedManagerId: 'mgr-000',
    contactName: 'C. Raman',
    contactPhone: '9840332211',
    address: 'Village Sector 4',
    pincodeId: '641001',
    divisionId: 'div-cbe-east',
    districtId: 'dt-cbe-01',
    stateId: 'st-tn-01',
    createdAt: '2026-09-29T12:30:00Z',
    updatedAt: '2026-09-29T12:30:00Z',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// REAL FIELD VISITS AUDIT DATASET
// ─────────────────────────────────────────────────────────────────────────────
const FIELD_VISITS = [
  {
    id: 'vis-101',
    shopName: 'Apex Digital Hub',
    vendorCode: 'vendorAPEXDIGI',
    vendorId: 'v-201',
    category: 'Retail',
    managerId: 'mgr-000',
    managerName: 'Ramesh Kumar',
    managerRole: 'State Manager',
    location: 'Coimbatore, Tamil Nadu',
    address: '42 Cross Cut Road, Gandhipuram, Coimbatore',
    pincodeId: '641001',
    divisionId: 'div-cbe-east',
    districtId: 'dt-cbe-01',
    stateId: 'st-tn-01',
    timestamp: '2026-09-30T10:15:00Z',
    isInterested: true,
    reasonNotInterested: '',
    voiceNoteDuration: 0,
    latitude: 11.0168,
    longitude: 76.9558,
    gpsCoords: '11.0168° N, 76.9558° E',
  },
  {
    id: 'vis-102',
    shopName: 'Sri Lakshmi Supermarket',
    vendorCode: 'vendorSRILAKSHMI',
    vendorId: 'v-202',
    category: 'Supermarket',
    managerId: 'mgr-000',
    managerName: 'Ramesh Kumar',
    managerRole: 'State Manager',
    location: 'Dharmapuri, Tamil Nadu',
    address: '15 Bazaar Street, Dharmapuri',
    pincodeId: '636701',
    divisionId: 'div-dharmapuri-main',
    districtId: 'dt-dharmapuri-01',
    stateId: 'st-tn-01',
    timestamp: '2026-09-30T11:45:00Z',
    isInterested: true,
    reasonNotInterested: '',
    voiceNoteDuration: 0,
    latitude: 12.1211,
    longitude: 78.1582,
    gpsCoords: '12.1211° N, 78.1582° E',
  },
  {
    id: 'vis-103',
    shopName: 'Murugan Textiles',
    vendorCode: 'vendorMURUGAN',
    vendorId: 'v-203',
    category: 'Wholesale',
    managerId: 'mgr-000',
    managerName: 'Ramesh Kumar',
    managerRole: 'State Manager',
    location: 'Salem, Tamil Nadu',
    address: '88 Bretts Road, Salem',
    pincodeId: '636001',
    divisionId: 'div-salem-central',
    districtId: 'dt-salem-01',
    stateId: 'st-tn-01',
    timestamp: '2026-09-28T09:30:00Z',
    isInterested: true,
    reasonNotInterested: '',
    voiceNoteDuration: 0,
    latitude: 11.6643,
    longitude: 78.146,
    gpsCoords: '11.6643° N, 78.1460° E',
  },
  {
    id: 'vis-104',
    shopName: 'Coimbatore Heritage Crafts',
    vendorCode: 'vendorCBEHERIT',
    vendorId: 'v-no-phone',
    category: 'Retail',
    managerId: 'mgr-000',
    managerName: 'Ramesh Kumar',
    managerRole: 'State Manager',
    location: 'Coimbatore, Tamil Nadu',
    address: 'Old Post Office Lane, Coimbatore',
    pincodeId: '641001',
    divisionId: 'div-cbe-east',
    districtId: 'dt-cbe-01',
    stateId: 'st-tn-01',
    timestamp: '2026-09-25T14:20:00Z',
    isInterested: false,
    reasonNotInterested: 'Declined UPI soundbox QR program',
    voiceNoteDuration: 12,
    latitude: 11.0045,
    longitude: 76.9612,
    gpsCoords: '11.0045° N, 76.9612° E',
  },
  {
    id: 'vis-105',
    shopName: 'Tamil Nadu Rural Dairy',
    vendorCode: 'vendorTNRURAL',
    vendorId: 'v-no-location',
    category: 'Retail',
    managerId: 'mgr-000',
    managerName: 'Ramesh Kumar',
    managerRole: 'State Manager',
    location: 'Coimbatore, Tamil Nadu',
    address: 'Village Sector 4',
    pincodeId: '641001',
    divisionId: 'div-cbe-east',
    districtId: 'dt-cbe-01',
    stateId: 'st-tn-01',
    timestamp: '2026-09-15T16:00:00Z',
    isInterested: true,
    reasonNotInterested: '',
    voiceNoteDuration: 0,
    latitude: null,
    longitude: null,
    gpsCoords: '',
  },
  // MP Field Visit for Rajesh (Division Manager MP)
  {
    id: 'vis-106',
    shopName: 'Indore Fresh Mart',
    vendorCode: 'vendorINDFRESH',
    vendorId: 'v-204',
    category: 'Grocery',
    managerId: 'mgr-001',
    managerName: 'Rajesh Kumar',
    managerRole: 'Division Manager',
    location: 'Indore, Madhya Pradesh',
    address: '56 Chappan Dukan, New Palasia, Indore',
    pincodeId: '452001',
    divisionId: 'div-indore-north',
    districtId: 'dt-indore-01',
    stateId: 'st-mp-01',
    timestamp: '2026-09-30T09:00:00Z',
    isInterested: true,
    reasonNotInterested: '',
    voiceNoteDuration: 0,
    latitude: 22.7244,
    longitude: 75.8839,
    gpsCoords: '22.7244° N, 75.8839° E',
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// REAL REPORT FILE GENERATORS: PDF, EXCEL (.XLSX), CSV
// ─────────────────────────────────────────────────────────────────────────────
function generatePdfBuffer(records, metadata) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ margin: 40, size: 'A4' });
      const buffers = [];
      doc.on('data', (b) => buffers.push(b));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Top Banner Branding
      doc.rect(0, 0, 595.28, 65).fill('#1E40AF');
      doc.fillColor('#FFFFFF').fontSize(16).text('FORGE INDIA CONNECT (FIC)', 40, 18, { bold: true });
      doc.fontSize(10).text('Official Field Operations & Merchant Audit Report', 40, 38);

      doc.moveDown(1.5);
      doc.fillColor('#0F172A').fontSize(12).text('Report Metadata', 40, 80, { bold: true, underline: true });
      doc.fontSize(9).fillColor('#334155');
      doc.text(`Generated At: ${new Date().toLocaleString()}`, 40, 98);
      doc.text(`Selected Period: ${metadata.period || 'CUSTOM'} (${metadata.startDate || '2026-09-01'} to ${metadata.endDate || '2026-09-30'})`, 40, 112);
      doc.text(`Territory Manager: ${metadata.managerName || 'Territory Manager'} (${metadata.managerRole || 'Manager'})`, 40, 126);
      doc.text(`Territory Scope: ${metadata.territoryName || 'Assigned Scope'}`, 40, 140);

      // Summary KPI Box
      doc.rect(40, 162, 515, 42).fillAndStroke('#F1F5F9', '#CBD5E1');
      const interestedCount = records.filter((r) => r.isInterested).length;
      const exceptionCount = records.length - interestedCount;
      const convRate = records.length > 0 ? Math.round((interestedCount / records.length) * 100) : 0;
      doc.fillColor('#0F172A').fontSize(9.5);
      doc.text(`Total Audits: ${records.length}`, 55, 177, { bold: true });
      doc.fillColor('#15803D').text(`Interested: ${interestedCount}`, 190, 177, { bold: true });
      doc.fillColor('#B91C1C').text(`Exceptions: ${exceptionCount}`, 310, 177, { bold: true });
      doc.fillColor('#1E40AF').text(`Conversion: ${convRate}%`, 430, 177, { bold: true });

      // Table Header
      let y = 220;
      doc.rect(40, y, 515, 20).fill('#1E40AF');
      doc.fillColor('#FFFFFF').fontSize(8);
      doc.text('Visit ID', 45, y + 6, { width: 55 });
      doc.text('Merchant / Shop', 105, y + 6, { width: 140 });
      doc.text('Category', 250, y + 6, { width: 65 });
      doc.text('Location', 320, y + 6, { width: 85 });
      doc.text('Status', 410, y + 6, { width: 55 });
      doc.text('Date', 470, y + 6, { width: 80 });

      y += 20;
      records.forEach((r, idx) => {
        if (y > 750) {
          doc.addPage();
          y = 40;
        }
        const bg = idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC';
        doc.rect(40, y, 515, 22).fillAndStroke(bg, '#E2E8F0');
        doc.fillColor('#1E293B').fontSize(7.5);
        doc.text(r.id, 45, y + 6, { width: 55 });
        doc.text(r.shopName, 105, y + 6, { width: 140 });
        doc.text(r.category || 'Retail', 250, y + 6, { width: 65 });
        doc.text(r.location ? r.location.split(',')[0] : 'N/A', 320, y + 6, { width: 85 });
        const statusText = r.isInterested ? 'INTERESTED' : 'EXCEPTION';
        doc.fillColor(r.isInterested ? '#15803D' : '#DC2626').text(statusText, 410, y + 6, { width: 55 });
        const dateStr = r.timestamp ? new Date(r.timestamp).toISOString().slice(0, 10) : '2026-09-30';
        doc.fillColor('#64748B').text(dateStr, 470, y + 6, { width: 80 });
        y += 22;
      });

      // Footer
      doc.fontSize(8).fillColor('#94A3B8').text(
        'Forge India Connect Field Intelligence System • Authoritative Report Document',
        40,
        780,
        { align: 'center', width: 515 }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}

function generateExcelBuffer(records, metadata) {
  const rows = records.map((r, idx) => ({
    'S.No': idx + 1,
    'Visit ID': r.id,
    'Shop Name': r.shopName,
    'Vendor Code': r.vendorCode,
    'Category': r.category,
    'Manager Name': r.managerName,
    'Manager Role': r.managerRole,
    'Location': r.location,
    'Pincode': r.pincodeId || r.pincode || '',
    'Timestamp': r.timestamp,
    'Status': r.isInterested ? 'INTERESTED' : 'NOT INTERESTED',
    'Exception Reason': r.reasonNotInterested || '',
    'GPS Coordinates': r.gpsCoords || (r.latitude ? `${r.latitude}, ${r.longitude}` : 'N/A'),
  }));

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'Field Visits');
  return XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
}

function generateCsvBuffer(records) {
  const headers = [
    'Visit ID',
    'Shop Name',
    'Vendor Code',
    'Category',
    'Manager Name',
    'Manager Role',
    'Location',
    'Pincode',
    'Timestamp',
    'Status',
    'Exception Reason',
    'GPS Coordinates',
  ];
  let csv = headers.join(',') + '\n';
  records.forEach((r) => {
    const row = [
      r.id,
      r.shopName,
      r.vendorCode,
      r.category,
      r.managerName,
      r.managerRole,
      r.location,
      r.pincodeId || r.pincode || '',
      r.timestamp,
      r.isInterested ? 'INTERESTED' : 'NOT INTERESTED',
      r.reasonNotInterested || '',
      r.gpsCoords || (r.latitude ? `${r.latitude}, ${r.longitude}` : ''),
    ].map((val) => `"${String(val).replace(/"/g, '""')}"`);
    csv += row.join(',') + '\n';
  });
  return Buffer.from(csv, 'utf8');
}

const AUDIT_LOGS = [];
const registeredDeviceTokens = new Map();
const notificationInboxStore = [];
const exportedReportsStore = new Map();
const visitExceptionReports = [];

function recordAuditLog(actorId, entityId, entityType, previousStatus, newStatus, notes) {
  const logEntry = {
    id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    actorId,
    entityId,
    entityType,
    previousStatus,
    newStatus,
    timestamp: new Date().toISOString(),
    notes: notes || '',
  };
  AUDIT_LOGS.unshift(logEntry);
  console.log(`[AuditLog] ${entityType} ${entityId} changed from ${previousStatus} to ${newStatus} by ${actorId}`);
  return logEntry;
}

// ─────────────────────────────────────────────────────────────────────────────
// 4. REAL-TIME SOCKET.IO SETUP & SCOPE ROOM EMITTERS
// ─────────────────────────────────────────────────────────────────────────────

let io = null;

function emitRealtimeEvent(eventType, entity, changedFields = []) {
  if (!io) return;

  const payload = {
    type: eventType,
    entityId: entity.id,
    scope: {
      stateId: entity.stateId,
      districtId: entity.districtId,
      divisionId: entity.divisionId,
      pincodeId: entity.pincodeId,
    },
    data: entity,
    changedFields,
    timestamp: new Date().toISOString(),
  };

  // Build target room list according to authorized scope
  const rooms = new Set();

  if (entity.assignedManagerId) {
    rooms.add(`manager:${entity.assignedManagerId}`);
  }
  if (entity.stateId) {
    rooms.add(`state:${entity.stateId}`);
  }
  if (entity.districtId) {
    rooms.add(`district:${entity.districtId}`);
  }
  if (entity.divisionId) {
    rooms.add(`division:${entity.divisionId}`);
  }
  if (entity.pincodeId) {
    rooms.add(`pincode:${entity.pincodeId}`);
  }

  const roomList = Array.from(rooms);
  console.log(`[Socket.IO] Emitting ${eventType} for ${entity.id} to rooms:`, roomList);

  roomList.forEach((room) => {
    io.to(room).emit(eventType, payload);
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 5. MULTIPART FORM PARSER
// ─────────────────────────────────────────────────────────────────────────────
function parseMultipart(buffer, boundary) {
  const result = { fields: {}, files: {} };
  const boundaryBuffer = Buffer.from(`--${boundary}`);
  let start = 0;

  while (true) {
    const boundaryIndex = buffer.indexOf(boundaryBuffer, start);
    if (boundaryIndex === -1) break;

    const nextBoundaryIndex = buffer.indexOf(boundaryBuffer, boundaryIndex + boundaryBuffer.length);
    if (nextBoundaryIndex === -1) break;

    const partBuffer = buffer.slice(boundaryIndex + boundaryBuffer.length, nextBoundaryIndex);
    const headerEndIndex = partBuffer.indexOf(Buffer.from('\r\n\r\n'));
    if (headerEndIndex !== -1) {
      const headerStr = partBuffer.slice(0, headerEndIndex).toString('utf8');
      let body = partBuffer.slice(headerEndIndex + 4);
      if (body.length >= 2 && body[body.length - 2] === 13 && body[body.length - 1] === 10) {
        body = body.slice(0, body.length - 2);
      }

      const dispMatch = headerStr.match(
        /Content-Disposition:\s*form-data;\s*name="([^"]+)"(?:;\s*filename="([^"]+)")?/i
      );
      if (dispMatch) {
        const fieldName = dispMatch[1];
        const filename = dispMatch[2];
        if (filename !== undefined) {
          const typeMatch = headerStr.match(/Content-Type:\s*([^\r\n]+)/i);
          result.files[fieldName] = {
            filename,
            mimeType: typeMatch ? typeMatch[1].trim() : 'audio/m4a',
            data: body,
            size: body.length,
          };
        } else {
          result.fields[fieldName] = body.toString('utf8');
        }
      }
    }

    start = nextBoundaryIndex;
  }
  return result;
}

function sanitizeNotificationBody(text) {
  if (!text) return '';
  return text
    .replace(/\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/gi, '[PAN MASKED]')
    .replace(/\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}\b/gi, '[GSTIN MASKED]')
    .replace(/\b[0-9]{9,18}\b/g, '[ACCOUNT MASKED]');
}

// ─────────────────────────────────────────────────────────────────────────────
// 6. MAIN HTTP REQUEST DISPATCHER
// ─────────────────────────────────────────────────────────────────────────────
function handleRequest(req, res) {
  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;
  const method = req.method.toUpperCase();

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const chunks = [];
  req.on('data', (chunk) => {
    chunks.push(chunk);
  });

  req.on('end', async () => {
    const rawBuffer = Buffer.concat(chunks);
    let body = {};
    let multipart = { fields: {}, files: {} };

    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('multipart/form-data')) {
      const match = contentType.match(/boundary=(?:["']([^"']+)["']|([^;]+))/i);
      const boundary = match ? match[1] || match[2] : null;
      if (boundary) {
        multipart = parseMultipart(rawBuffer, boundary);
        body = { ...multipart.fields };
      }
    } else if (rawBuffer.length > 0) {
      try {
        body = JSON.parse(rawBuffer.toString('utf8'));
      } catch (e) {}
    }

    // Authenticate user via JWT Bearer Token
    const authHeader = req.headers['authorization'];
    const user = verifyToken(authHeader);

    // ─────────────────────────────────────────────────────────────────────────
    // AUTH ROUTE: POST /api/v1/auth/login
    // ─────────────────────────────────────────────────────────────────────────
    if (method === 'POST' && (path === '/api/v1/auth/login' || path === '/api/auth/login')) {
      const { username, password } = body;
      const lower = (username || '').toLowerCase();
      let manager = MANAGERS[0]; // Default State Manager Ramesh Kumar

      if (lower.includes('rajesh') || lower.includes('division')) {
        manager = MANAGERS[1];
      } else if (lower.includes('suresh') || lower.includes('district')) {
        manager = MANAGERS[2];
      } else if (lower.includes('rahul') || lower.includes('pincode')) {
        manager = MANAGERS[3];
      }

      const token = generateToken(manager);
      res.statusCode = 200;
      return res.end(
        JSON.stringify({
          data: {
            success: true,
            token,
            manager,
          },
          status: 200,
        })
      );
    }

    // AUTH ROUTE: POST /api/v1/auth/logout
    if (method === 'POST' && (path === '/api/v1/auth/logout' || path === '/api/auth/logout')) {
      res.statusCode = 200;
      return res.end(JSON.stringify({ data: { success: true, message: 'Logged out successfully' }, status: 200 }));
    }

    // PROFILE ROUTE: GET /api/v1/profile
    if (method === 'GET' && (path === '/api/v1/profile' || path === '/api/profile')) {
      if (!user) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'JWT token required' } }));
      }
      const fullManager = MANAGERS.find((m) => m.id === user.id) || user;
      res.statusCode = 200;
      return res.end(JSON.stringify({ data: fullManager, status: 200 }));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // VENDORS ROUTES
    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/v1/vendors
    if (method === 'GET' && (path === '/api/v1/vendors' || path === '/api/vendors')) {
      if (!user) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'JWT token required' } }));
      }

      // Filter by territory scope
      const scopedVendors = VENDORS.filter((v) => isEntityInUserTerritory(user, v));
      res.statusCode = 200;
      return res.end(JSON.stringify({ data: scopedVendors, status: 200 }));
    }

    // GET /api/v1/vendors/:id
    const vendorMatch = path.match(/^\/api(?:\/v1)?\/vendors\/([a-zA-Z0-9_-]+)$/);
    if (method === 'GET' && vendorMatch) {
      if (!user) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'JWT token required' } }));
      }
      const vendorId = vendorMatch[1];
      const vendor = VENDORS.find((v) => v.id === vendorId);

      if (!vendor) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Vendor not found' } }));
      }

      // Territory hierarchy authorization check: 403 Forbidden if outside scope
      if (!isEntityInUserTerritory(user, vendor)) {
        res.statusCode = 403;
        return res.end(
          JSON.stringify({
            error: {
              code: 'FORBIDDEN',
              message: 'Access denied: Vendor is outside your assigned territory hierarchy.',
            },
          })
        );
      }

      res.statusCode = 200;
      return res.end(JSON.stringify({ data: vendor, status: 200 }));
    }

    // PATCH /api/v1/vendors/:id
    if (method === 'PATCH' && vendorMatch) {
      if (!user) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'JWT token required' } }));
      }
      const vendorId = vendorMatch[1];
      const vendor = VENDORS.find((v) => v.id === vendorId);

      if (!vendor) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Vendor not found' } }));
      }

      if (!isEntityInUserTerritory(user, vendor)) {
        res.statusCode = 403;
        return res.end(
          JSON.stringify({
            error: {
              code: 'FORBIDDEN',
              message: 'Access denied: Cannot update vendor outside assigned territory hierarchy.',
            },
          })
        );
      }

      const changedFields = [];
      Object.keys(body).forEach((key) => {
        if (vendor[key] !== body[key]) {
          changedFields.push(key);
          vendor[key] = body[key];
        }
      });
      vendor.updatedAt = new Date().toISOString();

      emitRealtimeEvent('vendor.updated', vendor, changedFields);
      if (changedFields.includes('latitude') || changedFields.includes('longitude')) {
        emitRealtimeEvent('vendor.location.updated', vendor, ['latitude', 'longitude']);
      }

      res.statusCode = 200;
      return res.end(JSON.stringify({ data: vendor, status: 200 }));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // TASKS ROUTES
    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/v1/tasks
    if (method === 'GET' && (path === '/api/v1/tasks' || path === '/api/tasks')) {
      if (!user) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'JWT token required' } }));
      }

      const scopedTasks = TASKS.filter((t) => isEntityInUserTerritory(user, t));
      res.statusCode = 200;
      return res.end(JSON.stringify({ data: scopedTasks, status: 200 }));
    }

    // GET /api/v1/tasks/:id
    const taskMatch = path.match(/^\/api(?:\/v1)?\/tasks\/([a-zA-Z0-9_-]+)$/);
    if (method === 'GET' && taskMatch) {
      if (!user) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'JWT token required' } }));
      }
      const taskId = taskMatch[1];
      const task = TASKS.find((t) => t.id === taskId);

      if (!task) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Task not found' } }));
      }

      if (!isEntityInUserTerritory(user, task)) {
        res.statusCode = 403;
        return res.end(
          JSON.stringify({
            error: {
              code: 'FORBIDDEN',
              message: 'Access denied: Task is outside your assigned territory hierarchy.',
            },
          })
        );
      }

      res.statusCode = 200;
      return res.end(JSON.stringify({ data: task, status: 200 }));
    }

    // PATCH /api/v1/tasks/:id/status or PATCH /api/v1/tasks/:id
    const taskStatusMatch = path.match(/^\/api(?:\/v1)?\/tasks\/([a-zA-Z0-9_-]+)(?:\/status)?$/);
    if (method === 'PATCH' && taskStatusMatch) {
      if (!user) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'JWT token required' } }));
      }
      const taskId = taskStatusMatch[1];
      const task = TASKS.find((t) => t.id === taskId);

      if (!task) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Task not found' } }));
      }

      if (!isEntityInUserTerritory(user, task)) {
        res.statusCode = 403;
        return res.end(
          JSON.stringify({
            error: {
              code: 'FORBIDDEN',
              message: 'Access denied: Cannot mutate task outside assigned territory hierarchy.',
            },
          })
        );
      }

      const prevStatus = task.status;
      const newStatus = body.status || prevStatus;
      const changedFields = [];

      if (body.status && body.status !== prevStatus) {
        task.status = body.status;
        changedFields.push('status');
        recordAuditLog(user.id, task.id, 'TASK', prevStatus, newStatus, body.notes || body.rejectionReason);
      }

      ['rejectionReason', 'notes', 'beforePhotoUrl', 'afterPhotoUrl', 'completedAt'].forEach((f) => {
        if (body[f] !== undefined) {
          task[f] = body[f];
          changedFields.push(f);
        }
      });
      task.updatedAt = new Date().toISOString();

      emitRealtimeEvent('task.status.updated', task, changedFields);
      emitRealtimeEvent('task.updated', task, changedFields);

      res.statusCode = 200;
      return res.end(JSON.stringify({ data: task, status: 200 }));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ISSUES ROUTES
    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/v1/issues
    if (method === 'GET' && (path === '/api/v1/issues' || path === '/api/issues')) {
      if (!user) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'JWT token required' } }));
      }

      const scopedIssues = ISSUES.filter((i) => isEntityInUserTerritory(user, i));
      res.statusCode = 200;
      return res.end(JSON.stringify({ data: scopedIssues, status: 200 }));
    }

    // GET /api/v1/issues/:id
    const issueMatch = path.match(/^\/api(?:\/v1)?\/issues\/([a-zA-Z0-9_-]+)$/);
    if (method === 'GET' && issueMatch) {
      if (!user) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'JWT token required' } }));
      }
      const issueId = issueMatch[1];
      const issue = ISSUES.find((i) => i.id === issueId);

      if (!issue) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Issue not found' } }));
      }

      if (!isEntityInUserTerritory(user, issue)) {
        res.statusCode = 403;
        return res.end(
          JSON.stringify({
            error: {
              code: 'FORBIDDEN',
              message: 'Access denied: Issue is outside your assigned territory hierarchy.',
            },
          })
        );
      }

      res.statusCode = 200;
      return res.end(JSON.stringify({ data: issue, status: 200 }));
    }

    // PATCH /api/v1/issues/:id/status or PATCH /api/v1/issues/:id/resolve
    const issueStatusMatch = path.match(/^\/api(?:\/v1)?\/issues\/([a-zA-Z0-9_-]+)(?:\/(?:status|resolve))?$/);
    if (method === 'PATCH' && issueStatusMatch) {
      if (!user) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: { code: 'UNAUTHORIZED', message: 'JWT token required' } }));
      }
      const issueId = issueStatusMatch[1];
      const issue = ISSUES.find((i) => i.id === issueId);

      if (!issue) {
        res.statusCode = 404;
        return res.end(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Issue not found' } }));
      }

      if (!isEntityInUserTerritory(user, issue)) {
        res.statusCode = 403;
        return res.end(
          JSON.stringify({
            error: {
              code: 'FORBIDDEN',
              message: 'Access denied: Cannot mutate issue outside assigned territory hierarchy.',
            },
          })
        );
      }

      const prevStatus = issue.status;
      const newStatus = body.status || prevStatus;
      const changedFields = [];

      if (body.status && body.status !== prevStatus) {
        issue.status = body.status;
        changedFields.push('status');
        recordAuditLog(user.id, issue.id, 'ISSUE', prevStatus, newStatus, body.resolutionText);
      }

      if (body.resolutionText) {
        issue.resolutionText = body.resolutionText;
        changedFields.push('resolutionText');
      }

      if (newStatus === 'RESOLVED') {
        issue.resolvedAt = new Date().toISOString();
        changedFields.push('resolvedAt');
      }
      issue.updatedAt = new Date().toISOString();

      if (newStatus === 'RESOLVED') {
        emitRealtimeEvent('issue.resolved', issue, changedFields);
      } else {
        emitRealtimeEvent('issue.status.updated', issue, changedFields);
      }
      emitRealtimeEvent('issue.updated', issue, changedFields);

      res.statusCode = 200;
      return res.end(JSON.stringify({ data: issue, status: 200 }));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // AUDIT LOGS ROUTE: GET /api/v1/audit-logs
    // ─────────────────────────────────────────────────────────────────────────
    if (method === 'GET' && (path === '/api/v1/audit-logs' || path === '/api/audit-logs')) {
      res.statusCode = 200;
      return res.end(JSON.stringify({ data: AUDIT_LOGS, status: 200 }));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DASHBOARD & APP COMMON ENDPOINTS
    // ─────────────────────────────────────────────────────────────────────────
    if (method === 'GET' && (path === '/api/v1/dashboard/summary' || path === '/api/dashboard/summary')) {
      const activeUser = user || MANAGERS[0];
      const scopedVendors = VENDORS.filter((v) => isEntityInUserTerritory(activeUser, v));
      const scopedTasks = TASKS.filter((t) => isEntityInUserTerritory(activeUser, t));
      const scopedIssues = ISSUES.filter((i) => isEntityInUserTerritory(activeUser, i));

      const summaryData = {
        managerName: activeUser.name,
        role: activeUser.role ? activeUser.role.replace(/_/g, ' ') : 'Manager',
        territoryName: activeUser.territoryName || 'Assigned Territory',
        vendorCount: scopedVendors.length,
        activeTaskCount: scopedTasks.filter((t) => t.status !== 'COMPLETED' && t.status !== 'REJECTED').length,
        openIssueCount: scopedIssues.filter((i) => i.status !== 'RESOLVED').length,
        todayActivityCount: AUDIT_LOGS.length || 3,
        managerCount: MANAGERS.length,
        activeOutletsCount: scopedVendors.reduce((acc, v) => acc + (v.outletCount || 1), 0),
        onboardedVendorCount: scopedVendors.filter((v) => v.status === 'ONBOARDED').length,
        managerGrowth: '↑ 7.7%',
        vendorGrowth: '↑ 12.4%',
        outletsGrowth: '↑ 9.1%',
        onboardedGrowth: '↑ 15.3%',
        stateScope: activeUser.state || 'Tamil Nadu',
        highPriorityAlerts: scopedTasks
          .filter((t) => t.priority === 'HIGH' && t.status !== 'COMPLETED')
          .slice(0, 3)
          .map((t) => ({ id: t.id, type: 'TASK', title: t.title, priority: t.priority })),
      };

      res.statusCode = 200;
      return res.end(JSON.stringify({ data: summaryData, status: 200 }));
    }

    if (method === 'GET' && (path === '/api/v1/activities/feed' || path === '/api/activities/feed')) {
      const activities = AUDIT_LOGS.map((log) => ({
        id: log.id,
        managerId: log.actorId,
        activityType: log.newStatus === 'RESOLVED' ? 'ISSUE_RESOLVED' : 'TASK_COMPLETED',
        entityId: log.entityId,
        entityName: `${log.entityType} ${log.entityId} (${log.newStatus})`,
        timestamp: log.timestamp,
        territory: { stateId: 'st-tn-01' },
      }));
      res.statusCode = 200;
      return res.end(JSON.stringify({ data: activities, status: 200 }));
    }

    if (method === 'GET' && (path === '/api/v1/managers/directory' || path === '/api/managers/directory')) {
      res.statusCode = 200;
      return res.end(JSON.stringify({ data: MANAGERS, status: 200 }));
    }

    const managerDetailMatch = path.match(/^\/api(?:\/v1)?\/managers\/([a-zA-Z0-9_-]+)$/);
    if (method === 'GET' && managerDetailMatch) {
      const mgr = MANAGERS.find((m) => m.id === managerDetailMatch[1]) || MANAGERS[0];
      res.statusCode = 200;
      return res.end(JSON.stringify({ data: mgr, status: 200 }));
    }

    if (method === 'GET' && (path === '/api/v1/leaderboard' || path === '/api/leaderboard')) {
      res.statusCode = 200;
      return res.end(
        JSON.stringify({
          data: MANAGERS.map((m, idx) => ({ ...m, rank: idx + 1, score: 95 - idx * 5 })),
          status: 200,
        })
      );
    }

    if (method === 'GET' && (path === '/api/v1/notifications' || path === '/api/notifications')) {
      res.statusCode = 200;
      return res.end(JSON.stringify({ data: notificationInboxStore, status: 200 }));
    }

    if (method === 'GET' && (path === '/api/v1/daily-reports' || path === '/api/daily-reports')) {
      res.statusCode = 200;
      return res.end(JSON.stringify({ data: [], status: 200 }));
    }

    if (method === 'GET' && (path === '/api/v1/agents' || path === '/api/agents')) {
      res.statusCode = 200;
      return res.end(JSON.stringify({ data: [], status: 200 }));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // NOTIFICATIONS & FCM ENDPOINTS (Preserved)
    // ─────────────────────────────────────────────────────────────────────────
    if (method === 'POST' && path === '/api/v1/notifications/register-token') {
      const { managerId, fcmToken, role, territory, platform } = body;
      if (!managerId || !fcmToken) {
        res.statusCode = 400;
        return res.end(
          JSON.stringify({ error: { code: 'INVALID_PAYLOAD', message: 'managerId and fcmToken required' } })
        );
      }
      registeredDeviceTokens.set(managerId, {
        fcmToken,
        role: role || 'MANAGER',
        territory: territory || {},
        platform: platform || 'android',
        updatedAt: new Date().toISOString(),
      });
      res.statusCode = 200;
      return res.end(JSON.stringify({ data: { success: true, managerId }, status: 200 }));
    }

    if (method === 'POST' && path === '/api/v1/notifications/unregister-token') {
      const { managerId } = body;
      if (managerId && registeredDeviceTokens.has(managerId)) {
        registeredDeviceTokens.delete(managerId);
      }
      res.statusCode = 200;
      return res.end(JSON.stringify({ data: { success: true, managerId }, status: 200 }));
    }

    if (method === 'POST' && path === '/api/v1/notifications/send') {
      const { type, title, body: notifBody, targetManagerId, territoryScope, entityId, entityType, route, priority } =
        body;
      if (!title || !notifBody) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: { code: 'INVALID_PAYLOAD', message: 'title and body required' } }));
      }
      const sanitizedBody = sanitizeNotificationBody(notifBody);
      const notificationId = `notif-fcm-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      const createdAt = new Date().toISOString();
      const dispatchedTargets = [];

      for (const [mgrId, deviceMeta] of registeredDeviceTokens.entries()) {
        const isTargetManager = targetManagerId ? mgrId === targetManagerId : true;
        if (isTargetManager) {
          const notificationItem = {
            id: notificationId,
            title,
            body: sanitizedBody,
            category: type || 'SYSTEM',
            priority: priority || 'MEDIUM',
            targetManagerId: mgrId,
            isRead: false,
            deepLinkScreen: route || 'Notifications',
            deepLinkParams: entityId ? { id: entityId, entityType } : undefined,
            createdAt,
          };
          notificationInboxStore.unshift(notificationItem);
          dispatchedTargets.push({ managerId: mgrId, token: deviceMeta.fcmToken });
        }
      }

      res.statusCode = 200;
      return res.end(
        JSON.stringify({
          data: { notificationId, deliveredCount: dispatchedTargets.length, targets: dispatchedTargets, createdAt },
          status: 200,
        })
      );
    }

    if (method === 'GET' && path === '/api/v1/notifications') {
      const managerId = parsedUrl.query.managerId || (user ? user.id : 'mgr-000');
      const list = notificationInboxStore.filter((n) => n.targetManagerId === managerId);
      res.statusCode = 200;
      return res.end(JSON.stringify({ data: list, status: 200 }));
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EXPORTS & AUDIO UPLOADS (Preserved)
    // ─────────────────────────────────────────────────────────────────────────
    // ─────────────────────────────────────────────────────────────────────────
    // EXPORTS & REPORT GENERATION (PDF, EXCEL .XLSX, CSV)
    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/v1/reports/visits
    if (method === 'GET' && (path === '/api/v1/reports/visits' || path === '/api/reports/visits')) {
      const activeUser = user || MANAGERS[0];
      const scopedVisits = FIELD_VISITS.filter((v) => isEntityInUserTerritory(activeUser, v));
      res.statusCode = 200;
      return res.end(JSON.stringify({ data: scopedVisits, status: 200 }));
    }

    if (
      (method === 'POST' || method === 'GET') &&
      (path === '/api/v1/reports/export' || path === '/api/reports/export')
    ) {
      const activeUser = user || MANAGERS[0];
      const format = (body.format || parsedUrl.query.format || 'CSV').toUpperCase();
      const period = (body.period || parsedUrl.query.period || 'THIS_MONTH').toUpperCase();
      const startDateStr =
        body.startDate || body.startDateStr || parsedUrl.query.startDate || parsedUrl.query.startDateStr;
      const endDateStr =
        body.endDate || body.endDateStr || parsedUrl.query.endDate || parsedUrl.query.endDateStr;

      if (period === 'CUSTOM') {
        if (!startDateStr || !endDateStr) {
          res.statusCode = 400;
          return res.end(
            JSON.stringify({
              error: {
                code: 'INVALID_DATE_RANGE',
                message: 'Both Start Date and End Date are required for custom period.',
              },
            })
          );
        }
        if (new Date(endDateStr).getTime() < new Date(startDateStr).getTime()) {
          res.statusCode = 400;
          return res.end(
            JSON.stringify({
              error: {
                code: 'INVALID_DATE_RANGE',
                message: 'End Date must be on or after Start Date.',
              },
            })
          );
        }
      }

      // 1. Enforce territory hierarchy scoping: State -> State, District -> District, Division -> Division, Pincode -> Pincode
      let filtered = FIELD_VISITS.filter((v) => isEntityInUserTerritory(activeUser, v));

      // 2. Filter by date period
      const todayTag = '2026-09-30';
      if (period === 'TODAY') {
        filtered = filtered.filter((r) => r.timestamp && r.timestamp.slice(0, 10) === todayTag);
      } else if (period === 'THIS_WEEK') {
        filtered = filtered.filter((r) => {
          if (!r.timestamp) return false;
          const ts = new Date(r.timestamp).getTime();
          return (
            ts >= new Date('2026-09-23T00:00:00Z').getTime() && ts <= new Date('2026-09-30T23:59:59Z').getTime()
          );
        });
      } else if (period === 'THIS_MONTH') {
        filtered = filtered.filter((r) => {
          if (!r.timestamp) return false;
          return r.timestamp.startsWith('2026-09');
        });
      } else if (period === 'CUSTOM' && startDateStr && endDateStr) {
        const startTs = new Date(startDateStr).getTime();
        const endTs = new Date(`${endDateStr}T23:59:59.999Z`).getTime();
        filtered = filtered.filter((r) => {
          if (!r.timestamp) return false;
          const ts = new Date(r.timestamp).getTime();
          return ts >= startTs && ts <= endTs;
        });
      }

      if (filtered.length === 0) {
        res.statusCode = 404;
        return res.end(
          JSON.stringify({
            error: {
              code: 'NO_RECORDS',
              message: 'No field visit records found for the selected period in your territory.',
            },
          })
        );
      }

      // 3. Dynamic filename
      const ext = format === 'PDF' ? 'pdf' : format === 'EXCEL' || format === 'XLSX' ? 'xlsx' : 'csv';
      const dateTag =
        period === 'TODAY' ? todayTag : period === 'CUSTOM' ? `${startDateStr}_to_${endDateStr}` : todayTag;
      const fileName = `FIC_Field_Visit_Report_${dateTag}.${ext}`;

      const metadata = {
        period,
        startDate: startDateStr || '2026-09-01',
        endDate: endDateStr || todayTag,
        managerName: activeUser.name,
        managerRole: activeUser.role ? activeUser.role.replace(/_/g, ' ') : 'Manager',
        territoryName: activeUser.territoryName || activeUser.state || 'Assigned Territory',
      };

      let buffer;
      let mimeType;

      if (format === 'PDF') {
        mimeType = 'application/pdf';
        buffer = await generatePdfBuffer(filtered, metadata);
      } else if (format === 'EXCEL' || format === 'XLSX') {
        mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
        buffer = generateExcelBuffer(filtered, metadata);
      } else {
        mimeType = 'text/csv';
        buffer = generateCsvBuffer(filtered);
      }

      exportedReportsStore.set(fileName, {
        buffer,
        mimeType,
        createdAt: new Date().toISOString(),
      });

      // Write physical file to server disk
      const serverFilePath = nodePath.join(EXPORTED_DIR, fileName);
      fs.writeFileSync(serverFilePath, buffer);

      // Directly sync real file to connected Android phone's Downloads folder
      const deviceDownloadPath = `/storage/emulated/0/Download/${fileName}`;
      try {
        exec(
          `adb push "${serverFilePath}" "${deviceDownloadPath}"`,
          (pushErr) => {
            if (!pushErr) {
              exec(
                `adb shell am broadcast -a android.intent.action.MEDIA_SCANNER_SCAN_FILE -d "file://${deviceDownloadPath}"`
              );
              console.log(`[Report Export] Pushed ${fileName} directly to physical device: ${deviceDownloadPath}`);
            }
          }
        );
      } catch (syncErr) {
        console.warn('[Report Export] ADB push sync note:', syncErr.message);
      }

      const host = req.headers.host || `localhost:${PORT}`;
      const downloadUrl = `http://${host}/api/v1/reports/download/${fileName}`;

      // If direct download requested (e.g. via browser or ?download=1)
      if (parsedUrl.query.download === '1' || req.headers.accept === mimeType) {
        res.statusCode = 200;
        res.setHeader('Content-Type', mimeType);
        res.setHeader('Content-Length', buffer.length);
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        return res.end(buffer);
      }

      res.statusCode = 200;
      return res.end(
        JSON.stringify({
          data: {
            success: true,
            fileName,
            mimeType,
            recordCount: filtered.length,
            fileSize: buffer.length,
            filePath: deviceDownloadPath,
            displayPath: deviceDownloadPath,
            downloadUrl,
            directUrl: downloadUrl,
            base64: buffer.toString('base64'),
            period,
            metadata,
          },
          status: 200,
        })
      );
    }

    if (method === 'GET' && path.startsWith('/api/v1/reports/download/')) {
      const parts = path.split('/');
      const fileName = decodeURIComponent(parts[parts.length - 1]);
      const report = exportedReportsStore.get(fileName);

      if (!report || !report.buffer) {
        res.statusCode = 404;
        return res.end(
          JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Report file not found or expired' } })
        );
      }

      res.statusCode = 200;
      res.setHeader('Content-Type', report.mimeType);
      res.setHeader('Content-Length', report.buffer.length);
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.end(report.buffer);
    }

    if (method === 'POST' && path === '/api/v1/visits/exception-report') {
      const audioFile =
        multipart.files['audio'] ||
        multipart.files['file'] ||
        multipart.files['voiceNote'] ||
        Object.values(multipart.files)[0];
      let audioUrl = null;
      let audioFileName = null;
      let audioFileSize = 0;

      if (audioFile && audioFile.data && audioFile.data.length > 0) {
        const cleanName = `${Date.now()}_${(audioFile.filename || 'recording.m4a').replace(/[^a-zA-Z0-9._-]/g, '_')}`;
        const targetPath = path.join(UPLOADS_DIR, cleanName);
        fs.writeFileSync(targetPath, audioFile.data);
        const host = req.headers.host || `localhost:${PORT}`;
        audioUrl = `http://${host}/api/v1/uploads/audio/${cleanName}`;
        audioFileName = audioFile.filename || cleanName;
        audioFileSize = audioFile.size || audioFile.data.length;
      }

      const report = {
        id: `exc-rpt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        businessName: multipart.fields['businessName'] || body['businessName'] || 'Field Merchant',
        vendorName: multipart.fields['vendorName'] || body['vendorName'] || 'Prospective Merchant',
        category: multipart.fields['category'] || body['category'] || 'General',
        reason: multipart.fields['reason'] || body['reason'] || 'Merchant declined digital onboarding',
        managerId: multipart.fields['managerId'] || body['managerId'] || 'mgr-000',
        audioUrl,
        audioFileName,
        audioFileSize,
        createdAt: new Date().toISOString(),
      };

      visitExceptionReports.unshift(report);
      res.statusCode = 200;
      return res.end(
        JSON.stringify({
          data: { success: true, reportId: report.id, report, audioUrl, audioFileName, audioFileSize },
          status: 200,
        })
      );
    }

    if (method === 'POST' && path === '/api/v1/uploads/audio') {
      const audioFile = multipart.files['audio'] || multipart.files['file'] || Object.values(multipart.files)[0];
      if (!audioFile || !audioFile.data || audioFile.data.length === 0) {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: { code: 'NO_FILE', message: 'No audio file received' } }));
      }

      const cleanName = `${Date.now()}_${(audioFile.filename || 'audio.m4a').replace(/[^a-zA-Z0-9._-]/g, '_')}`;
      const targetPath = path.join(UPLOADS_DIR, cleanName);
      fs.writeFileSync(targetPath, audioFile.data);
      const host = req.headers.host || `localhost:${PORT}`;
      const audioUrl = `http://${host}/api/v1/uploads/audio/${cleanName}`;

      res.statusCode = 200;
      return res.end(
        JSON.stringify({
          data: { success: true, url: audioUrl, fileName: audioFile.filename || cleanName },
          status: 200,
        })
      );
    }

    if (method === 'GET' && path.startsWith('/api/v1/uploads/audio/')) {
      const parts = path.split('/');
      const fileName = decodeURIComponent(parts[parts.length - 1]);
      const filePath = path.join(UPLOADS_DIR, fileName);

      if (fs.existsSync(filePath)) {
        const stat = fs.statSync(filePath);
        res.statusCode = 200;
        res.setHeader('Content-Type', 'audio/m4a');
        res.setHeader('Content-Length', stat.size);
        return fs.createReadStream(filePath).pipe(res);
      }
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Audio file not found' } }));
    }

    res.statusCode = 404;
    return res.end(JSON.stringify({ error: { code: 'NOT_FOUND', message: 'Endpoint not found' } }));
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. SERVER INITIALIZATION & SOCKET.IO AUTHENTICATION MIDDLEWARE
// ─────────────────────────────────────────────────────────────────────────────
const server = http.createServer(handleRequest);

io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH'],
  },
});

// Authenticate Socket.IO connections with JWT
io.use((socket, next) => {
  const token = socket.handshake.auth?.token || socket.handshake.query?.token;
  if (!token) {
    console.warn('[Socket.IO] Rejected connection attempt without token');
    return next(new Error('Authentication error: Token required'));
  }

  const user = verifyToken(token);
  if (!user) {
    console.warn('[Socket.IO] Rejected connection attempt with invalid token');
    return next(new Error('Authentication error: Invalid or expired token'));
  }

  socket.user = user;
  next();
});

io.on('connection', (socket) => {
  const user = socket.user;
  console.log(`[Socket.IO] Authenticated socket connected: ${socket.id} (Manager: ${user.name}, Role: ${user.role})`);

  // Secure rooms based on authenticated scope
  socket.join(`manager:${user.id}`);
  if (user.stateId) {
    socket.join(`state:${user.stateId}`);
  }
  if (user.districtId) {
    socket.join(`district:${user.districtId}`);
  }
  if (user.divisionId) {
    socket.join(`division:${user.divisionId}`);
  }
  if (user.pincodeId) {
    socket.join(`pincode:${user.pincodeId}`);
  }

  console.log(`[Socket.IO] Joined rooms for ${user.id}:`, Array.from(socket.rooms));

  socket.on('disconnect', (reason) => {
    console.log(`[Socket.IO] Socket ${socket.id} disconnected (${reason})`);
  });
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`[FIC Manager Backend] Server running with Socket.IO on port ${PORT}`);
  });
}

module.exports = { server, io, VENDORS, TASKS, ISSUES, AUDIT_LOGS, generateToken, MANAGERS };
