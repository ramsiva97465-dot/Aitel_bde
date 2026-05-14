// =============================================================
// SEED DATA — AI Telecalling Lead Management System
// =============================================================
// Future: Replace mock data with API calls from services/api.js
// =============================================================

export const USERS = [
  {
    id: 'u1',
    name: 'Admin User',
    email: 'admin@aitel.com',
    password: 'admin123',
    role: 'admin',
    phone: '9000000001',
    status: 'active',
  },
  {
    id: 'u2',
    name: 'Ravi Kumar',
    email: 'bde1@aitel.com',
    password: 'bde123',
    role: 'bde',
    phone: '9000000002',
    status: 'active',
  },
  {
    id: 'u3',
    name: 'Priya Sharma',
    email: 'bde2@aitel.com',
    password: 'bde123',
    role: 'bde',
    phone: '9000000003',
    status: 'active',
  },
  {
    id: 'u4',
    name: 'Arjun Nair',
    email: 'bde3@aitel.com',
    password: 'bde123',
    role: 'bde',
    phone: '9000000004',
    status: 'active',
  },
];

export const LEAD_SOURCES = ['Meta Ads', 'Company Portal'];
export const LEAD_STATUSES = [
  'New',
  'Contacted',
  'Call Not Answered',
  'Interested',
  'Not Interested',
  'Callback',
  'Follow Up',
  'Converted',
];

export const LEADS = [
  {
    id: 'l1', customerName: 'Amit Verma', phone: '9811001001', email: 'amit@example.com',
    companyName: 'TechSoft Pvt Ltd', requirement: 'AI Voice Bot for customer support',
    source: 'Meta Ads', assignedTo: 'u2', status: 'Contacted',
    createdAt: '2026-05-01T09:00:00Z',
    notes: [{ text: 'Client showed interest in demo.', createdAt: '2026-05-01T10:00:00Z', by: 'Ravi Kumar' }],
    statusHistory: [
      { status: 'New', date: '2026-05-01T09:00:00Z', updatedBy: 'Admin User', notes: 'Lead created' },
      { status: 'Contacted', date: '2026-05-01T10:00:00Z', updatedBy: 'Ravi Kumar', notes: 'Called and discussed.' },
    ],
  },
  {
    id: 'l2', customerName: 'Neha Singh', phone: '9811001002', email: 'neha@example.com',
    companyName: 'Growfast Solutions', requirement: 'Telecalling automation',
    source: 'Meta Ads', assignedTo: 'u2', status: 'Interested',
    createdAt: '2026-05-02T09:00:00Z',
    notes: [],
    statusHistory: [
      { status: 'New', date: '2026-05-02T09:00:00Z', updatedBy: 'Admin User', notes: 'Lead created' },
      { status: 'Contacted', date: '2026-05-02T11:00:00Z', updatedBy: 'Ravi Kumar', notes: '' },
      { status: 'Interested', date: '2026-05-03T09:00:00Z', updatedBy: 'Ravi Kumar', notes: 'Wants quotation.' },
    ],
  },
  {
    id: 'l3', customerName: 'Suresh Babu', phone: '9811001003', email: 'suresh@example.com',
    companyName: 'Sunrise Logistics', requirement: 'Lead management system',
    source: 'Company Portal', assignedTo: 'u3', status: 'New',
    createdAt: '2026-05-03T09:00:00Z', notes: [], statusHistory: [
      { status: 'New', date: '2026-05-03T09:00:00Z', updatedBy: 'Admin User', notes: 'Lead created' },
    ],
  },
  {
    id: 'l4', customerName: 'Pooja Mehta', phone: '9811001004', email: 'pooja@example.com',
    companyName: 'CloudPeak IT', requirement: 'AI chatbot integration',
    source: 'Meta Ads', assignedTo: 'u3', status: 'Callback',
    createdAt: '2026-05-03T10:00:00Z', notes: [], statusHistory: [
      { status: 'New', date: '2026-05-03T10:00:00Z', updatedBy: 'Admin User', notes: '' },
      { status: 'Callback', date: '2026-05-04T09:00:00Z', updatedBy: 'Priya Sharma', notes: 'Call back on Monday.' },
    ],
  },
  {
    id: 'l5', customerName: 'Karthik Rajan', phone: '9811001005', email: 'karthik@example.com',
    companyName: 'Innovate Hub', requirement: 'Voice bot for IVR',
    source: 'Company Portal', assignedTo: 'u4', status: 'Converted',
    createdAt: '2026-05-01T08:00:00Z', notes: [], statusHistory: [
      { status: 'New', date: '2026-05-01T08:00:00Z', updatedBy: 'Admin User', notes: '' },
      { status: 'Interested', date: '2026-05-02T09:00:00Z', updatedBy: 'Arjun Nair', notes: '' },
      { status: 'Converted', date: '2026-05-05T09:00:00Z', updatedBy: 'Arjun Nair', notes: 'Signed contract.' },
    ],
  },
  {
    id: 'l6', customerName: 'Divya Pillai', phone: '9811001006', email: 'divya@example.com',
    companyName: 'BrightPath Edu', requirement: 'Student enquiry bot',
    source: 'Meta Ads', assignedTo: 'u4', status: 'Not Interested',
    createdAt: '2026-05-04T09:00:00Z', notes: [], statusHistory: [
      { status: 'New', date: '2026-05-04T09:00:00Z', updatedBy: 'Admin User', notes: '' },
      { status: 'Not Interested', date: '2026-05-05T10:00:00Z', updatedBy: 'Arjun Nair', notes: 'Budget constraint.' },
    ],
  },
  {
    id: 'l7', customerName: 'Manoj Tiwari', phone: '9811001007', email: 'manoj@example.com',
    companyName: 'QuickServe India', requirement: 'Automated follow-up calls',
    source: 'Meta Ads', assignedTo: 'u2', status: 'Follow Up',
    createdAt: '2026-05-05T09:00:00Z', notes: [], statusHistory: [
      { status: 'New', date: '2026-05-05T09:00:00Z', updatedBy: 'Admin User', notes: '' },
      { status: 'Follow Up', date: '2026-05-06T09:00:00Z', updatedBy: 'Ravi Kumar', notes: 'Follow up on Friday.' },
    ],
  },
  {
    id: 'l8', customerName: 'Sneha Joshi', phone: '9811001008', email: 'sneha@example.com',
    companyName: 'DataBridge Corp', requirement: 'AI sales assistant',
    source: 'Company Portal', assignedTo: null, status: 'New',
    createdAt: '2026-05-06T09:00:00Z', notes: [], statusHistory: [
      { status: 'New', date: '2026-05-06T09:00:00Z', updatedBy: 'Admin User', notes: '' },
    ],
  },
  {
    id: 'l9', customerName: 'Vikram Rao', phone: '9811001009', email: 'vikram@example.com',
    companyName: 'FutureTech Labs', requirement: 'Speech analytics',
    source: 'Meta Ads', assignedTo: null, status: 'New',
    createdAt: '2026-05-06T10:00:00Z', notes: [], statusHistory: [
      { status: 'New', date: '2026-05-06T10:00:00Z', updatedBy: 'Admin User', notes: '' },
    ],
  },
  {
    id: 'l10', customerName: 'Aarti Desai', phone: '9811001010', email: 'aarti@example.com',
    companyName: 'SmartCall BPO', requirement: 'BPO automation platform',
    source: 'Company Portal', assignedTo: null, status: 'New',
    createdAt: '2026-05-07T09:00:00Z', notes: [], statusHistory: [
      { status: 'New', date: '2026-05-07T09:00:00Z', updatedBy: 'Admin User', notes: '' },
    ],
  },
  {
    id: 'l11', customerName: 'Rajesh Kulkarni', phone: '9811001011', email: 'rajesh@example.com',
    companyName: 'PeakSales Ltd', requirement: 'Outbound calling bot',
    source: 'Meta Ads', assignedTo: null, status: 'New',
    createdAt: '2026-05-07T10:00:00Z', notes: [], statusHistory: [
      { status: 'New', date: '2026-05-07T10:00:00Z', updatedBy: 'Admin User', notes: '' },
    ],
  },
  {
    id: 'l12', customerName: 'Meera Krishnan', phone: '9811001012', email: 'meera@example.com',
    companyName: 'HealthFirst Clinic', requirement: 'Patient appointment bot',
    source: 'Company Portal', assignedTo: null, status: 'New',
    createdAt: '2026-05-07T11:00:00Z', notes: [], statusHistory: [
      { status: 'New', date: '2026-05-07T11:00:00Z', updatedBy: 'Admin User', notes: '' },
    ],
  },
  {
    id: 'l13', customerName: 'Aakash Patel', phone: '9811001013', email: 'aakash@example.com',
    companyName: 'RetailKing', requirement: 'Customer feedback bot',
    source: 'Meta Ads', assignedTo: 'u3', status: 'Contacted',
    createdAt: '2026-05-08T09:00:00Z', notes: [], statusHistory: [
      { status: 'New', date: '2026-05-08T09:00:00Z', updatedBy: 'Admin User', notes: '' },
      { status: 'Contacted', date: '2026-05-08T11:00:00Z', updatedBy: 'Priya Sharma', notes: '' },
    ],
  },
  {
    id: 'l14', customerName: 'Lakshmi Narayanan', phone: '9811001014', email: 'lakshmi@example.com',
    companyName: 'EduGrow Academy', requirement: 'Admissions calling system',
    source: 'Company Portal', assignedTo: 'u3', status: 'Interested',
    createdAt: '2026-05-08T10:00:00Z', notes: [], statusHistory: [
      { status: 'New', date: '2026-05-08T10:00:00Z', updatedBy: 'Admin User', notes: '' },
      { status: 'Interested', date: '2026-05-09T09:00:00Z', updatedBy: 'Priya Sharma', notes: '' },
    ],
  },
  {
    id: 'l15', customerName: 'Ganesh Murthy', phone: '9811001015', email: 'ganesh@example.com',
    companyName: 'AutoDrive Pvt', requirement: 'Car dealership lead bot',
    source: 'Meta Ads', assignedTo: 'u4', status: 'Contacted',
    createdAt: '2026-05-08T11:00:00Z', notes: [], statusHistory: [
      { status: 'New', date: '2026-05-08T11:00:00Z', updatedBy: 'Admin User', notes: '' },
      { status: 'Contacted', date: '2026-05-09T10:00:00Z', updatedBy: 'Arjun Nair', notes: '' },
    ],
  },
  {
    id: 'l16', customerName: 'Farida Khan', phone: '9811001016', email: 'farida@example.com',
    companyName: 'FashionBuzz', requirement: 'E-commerce order status bot',
    source: 'Company Portal', assignedTo: 'u2', status: 'New',
    createdAt: '2026-05-09T09:00:00Z', notes: [], statusHistory: [
      { status: 'New', date: '2026-05-09T09:00:00Z', updatedBy: 'Admin User', notes: '' },
    ],
  },
  {
    id: 'l17', customerName: 'Naveen Chandra', phone: '9811001017', email: 'naveen@example.com',
    companyName: 'PropTech Homes', requirement: 'Real estate lead qualification',
    source: 'Meta Ads', assignedTo: 'u2', status: 'Callback',
    createdAt: '2026-05-09T10:00:00Z', notes: [], statusHistory: [
      { status: 'New', date: '2026-05-09T10:00:00Z', updatedBy: 'Admin User', notes: '' },
      { status: 'Callback', date: '2026-05-10T09:00:00Z', updatedBy: 'Ravi Kumar', notes: 'Request callback.' },
    ],
  },
  {
    id: 'l18', customerName: 'Rekha Bose', phone: '9811001018', email: 'rekha@example.com',
    companyName: 'LegalEase India', requirement: 'Legal consultation bot',
    source: 'Company Portal', assignedTo: 'u3', status: 'New',
    createdAt: '2026-05-10T09:00:00Z', notes: [], statusHistory: [
      { status: 'New', date: '2026-05-10T09:00:00Z', updatedBy: 'Admin User', notes: '' },
    ],
  },
  {
    id: 'l19', customerName: 'Santosh Hegde', phone: '9811001019', email: 'santosh@example.com',
    companyName: 'FinServe Corp', requirement: 'Loan application calling',
    source: 'Meta Ads', assignedTo: 'u4', status: 'Interested',
    createdAt: '2026-05-10T10:00:00Z', notes: [], statusHistory: [
      { status: 'New', date: '2026-05-10T10:00:00Z', updatedBy: 'Admin User', notes: '' },
      { status: 'Interested', date: '2026-05-11T09:00:00Z', updatedBy: 'Arjun Nair', notes: '' },
    ],
  },
  {
    id: 'l20', customerName: 'Preethi Subramanian', phone: '9811001020', email: 'preethi@example.com',
    companyName: 'TravelNow India', requirement: 'Travel booking assistant',
    source: 'Company Portal', assignedTo: null, status: 'New',
    createdAt: '2026-05-11T09:00:00Z', notes: [], statusHistory: [
      { status: 'New', date: '2026-05-11T09:00:00Z', updatedBy: 'Admin User', notes: '' },
    ],
  },
  {
    id: 'l21', customerName: 'Dinesh Kapoor', phone: '9811001021', email: 'dinesh@example.com',
    companyName: 'HospitalityPro', requirement: 'Hotel reservation bot',
    source: 'Meta Ads', assignedTo: null, status: 'New',
    createdAt: '2026-05-11T10:00:00Z', notes: [], statusHistory: [
      { status: 'New', date: '2026-05-11T10:00:00Z', updatedBy: 'Admin User', notes: '' },
    ],
  },
  {
    id: 'l22', customerName: 'Sunita Agarwal', phone: '9811001022', email: 'sunita@example.com',
    companyName: 'PharmaCare Plus', requirement: 'Medical appointment reminder bot',
    source: 'Company Portal', assignedTo: null, status: 'New',
    createdAt: '2026-05-11T11:00:00Z', notes: [], statusHistory: [
      { status: 'New', date: '2026-05-11T11:00:00Z', updatedBy: 'Admin User', notes: '' },
    ],
  },
  {
    id: 'l23', customerName: 'Ramesh Gupta', phone: '9811001023', email: 'ramesh@example.com',
    companyName: 'AgriTech Farms', requirement: 'Farmer advisory call system',
    source: 'Meta Ads', assignedTo: 'u2', status: 'Converted',
    createdAt: '2026-05-04T09:00:00Z', notes: [], statusHistory: [
      { status: 'New', date: '2026-05-04T09:00:00Z', updatedBy: 'Admin User', notes: '' },
      { status: 'Interested', date: '2026-05-05T09:00:00Z', updatedBy: 'Ravi Kumar', notes: '' },
      { status: 'Converted', date: '2026-05-08T09:00:00Z', updatedBy: 'Ravi Kumar', notes: 'Deal closed.' },
    ],
  },
  {
    id: 'l24', customerName: 'Kavitha Reddy', phone: '9811001024', email: 'kavitha@example.com',
    companyName: 'InsurePlus', requirement: 'Insurance renewal reminder bot',
    source: 'Company Portal', assignedTo: 'u3', status: 'Follow Up',
    createdAt: '2026-05-09T09:00:00Z', notes: [], statusHistory: [
      { status: 'New', date: '2026-05-09T09:00:00Z', updatedBy: 'Admin User', notes: '' },
      { status: 'Follow Up', date: '2026-05-10T09:00:00Z', updatedBy: 'Priya Sharma', notes: '' },
    ],
  },
  {
    id: 'l25', customerName: 'Vishal Pandey', phone: '9811001025', email: 'vishal@example.com',
    companyName: 'EdTechPro', requirement: 'Online course counselling bot',
    source: 'Meta Ads', assignedTo: 'u4', status: 'Contacted',
    createdAt: '2026-05-09T10:00:00Z', notes: [], statusHistory: [
      { status: 'New', date: '2026-05-09T10:00:00Z', updatedBy: 'Admin User', notes: '' },
      { status: 'Contacted', date: '2026-05-10T09:00:00Z', updatedBy: 'Arjun Nair', notes: '' },
    ],
  },
  {
    id: 'l26', customerName: 'Nisha Sharma', phone: '9811001026', email: 'nisha@example.com',
    companyName: 'RetailMax', requirement: 'Promotional call bot',
    source: 'Company Portal', assignedTo: null, status: 'New',
    createdAt: '2026-05-12T09:00:00Z', notes: [], statusHistory: [
      { status: 'New', date: '2026-05-12T09:00:00Z', updatedBy: 'Admin User', notes: '' },
    ],
  },
  {
    id: 'l27', customerName: 'Aruna Krishnamurthy', phone: '9811001027', email: 'aruna@example.com',
    companyName: 'SpeedCourier', requirement: 'Delivery status notification bot',
    source: 'Meta Ads', assignedTo: null, status: 'New',
    createdAt: '2026-05-12T10:00:00Z', notes: [], statusHistory: [
      { status: 'New', date: '2026-05-12T10:00:00Z', updatedBy: 'Admin User', notes: '' },
    ],
  },
  {
    id: 'l28', customerName: 'Harish Iyer', phone: '9811001028', email: 'harish@example.com',
    companyName: 'GreenEnergy Ltd', requirement: 'Solar panel enquiry bot',
    source: 'Company Portal', assignedTo: 'u2', status: 'Interested',
    createdAt: '2026-05-10T09:00:00Z', notes: [], statusHistory: [
      { status: 'New', date: '2026-05-10T09:00:00Z', updatedBy: 'Admin User', notes: '' },
      { status: 'Interested', date: '2026-05-11T09:00:00Z', updatedBy: 'Ravi Kumar', notes: '' },
    ],
  },
  {
    id: 'l29', customerName: 'Vimal Raj', phone: '9811001029', email: 'vimal@example.com',
    companyName: 'ConstructPro', requirement: 'Construction project lead bot',
    source: 'Meta Ads', assignedTo: 'u3', status: 'Contacted',
    createdAt: '2026-05-11T09:00:00Z', notes: [], statusHistory: [
      { status: 'New', date: '2026-05-11T09:00:00Z', updatedBy: 'Admin User', notes: '' },
      { status: 'Contacted', date: '2026-05-12T09:00:00Z', updatedBy: 'Priya Sharma', notes: '' },
    ],
  },
  {
    id: 'l30', customerName: 'Shanthi Balasubramaniam', phone: '9811001030', email: 'shanthi@example.com',
    companyName: 'WellnessFirst', requirement: 'Health & wellness consultation bot',
    source: 'Company Portal', assignedTo: 'u4', status: 'New',
    createdAt: '2026-05-12T11:00:00Z', notes: [], statusHistory: [
      { status: 'New', date: '2026-05-12T11:00:00Z', updatedBy: 'Admin User', notes: '' },
    ],
  },
];

export const FOLLOWUPS = [
  {
    id: 'f1', leadId: 'l7', bdeId: 'u2',
    date: '2026-05-16', time: '10:00', notes: 'Discuss pricing options', status: 'Pending',
  },
  {
    id: 'f2', leadId: 'l17', bdeId: 'u2',
    date: '2026-05-14', time: '15:00', notes: 'Second callback attempt', status: 'Pending',
  },
  {
    id: 'f3', leadId: 'l24', bdeId: 'u3',
    date: '2026-05-15', time: '11:00', notes: 'Review requirements', status: 'Pending',
  },
];

export const NOTIFICATIONS = [
  {
    id: 'n1', userId: 'u2', title: 'New Lead Assigned',
    message: 'Lead "Amit Verma" has been assigned to you.',
    type: 'lead_assigned', isRead: false, createdAt: '2026-05-01T09:05:00Z',
  },
  {
    id: 'n2', userId: 'u2', title: 'New Lead Assigned',
    message: 'Lead "Neha Singh" has been assigned to you.',
    type: 'lead_assigned', isRead: true, createdAt: '2026-05-02T09:05:00Z',
  },
  {
    id: 'n3', userId: 'u3', title: 'New Lead Assigned',
    message: 'Lead "Suresh Babu" has been assigned to you.',
    type: 'lead_assigned', isRead: false, createdAt: '2026-05-03T09:05:00Z',
  },
  {
    id: 'n4', userId: 'u4', title: 'New Lead Assigned',
    message: 'Lead "Karthik Rajan" has been assigned to you.',
    type: 'lead_assigned', isRead: true, createdAt: '2026-05-01T08:05:00Z',
  },
  {
    id: 'n5', userId: 'u2', title: 'Follow-up Due',
    message: 'Follow-up with "Manoj Tiwari" is scheduled for May 16.',
    type: 'follow_up_due', isRead: false, createdAt: '2026-05-06T09:05:00Z',
  },
  {
    id: 'n6', userId: 'u4', title: 'Lead Converted',
    message: 'Lead "Karthik Rajan" has been converted successfully.',
    type: 'lead_converted', isRead: false, createdAt: '2026-05-05T09:05:00Z',
  },
  {
    id: 'n7', userId: 'u1', title: 'Lead Converted',
    message: 'Arjun Nair converted lead "Karthik Rajan".',
    type: 'lead_converted', isRead: false, createdAt: '2026-05-05T09:06:00Z',
  },
  {
    id: 'n8', userId: 'u1', title: 'New Lead from Meta Ads',
    message: '5 new leads received from Meta Ads campaign.',
    type: 'new_lead', isRead: true, createdAt: '2026-05-07T08:00:00Z',
  },
];

export const INVOICES = [
  {
    id: 'inv1', leadId: 'l5', invoiceNumber: 'INV-2026-001',
    serviceName: 'AI Voice Bot — IVR Setup', quantity: 1,
    price: 75000, tax: 18, total: 88500, createdAt: '2026-05-06T10:00:00Z',
  },
];

export const QUOTATIONS = [
  {
    id: 'q1', leadId: 'l2', quotationNumber: 'QT-2026-001',
    serviceName: 'Telecalling Automation Package', quantity: 1,
    price: 50000, tax: 18, total: 59000, createdAt: '2026-05-04T10:00:00Z',
  },
];
