import { daysAgo } from './helpers';

export const MOCK_LEADS = [
  { id: 'lead-001', leadNumber: 'LD-2026-001', fullName: 'Rajesh Kumar', phone: '+91 98765 43210', email: 'rajesh.k@email.com', loanAmount: 2500000, status: 'QUALIFIED', grade: 'A+', score: 92, productName: 'Home Loan', sourceName: 'Website', assignedToName: 'Priya Sharma', createdAt: daysAgo(0) },
  { id: 'lead-002', leadNumber: 'LD-2026-002', fullName: 'Anita Desai', phone: '+91 87654 32109', email: 'anita.d@email.com', loanAmount: 850000, status: 'IN_PROGRESS', grade: 'A', score: 85, productName: 'Personal Loan', sourceName: 'Partner', assignedToName: 'Amit Patel', createdAt: daysAgo(0) },
  { id: 'lead-003', leadNumber: 'LD-2026-003', fullName: 'Vikram Singh', phone: '+91 76543 21098', email: 'vikram.s@email.com', loanAmount: 4500000, status: 'ASSIGNED', grade: 'B+', score: 78, productName: 'Business Loan', sourceName: 'Referral', assignedToName: 'Neha Gupta', createdAt: daysAgo(1) },
  { id: 'lead-004', leadNumber: 'LD-2026-004', fullName: 'Sneha Reddy', phone: '+91 65432 10987', email: 'sneha.r@email.com', loanAmount: 1200000, status: 'OPEN', grade: 'B', score: 72, productName: 'Car Loan', sourceName: 'Walk-in', assignedToName: '—', createdAt: daysAgo(1) },
  { id: 'lead-005', leadNumber: 'LD-2026-005', fullName: 'Arjun Mehta', phone: '+91 94321 09876', email: 'arjun.m@email.com', loanAmount: 3200000, status: 'CONVERTED', grade: 'A+', score: 95, productName: 'Home Loan', sourceName: 'Website', assignedToName: 'Priya Sharma', createdAt: daysAgo(2) },
  { id: 'lead-006', leadNumber: 'LD-2026-006', fullName: 'Kavita Nair', phone: '+91 83210 98765', email: 'kavita.n@email.com', loanAmount: 600000, status: 'QUALIFIED', grade: 'A', score: 88, productName: 'Personal Loan', sourceName: 'Partner', assignedToName: 'Amit Patel', createdAt: daysAgo(2) },
  { id: 'lead-007', leadNumber: 'LD-2026-007', fullName: 'Rahul Joshi', phone: '+91 72109 87654', email: 'rahul.j@email.com', loanAmount: 1800000, status: 'LOST', grade: 'C', score: 55, productName: 'LAP', sourceName: 'Cold Call', assignedToName: 'Neha Gupta', createdAt: daysAgo(3) },
  { id: 'lead-008', leadNumber: 'LD-2026-008', fullName: 'Deepa Iyer', phone: '+91 61098 76543', email: 'deepa.i@email.com', loanAmount: 950000, status: 'IN_PROGRESS', grade: 'B+', score: 80, productName: 'Personal Loan', sourceName: 'Website', assignedToName: 'Priya Sharma', createdAt: daysAgo(3) },
  { id: 'lead-009', leadNumber: 'LD-2026-009', fullName: 'Manoj Pillai', phone: '+91 50987 65432', email: 'manoj.p@email.com', loanAmount: 5500000, status: 'ASSIGNED', grade: 'A', score: 86, productName: 'Business Loan', sourceName: 'Partner', assignedToName: 'Amit Patel', createdAt: daysAgo(4) },
  { id: 'lead-010', leadNumber: 'LD-2026-010', fullName: 'Pooja Agarwal', phone: '+91 49876 54321', email: 'pooja.a@email.com', loanAmount: 2100000, status: 'OPEN', grade: 'B', score: 70, productName: 'Home Loan', sourceName: 'Referral', assignedToName: '—', createdAt: daysAgo(5) },
  { id: 'lead-011', leadNumber: 'LD-2026-011', fullName: 'Suresh Babu', phone: '+91 38765 43210', email: 'suresh.b@email.com', loanAmount: 750000, status: 'QUALIFIED', grade: 'A+', score: 91, productName: 'Car Loan', sourceName: 'Website', assignedToName: 'Neha Gupta', createdAt: daysAgo(5) },
  { id: 'lead-012', leadNumber: 'LD-2026-012', fullName: 'Meera Krishnan', phone: '+91 27654 32109', email: 'meera.k@email.com', loanAmount: 3800000, status: 'CONVERTED', grade: 'A+', score: 94, productName: 'Home Loan', sourceName: 'Partner', assignedToName: 'Priya Sharma', createdAt: daysAgo(6) },
];

export const MOCK_CUSTOMERS = [
  { id: 'cust-001', customerNumber: 'CU-10001', fullName: 'Rajesh Kumar', phone: '+91 98765 43210', email: 'rajesh.k@email.com', status: 'ACTIVE', kycStatus: 'VERIFIED', createdAt: daysAgo(30) },
  { id: 'cust-002', customerNumber: 'CU-10002', fullName: 'Anita Desai', phone: '+91 87654 32109', email: 'anita.d@email.com', status: 'ACTIVE', kycStatus: 'VERIFIED', createdAt: daysAgo(45) },
  { id: 'cust-003', customerNumber: 'CU-10003', fullName: 'Vikram Singh', phone: '+91 76543 21098', email: 'vikram.s@email.com', status: 'ACTIVE', kycStatus: 'PENDING', createdAt: daysAgo(15) },
  { id: 'cust-004', customerNumber: 'CU-10004', fullName: 'Sneha Reddy', phone: '+91 65432 10987', email: 'sneha.r@email.com', status: 'ACTIVE', kycStatus: 'IN_REVIEW', createdAt: daysAgo(20) },
  { id: 'cust-005', customerNumber: 'CU-10005', fullName: 'Arjun Mehta', phone: '+91 94321 09876', email: 'arjun.m@email.com', status: 'ACTIVE', kycStatus: 'VERIFIED', createdAt: daysAgo(60) },
  { id: 'cust-006', customerNumber: 'CU-10006', fullName: 'Kavita Nair', phone: '+91 83210 98765', email: 'kavita.n@email.com', status: 'INACTIVE', kycStatus: 'VERIFIED', createdAt: daysAgo(90) },
  { id: 'cust-007', customerNumber: 'CU-10007', fullName: 'Deepa Iyer', phone: '+91 61098 76543', email: 'deepa.i@email.com', status: 'ACTIVE', kycStatus: 'VERIFIED', createdAt: daysAgo(10) },
  { id: 'cust-008', customerNumber: 'CU-10008', fullName: 'Manoj Pillai', phone: '+91 50987 65432', email: 'manoj.p@email.com', status: 'ACTIVE', kycStatus: 'REJECTED', createdAt: daysAgo(5) },
];

export const MOCK_APPLICATIONS = [
  { id: 'app-001', applicationNumber: 'AP-2026-001', customerId: 'cust-001', customerName: 'Rajesh Kumar', productName: 'Home Loan', loanAmount: 2500000, status: 'UNDER_REVIEW', createdAt: daysAgo(2) },
  { id: 'app-002', applicationNumber: 'AP-2026-002', customerId: 'cust-002', customerName: 'Anita Desai', productName: 'Personal Loan', loanAmount: 850000, status: 'SANCTIONED', createdAt: daysAgo(5) },
  { id: 'app-003', applicationNumber: 'AP-2026-003', customerId: 'cust-003', customerName: 'Vikram Singh', productName: 'Business Loan', loanAmount: 4500000, status: 'SUBMITTED', createdAt: daysAgo(1) },
  { id: 'app-004', applicationNumber: 'AP-2026-004', customerId: 'cust-004', customerName: 'Sneha Reddy', productName: 'Car Loan', loanAmount: 1200000, status: 'DRAFT', createdAt: daysAgo(0) },
  { id: 'app-005', applicationNumber: 'AP-2026-005', customerId: 'cust-005', customerName: 'Arjun Mehta', productName: 'Home Loan', loanAmount: 3200000, status: 'DISBURSED', createdAt: daysAgo(15) },
  { id: 'app-006', applicationNumber: 'AP-2026-006', customerId: 'cust-006', customerName: 'Kavita Nair', productName: 'Personal Loan', loanAmount: 600000, status: 'REJECTED', createdAt: daysAgo(8) },
  { id: 'app-007', applicationNumber: 'AP-2026-007', customerId: 'cust-007', customerName: 'Deepa Iyer', productName: 'LAP', loanAmount: 1800000, status: 'UNDER_REVIEW', createdAt: daysAgo(3) },
  { id: 'app-008', applicationNumber: 'AP-2026-008', customerId: 'cust-008', customerName: 'Manoj Pillai', productName: 'Business Loan', loanAmount: 5500000, status: 'SANCTIONED', createdAt: daysAgo(7) },
];

export const MOCK_DOCUMENTS = [
  { id: 'doc-001', documentNumber: 'DOC-001', documentType: 'PAN Card', type: 'PAN Card', customerId: 'cust-001', status: 'PENDING_VERIFICATION', ocrStatus: 'COMPLETED', createdAt: daysAgo(1), uploadedAt: daysAgo(1) },
  { id: 'doc-002', documentNumber: 'DOC-002', documentType: 'Aadhaar', type: 'Aadhaar', customerId: 'cust-002', status: 'PENDING_VERIFICATION', ocrStatus: 'COMPLETED', createdAt: daysAgo(0), uploadedAt: daysAgo(0) },
  { id: 'doc-003', documentNumber: 'DOC-003', documentType: 'Bank Statement', type: 'Bank Statement', customerId: 'cust-003', status: 'VERIFIED', ocrStatus: 'COMPLETED', createdAt: daysAgo(3), uploadedAt: daysAgo(3) },
  { id: 'doc-004', documentNumber: 'DOC-004', documentType: 'Salary Slip', type: 'Salary Slip', customerId: 'cust-001', status: 'VERIFIED', ocrStatus: 'COMPLETED', createdAt: daysAgo(5), uploadedAt: daysAgo(5) },
  { id: 'doc-005', documentNumber: 'DOC-005', documentType: 'ITR', type: 'ITR', customerId: 'cust-004', status: 'PENDING_VERIFICATION', ocrStatus: 'PROCESSING', createdAt: daysAgo(2), uploadedAt: daysAgo(2) },
  { id: 'doc-006', documentNumber: 'DOC-006', documentType: 'Property Papers', type: 'Property Papers', customerId: 'cust-005', status: 'APPROVED', ocrStatus: 'COMPLETED', createdAt: daysAgo(10), uploadedAt: daysAgo(10) },
];

export const MOCK_PARTNERS = [
  { id: 'ptr-001', partnerCode: 'PTR-MUM-01', businessName: 'FinServe Mumbai', contactName: 'Sanjay Malhotra', email: 'sanjay@finserve.in', phone: '+91 98200 11223', kycStatus: 'VERIFIED', commissionTier: 'GOLD', status: 'ACTIVE', createdAt: daysAgo(120) },
  { id: 'ptr-002', partnerCode: 'PTR-DEL-02', businessName: 'Capital Connect Delhi', contactName: 'Ritu Verma', email: 'ritu@capconnect.in', phone: '+91 98100 33445', kycStatus: 'VERIFIED', commissionTier: 'PLATINUM', status: 'ACTIVE', createdAt: daysAgo(90) },
  { id: 'ptr-003', partnerCode: 'PTR-BLR-03', businessName: 'LoanHub Bangalore', contactName: 'Karthik Rao', email: 'karthik@loanhub.in', phone: '+91 98450 55667', kycStatus: 'PENDING', commissionTier: 'SILVER', status: 'ACTIVE', createdAt: daysAgo(60) },
  { id: 'ptr-004', partnerCode: 'PTR-CHN-04', businessName: 'CreditWise Chennai', contactName: 'Lakshmi Venkat', email: 'lakshmi@creditwise.in', phone: '+91 98400 77889', kycStatus: 'VERIFIED', commissionTier: 'GOLD', status: 'ACTIVE', createdAt: daysAgo(45) },
  { id: 'ptr-005', partnerCode: 'PTR-HYD-05', businessName: 'TrustFinance Hyderabad', contactName: 'Abdul Rahman', email: 'abdul@trustfin.in', phone: '+91 98480 99001', kycStatus: 'VERIFIED', commissionTier: 'BRONZE', status: 'INACTIVE', createdAt: daysAgo(200) },
];

export const MOCK_REFERRALS = [
  { id: 'ref-001', referralCode: 'REF-RK2026', referrerName: 'Rajesh Kumar', refereeName: 'Suresh Babu', status: 'CONVERTED', rewardAmount: 2500, createdAt: daysAgo(10) },
  { id: 'ref-002', referralCode: 'REF-AD2026', referrerName: 'Anita Desai', refereeName: 'Pooja Agarwal', status: 'PENDING', rewardAmount: 1500, createdAt: daysAgo(5) },
  { id: 'ref-003', referralCode: 'REF-VS2026', referrerName: 'Vikram Singh', refereeName: 'Meera Krishnan', status: 'CONVERTED', rewardAmount: 5000, createdAt: daysAgo(20) },
  { id: 'ref-004', referralCode: 'REF-AM2026', referrerName: 'Arjun Mehta', refereeName: 'Deepa Iyer', status: 'EXPIRED', rewardAmount: 0, createdAt: daysAgo(45) },
];

export const MOCK_REFERRAL_TYPES = [
  { id: 'rt-001', name: 'Customer Referral', code: 'CUSTOMER', rewardAmount: 1500, status: 'ACTIVE' },
  { id: 'rt-002', name: 'Partner Referral', code: 'PARTNER', rewardAmount: 5000, status: 'ACTIVE' },
  { id: 'rt-003', name: 'Employee Referral', code: 'EMPLOYEE', rewardAmount: 2500, status: 'ACTIVE' },
];

export const MOCK_TICKETS = [
  { id: 'tkt-001', ticketNumber: 'TKT-2026-001', subject: 'Document upload failing', status: 'OPEN', priority: 'HIGH', category: 'Technical', customerName: 'Rajesh Kumar', assignedToName: 'Support Team A', createdAt: daysAgo(0) },
  { id: 'tkt-002', ticketNumber: 'TKT-2026-002', subject: 'Loan status not updating', status: 'IN_PROGRESS', priority: 'MEDIUM', category: 'Application', customerName: 'Anita Desai', assignedToName: 'Priya Sharma', createdAt: daysAgo(1) },
  { id: 'tkt-003', ticketNumber: 'TKT-2026-003', subject: 'Commission payout query', status: 'RESOLVED', priority: 'LOW', category: 'Finance', customerName: 'FinServe Mumbai', assignedToName: 'Finance Desk', createdAt: daysAgo(3) },
  { id: 'tkt-004', ticketNumber: 'TKT-2026-004', subject: 'KYC verification delay', status: 'ESCALATED', priority: 'HIGH', category: 'KYC', customerName: 'Vikram Singh', assignedToName: 'KYC Team', createdAt: daysAgo(2) },
  { id: 'tkt-005', ticketNumber: 'TKT-2026-005', subject: 'Partner onboarding help', status: 'OPEN', priority: 'MEDIUM', category: 'Partner', customerName: 'LoanHub Bangalore', assignedToName: 'Partner Desk', createdAt: daysAgo(1) },
];

export const MOCK_USERS = [
  { id: 'usr-001', email: 'admin@kuberone.com', fullName: 'Super Admin', phone: '+91 99999 99999', status: 'ACTIVE', userType: 'ADMIN', roles: ['SUPER_ADMIN'], createdAt: daysAgo(365) },
  { id: 'usr-002', email: 'priya.sharma@kuberone.com', fullName: 'Priya Sharma', phone: '+91 98765 11111', status: 'ACTIVE', userType: 'EMPLOYEE', roles: ['SALES_MANAGER'], createdAt: daysAgo(200) },
  { id: 'usr-003', email: 'amit.patel@kuberone.com', fullName: 'Amit Patel', phone: '+91 98765 22222', status: 'ACTIVE', userType: 'EMPLOYEE', roles: ['SALES_EXECUTIVE'], createdAt: daysAgo(180) },
  { id: 'usr-004', email: 'neha.gupta@kuberone.com', fullName: 'Neha Gupta', phone: '+91 98765 33333', status: 'ACTIVE', userType: 'EMPLOYEE', roles: ['SALES_EXECUTIVE'], createdAt: daysAgo(150) },
  { id: 'usr-005', email: 'finance@kuberone.com', fullName: 'Finance Desk', phone: '+91 98765 44444', status: 'ACTIVE', userType: 'EMPLOYEE', roles: ['FINANCE'], createdAt: daysAgo(300) },
];

export const MOCK_ROLES = [
  { id: 'role-001', name: 'SUPER_ADMIN', description: 'Full system access', status: 'ACTIVE' },
  { id: 'role-002', name: 'SALES_MANAGER', description: 'Manage sales team and leads', status: 'ACTIVE' },
  { id: 'role-003', name: 'SALES_EXECUTIVE', description: 'Handle assigned leads', status: 'ACTIVE' },
  { id: 'role-004', name: 'FINANCE', description: 'Commission and disbursement', status: 'ACTIVE' },
  { id: 'role-005', name: 'SUPPORT', description: 'Ticket management', status: 'ACTIVE' },
];

export const MOCK_PERMISSIONS = [
  { id: 'perm-001', code: 'leads.read', module: 'Leads', description: 'View leads' },
  { id: 'perm-002', code: 'leads.write', module: 'Leads', description: 'Create/edit leads' },
  { id: 'perm-003', code: 'customers.read', module: 'Customers', description: 'View customers' },
  { id: 'perm-004', code: 'applications.read', module: 'Applications', description: 'View applications' },
  { id: 'perm-005', code: 'commissions.read', module: 'Commissions', description: 'View commissions' },
  { id: 'perm-006', code: 'tickets.read', module: 'Support', description: 'View tickets' },
  { id: 'perm-007', code: 'users.read', module: 'Users', description: 'View users' },
  { id: 'perm-008', code: 'audit.read', module: 'Audit', description: 'View audit logs' },
];

export const MOCK_ROLE_PERMISSIONS = MOCK_ROLES.flatMap((role) =>
  MOCK_PERMISSIONS.slice(0, role.name === 'SUPER_ADMIN' ? 8 : 4).map((perm, i) => ({
    id: `rp-${role.id}-${i}`,
    roleId: role.id,
    roleName: role.name,
    permissionId: perm.id,
    permissionCode: perm.code,
  })),
);

export const MOCK_AUDIT_LOGS = [
  { id: 'aud-001', action: 'USER_LOGIN', entityType: 'User', entityId: 'usr-001', userEmail: 'admin@kuberone.com', ipAddress: '127.0.0.1', createdAt: daysAgo(0) },
  { id: 'aud-002', action: 'LEAD_CREATED', entityType: 'Lead', entityId: 'lead-001', userEmail: 'priya.sharma@kuberone.com', ipAddress: '192.168.1.10', createdAt: daysAgo(0) },
  { id: 'aud-003', action: 'DOCUMENT_VERIFIED', entityType: 'Document', entityId: 'doc-003', userEmail: 'admin@kuberone.com', ipAddress: '127.0.0.1', createdAt: daysAgo(1) },
  { id: 'aud-004', action: 'APPLICATION_SANCTIONED', entityType: 'Application', entityId: 'app-002', userEmail: 'finance@kuberone.com', ipAddress: '10.0.0.5', createdAt: daysAgo(2) },
  { id: 'aud-005', action: 'COMMISSION_APPROVED', entityType: 'Commission', entityId: 'com-001', userEmail: 'finance@kuberone.com', ipAddress: '10.0.0.5', createdAt: daysAgo(3) },
  { id: 'aud-006', action: 'TICKET_RESOLVED', entityType: 'Ticket', entityId: 'tkt-003', userEmail: 'admin@kuberone.com', ipAddress: '127.0.0.1', createdAt: daysAgo(3) },
];

export const MOCK_SETTINGS = [
  { id: 'set-001', key: 'company.name', value: 'Kuber Finserve Pvt Ltd', category: 'system', description: 'Company display name' },
  { id: 'set-002', key: 'company.support_email', value: 'support@kuberfinserve.com', category: 'system', description: 'Support email' },
  { id: 'set-003', key: 'security.session_timeout', value: '900', category: 'security', description: 'Session timeout in seconds' },
  { id: 'set-004', key: 'security.max_login_attempts', value: '5', category: 'security', description: 'Max failed login attempts' },
  { id: 'set-005', key: 'notification.email_enabled', value: 'true', category: 'notification', description: 'Enable email notifications' },
  { id: 'set-006', key: 'notification.sms_enabled', value: 'true', category: 'notification', description: 'Enable SMS notifications' },
  { id: 'set-007', key: 'ai.lead_scoring_enabled', value: 'true', category: 'AI', description: 'Enable AI lead scoring' },
  { id: 'set-008', key: 'ai.ocr_enabled', value: 'true', category: 'AI', description: 'Enable document OCR' },
];

export const MOCK_NOTIFICATIONS = [
  { id: 'notif-001', title: 'New lead assigned', message: 'Lead LD-2026-001 assigned to you', type: 'LEAD', status: 'UNREAD', createdAt: daysAgo(0) },
  { id: 'notif-002', title: 'Document pending review', message: 'PAN Card verification required for Rajesh Kumar', type: 'DOCUMENT', status: 'UNREAD', createdAt: daysAgo(0) },
  { id: 'notif-003', title: 'Commission approved', message: '₹12,500 commission approved for FinServe Mumbai', type: 'COMMISSION', status: 'READ', createdAt: daysAgo(1) },
  { id: 'notif-004', title: 'Ticket escalated', message: 'TKT-2026-004 escalated to KYC Team', type: 'SUPPORT', status: 'READ', createdAt: daysAgo(2) },
  { id: 'notif-005', title: 'Application sanctioned', message: 'AP-2026-002 sanctioned for Anita Desai', type: 'APPLICATION', status: 'READ', createdAt: daysAgo(3) },
];

export const MOCK_NOTIFICATION_TEMPLATES = [
  { id: 'tpl-001', name: 'Lead Assignment', channel: 'EMAIL', subject: 'New Lead Assigned', status: 'ACTIVE' },
  { id: 'tpl-002', name: 'OTP Login', channel: 'SMS', subject: 'Your OTP', status: 'ACTIVE' },
  { id: 'tpl-003', name: 'Document Request', channel: 'WHATSAPP', subject: 'Documents Required', status: 'ACTIVE' },
  { id: 'tpl-004', name: 'Loan Sanctioned', channel: 'EMAIL', subject: 'Congratulations!', status: 'ACTIVE' },
];

export const MOCK_COMMISSION_LEDGER = [
  { id: 'com-001', partnerName: 'FinServe Mumbai', applicationNumber: 'AP-2026-002', amount: 12500, status: 'APPROVED', createdAt: daysAgo(5) },
  { id: 'com-002', partnerName: 'Capital Connect Delhi', applicationNumber: 'AP-2026-005', amount: 28000, status: 'PAID', createdAt: daysAgo(10) },
  { id: 'com-003', partnerName: 'LoanHub Bangalore', applicationNumber: 'AP-2026-008', amount: 45000, status: 'PENDING', createdAt: daysAgo(3) },
  { id: 'com-004', partnerName: 'CreditWise Chennai', applicationNumber: 'AP-2026-001', amount: 8500, status: 'PENDING', createdAt: daysAgo(2) },
];

export const MOCK_PRODUCT_FAMILIES = [
  { id: 'pf-001', name: 'Retail Loans', code: 'RETAIL', status: 'ACTIVE', productCount: 4 },
  { id: 'pf-002', name: 'Business Loans', code: 'BUSINESS', status: 'ACTIVE', productCount: 2 },
  { id: 'pf-003', name: 'Secured Loans', code: 'SECURED', status: 'ACTIVE', productCount: 3 },
];

export const MOCK_PRODUCTS = [
  { id: 'prod-001', name: 'Home Loan', code: 'HL-001', familyName: 'Retail Loans', minAmount: 500000, maxAmount: 50000000, status: 'ACTIVE', interestRate: 8.5 },
  { id: 'prod-002', name: 'Personal Loan', code: 'PL-001', familyName: 'Retail Loans', minAmount: 50000, maxAmount: 2500000, status: 'ACTIVE', interestRate: 11.5 },
  { id: 'prod-003', name: 'Car Loan', code: 'CL-001', familyName: 'Retail Loans', minAmount: 100000, maxAmount: 5000000, status: 'ACTIVE', interestRate: 9.25 },
  { id: 'prod-004', name: 'Business Loan', code: 'BL-001', familyName: 'Business Loans', minAmount: 500000, maxAmount: 100000000, status: 'ACTIVE', interestRate: 12.0 },
  { id: 'prod-005', name: 'LAP', code: 'LAP-001', familyName: 'Secured Loans', minAmount: 300000, maxAmount: 25000000, status: 'ACTIVE', interestRate: 10.5 },
];

export const MOCK_LENDERS = [
  { id: 'lnd-001', name: 'HDFC Bank', code: 'HDFC', status: 'ACTIVE', productCount: 5 },
  { id: 'lnd-002', name: 'ICICI Bank', code: 'ICICI', status: 'ACTIVE', productCount: 4 },
  { id: 'lnd-003', name: 'Axis Bank', code: 'AXIS', status: 'ACTIVE', productCount: 3 },
  { id: 'lnd-004', name: 'Bajaj Finance', code: 'BAJAJ', status: 'ACTIVE', productCount: 2 },
];

export const MOCK_LEAD_ANALYTICS = {
  todayLeads: 12,
  qualifiedLeads: 48,
  hotLeads: 18,
  convertedLeads: 24,
  lostLeads: 8,
  byStatus: { OPEN: 15, ASSIGNED: 22, IN_PROGRESS: 18, QUALIFIED: 48, CONVERTED: 24, LOST: 8 },
  byGrade: { 'A+': 12, A: 28, 'B+': 35, B: 22, C: 8 },
  bySource: [
    { sourceId: 'website', sourceName: 'Website', count: 45 },
    { sourceId: 'partner', sourceName: 'Partner', count: 38 },
    { sourceId: 'referral', sourceName: 'Referral', count: 22 },
    { sourceId: 'walk-in', sourceName: 'Walk-in', count: 12 },
    { sourceId: 'cold-call', sourceName: 'Cold Call', count: 8 },
  ],
  branchPerformance: [
    { branchName: 'Mumbai', totalLeads: 85, converted: 22, lost: 5 },
    { branchName: 'Delhi', totalLeads: 72, converted: 18, lost: 4 },
    { branchName: 'Bangalore', totalLeads: 68, converted: 16, lost: 3 },
    { branchName: 'Chennai', totalLeads: 45, converted: 12, lost: 2 },
    { branchName: 'Hyderabad', totalLeads: 38, converted: 9, lost: 1 },
  ],
  executivePerformance: [
    { employeeName: 'Priya Sharma', totalLeads: 42, converted: 14, lost: 2 },
    { employeeName: 'Amit Patel', totalLeads: 38, converted: 11, lost: 3 },
    { employeeName: 'Neha Gupta', totalLeads: 35, converted: 10, lost: 1 },
    { employeeName: 'Rahul Joshi', totalLeads: 28, converted: 7, lost: 2 },
  ],
};

export const MOCK_COMMISSION_ANALYTICS = {
  commissionOutstanding: 630000,
  paidCommissions: 1820000,
  totals: { totalCommission: 2450000, entryCount: 156 },
  recoverySummary: { totalRecovered: 45000, count: 3 },
  partnerEarnings: [
    { partnerName: 'FinServe Mumbai', partnerCode: 'FSM', status: 'PAID', commissionAmount: 480000 },
    { partnerName: 'FinServe Mumbai', partnerCode: 'FSM', status: 'CALCULATED', commissionAmount: 40000 },
    { partnerName: 'Capital Connect Delhi', partnerCode: 'CCD', status: 'PAID', commissionAmount: 620000 },
    { partnerName: 'LoanHub Bangalore', partnerCode: 'LHB', status: 'PAID', commissionAmount: 350000 },
    { partnerName: 'LoanHub Bangalore', partnerCode: 'LHB', status: 'APPROVED', commissionAmount: 70000 },
  ],
  branchPerformance: [
    { branchName: 'Mumbai', _count: 42, _sum: { commissionAmount: 850000 } },
    { branchName: 'Delhi', _count: 38, _sum: { commissionAmount: 720000 } },
    { branchName: 'Bangalore', _count: 31, _sum: { commissionAmount: 580000 } },
  ],
  productPerformance: [
    { productName: 'Home Loan', _count: 28, _sum: { commissionAmount: 920000 } },
    { productName: 'Personal Loan', _count: 45, _sum: { commissionAmount: 680000 } },
    { productName: 'Business Loan', _count: 19, _sum: { commissionAmount: 850000 } },
  ],
  commissionTypeBreakdown: [
    { commissionType: 'UPFRONT', _count: 62, _sum: { commissionAmount: 1200000 } },
    { commissionType: 'TRAIL', _count: 48, _sum: { commissionAmount: 850000 } },
    { commissionType: 'INCENTIVE', _count: 24, _sum: { commissionAmount: 400000 } },
  ],
};

export const MOCK_TICKET_ANALYTICS = {
  totalTickets: 156,
  openTickets: 23,
  resolvedTickets: 118,
  avgResolutionHours: 4.2,
  byPriority: { HIGH: 18, MEDIUM: 45, LOW: 93 },
  byCategory: { Technical: 32, Application: 45, Finance: 28, KYC: 22, Partner: 29 },
};

export function mockLeadNotes(leadId: string) {
  return [
    { id: 'ln-1', leadId, content: 'Customer interested in 25L home loan. Good CIBIL score.', createdBy: 'Priya Sharma', createdAt: daysAgo(1) },
    { id: 'ln-2', leadId, content: 'Follow-up scheduled for document collection.', createdBy: 'Priya Sharma', createdAt: daysAgo(0) },
  ];
}

export function mockLeadActivities(leadId: string) {
  return [
    { id: 'la-1', leadId, activityType: 'CALL', description: 'Initial discovery call — 15 min', createdBy: 'Priya Sharma', createdAt: daysAgo(2) },
    { id: 'la-2', leadId, activityType: 'EMAIL', description: 'Sent product brochure and rate sheet', createdBy: 'Priya Sharma', createdAt: daysAgo(1) },
  ];
}

export function mockLeadFollowUps(leadId: string) {
  return [
    { id: 'lf-1', leadId, scheduledAt: daysAgo(-1), notes: 'Document collection visit', status: 'PENDING', assignedTo: 'Priya Sharma' },
    { id: 'lf-2', leadId, scheduledAt: daysAgo(1), notes: 'Rate negotiation call', status: 'COMPLETED', assignedTo: 'Priya Sharma' },
  ];
}

export function mockLeadTimeline(leadId: string) {
  return [
    { id: 'lt-1', leadId, event: 'Lead Created', description: 'Lead captured from website', createdAt: daysAgo(5) },
    { id: 'lt-2', leadId, event: 'Assigned', description: 'Assigned to Priya Sharma', createdAt: daysAgo(4) },
    { id: 'lt-3', leadId, event: 'Qualified', description: 'Lead marked as qualified', createdAt: daysAgo(2) },
  ];
}

export function mockKycRecords(customerId: string) {
  return [
    { id: 'kyc-1', customerId, documentType: 'PAN', status: 'VERIFIED', verifiedAt: daysAgo(30) },
    { id: 'kyc-2', customerId, documentType: 'Aadhaar', status: 'VERIFIED', verifiedAt: daysAgo(30) },
    { id: 'kyc-3', customerId, documentType: 'Address Proof', status: 'PENDING', verifiedAt: null },
  ];
}

export function mockApplicationTimeline(applicationId: string) {
  return [
    { id: 'at-1', applicationId, event: 'Application Created', createdAt: daysAgo(10) },
    { id: 'at-2', applicationId, event: 'Documents Submitted', createdAt: daysAgo(8) },
    { id: 'at-3', applicationId, event: 'Under Review', createdAt: daysAgo(5) },
  ];
}

export function mockEligibility(applicationId: string) {
  return [{ id: 'el-1', applicationId, ruleName: 'Min Income', result: 'PASS', value: '₹85,000/month' }];
}

export function mockBankLogins(applicationId: string) {
  return [{ id: 'bl-1', applicationId, lenderName: 'HDFC Bank', status: 'LOGGED_IN', loginAt: daysAgo(3) }];
}

export function mockCreditReviews(applicationId: string) {
  return [{ id: 'cr-1', applicationId, cibilScore: 782, decision: 'APPROVED', reviewedAt: daysAgo(2) }];
}

export function mockSanctions(applicationId: string) {
  return [{ id: 'sn-1', applicationId, sanctionedAmount: 2500000, interestRate: 8.5, status: 'SANCTIONED', sanctionedAt: daysAgo(1) }];
}

export function mockDisbursements(applicationId: string) {
  return [{ id: 'db-1', applicationId, amount: 2500000, status: 'PENDING', scheduledAt: daysAgo(-2) }];
}

export function mockOcrResults(documentId: string) {
  return [{ id: 'ocr-1', documentId, field: 'PAN Number', extractedValue: 'ABCDE1234F', confidence: 98.5 }];
}

export function mockVerificationResults(documentId: string) {
  return [{ id: 'vr-1', documentId, checkType: 'Name Match', result: 'PASS', verifiedAt: daysAgo(1) }];
}

export function mockDocumentDeficiencies(documentId: string) {
  return [{ id: 'dd-1', documentId, description: 'Image slightly blurred — re-upload recommended', severity: 'LOW' }];
}

export function mockCommunicationLogs() {
  return [
    { id: 'cl-1', channel: 'EMAIL', recipient: 'rajesh.k@email.com', subject: 'Document Request', status: 'DELIVERED', sentAt: daysAgo(1) },
    { id: 'cl-2', channel: 'SMS', recipient: '+91 98765 43210', subject: 'OTP Verification', status: 'DELIVERED', sentAt: daysAgo(0) },
    { id: 'cl-3', channel: 'WHATSAPP', recipient: '+91 87654 32109', subject: 'Application Update', status: 'SENT', sentAt: daysAgo(2) },
  ];
}

export function mockTicketMessages(ticketId: string) {
  return [
    { id: 'tm-1', ticketId, sender: 'Rajesh Kumar', message: 'Unable to upload PAN card — getting error 500', createdAt: daysAgo(1) },
    { id: 'tm-2', ticketId, sender: 'Support Team', message: 'We are looking into this. Please try clearing cache.', createdAt: daysAgo(0) },
  ];
}

export const MOCK_CAMPAIGNS = [
  { id: 'camp-001', name: 'Home Loan Fest 2026', type: 'EMAIL', channel: 'EMAIL', status: 'ACTIVE', audience: 'LEADS', subject: 'Special home loan rates', body: 'Apply now for festive rates', sent: 2450, opened: 1820, clicked: 920, converted: 124, startDate: daysAgo(10), endDate: daysAgo(-20), createdAt: daysAgo(12) },
  { id: 'camp-002', name: 'Partner Referral Drive', type: 'SMS', channel: 'SMS', status: 'ACTIVE', audience: 'DSA_PARTNERS', subject: '', body: 'Refer and earn rewards', sent: 890, opened: 720, clicked: 410, converted: 45, startDate: daysAgo(5), endDate: daysAgo(-25), createdAt: daysAgo(8) },
  { id: 'camp-003', name: 'Personal Loan Flash Offer', type: 'WHATSAPP', channel: 'WHATSAPP', status: 'SCHEDULED', audience: 'ALL_CUSTOMERS', subject: '', body: 'Instant personal loan approval', sent: 0, opened: 0, clicked: 0, converted: 0, startDate: daysAgo(-3), endDate: daysAgo(-30), createdAt: daysAgo(2) },
  { id: 'camp-004', name: 'Diwali Special Rates', type: 'EMAIL', channel: 'EMAIL', status: 'COMPLETED', audience: 'LEADS', subject: 'Diwali offer', body: 'Celebrate with low rates', sent: 5200, opened: 4100, clicked: 2100, converted: 312, startDate: daysAgo(90), endDate: daysAgo(60), createdAt: daysAgo(95) },
];

export const MOCK_REGIONS = [
  { id: 'reg-001', code: 'HQ-REG', name: 'Head Office Region', isActive: true, createdAt: daysAgo(400) },
  { id: 'reg-002', code: 'WEST', name: 'West Region', isActive: true, createdAt: daysAgo(300) },
  { id: 'reg-003', code: 'SOUTH', name: 'South Region', isActive: true, createdAt: daysAgo(300) },
];

export const MOCK_BRANCHES = [
  { id: 'br-001', regionId: 'reg-001', code: 'MUM-01', name: 'Mumbai Central', city: 'Mumbai', state: 'MH', pincode: '400001', isActive: true, createdAt: daysAgo(200) },
  { id: 'br-002', regionId: 'reg-002', code: 'PUN-01', name: 'Pune West', city: 'Pune', state: 'MH', pincode: '411001', isActive: true, createdAt: daysAgo(180) },
  { id: 'br-003', regionId: 'reg-003', code: 'BLR-01', name: 'Bangalore HQ', city: 'Bengaluru', state: 'KA', pincode: '560001', isActive: true, createdAt: daysAgo(150) },
];

export const MOCK_EMPLOYEES = [
  { id: 'emp-001', userId: 'usr-002', branchId: 'br-001', employeeCode: 'EMP-001', firstName: 'Priya', lastName: 'Sharma', designation: 'Sales Manager', department: 'Sales', isActive: true, joinedAt: daysAgo(200), createdAt: daysAgo(200) },
  { id: 'emp-002', userId: 'usr-003', branchId: 'br-001', employeeCode: 'EMP-002', firstName: 'Amit', lastName: 'Patel', designation: 'Sales Executive', department: 'Sales', isActive: true, joinedAt: daysAgo(180), createdAt: daysAgo(180) },
  { id: 'emp-003', userId: 'usr-004', branchId: 'br-002', employeeCode: 'EMP-003', firstName: 'Neha', lastName: 'Gupta', designation: 'Sales Executive', department: 'Sales', isActive: true, joinedAt: daysAgo(150), createdAt: daysAgo(150) },
];

export const MOCK_VOICE_SESSIONS = [
  { id: 'vs-001', entityId: 'vs-001', action: 'VOICE_SESSION_STARTED', entityType: 'voice_ai', status: 'active', language: 'en', messageCount: 4, createdAt: daysAgo(0) },
  { id: 'vs-002', entityId: 'vs-002', action: 'VOICE_SESSION_STARTED', entityType: 'voice_ai', status: 'ended', language: 'hi', messageCount: 12, createdAt: daysAgo(1) },
  { id: 'vs-003', entityId: 'vs-003', action: 'VOICE_SESSION_STARTED', entityType: 'voice_ai', status: 'ended', language: 'en', messageCount: 6, createdAt: daysAgo(2) },
];

export const MOCK_COPILOT_ANALYTICS = {
  totalSessions: 128,
  totalInsights: 342,
  totalRecommendations: 215,
  recommendationAcceptanceRate: 68.5,
  predictionAccuracyRate: 74.2,
  approvalAccuracyRate: 81.0,
  disbursalAccuracyRate: 76.8,
  conversionRate: 42.3,
  usageByEntityType: { LEAD: 52, APPLICATION: 38, EXECUTIVE: 18, BRANCH: 12, CUSTOMER: 8 },
};

export const MOCK_COPILOT_INSIGHTS = [
  { id: 'ins-1', category: 'LEAD', title: 'Lead qualification summary', summary: 'Lead LD-2026-001 graded A+ with 88% approval probability.', confidence: 88, createdAt: daysAgo(0) },
  { id: 'ins-2', category: 'APPLICATION', title: 'Sanction pipeline outlook', summary: 'Application AP-2026-002 has 92% success probability with low delay risk.', confidence: 92, createdAt: daysAgo(0) },
  { id: 'ins-3', category: 'EXECUTIVE', title: 'Executive conversion rate', summary: 'Priya Sharma conversion rate is 34% — above branch average.', confidence: 85, createdAt: daysAgo(1) },
];

export const MOCK_COPILOT_RECOMMENDATIONS = [
  { id: 'rec-1', recommendationType: 'LENDER', title: 'HDFC Bank', description: 'Best rate match for home loan profile', priority: 92 },
  { id: 'rec-2', recommendationType: 'ACTION', title: 'Collect bank statements', description: 'Missing last 6 months bank statements', priority: 85 },
  { id: 'rec-3', recommendationType: 'CROSS_SELL', title: 'Home Insurance', description: 'Eligible for bundled home insurance at sanction', priority: 70 },
];

export function mockRecommendationBundle(entityType: string, entityId: string) {
  const lead = MOCK_LEADS.find((l) => l.id === entityId);
  const customer = MOCK_CUSTOMERS.find((c) => c.id === entityId);
  const app = MOCK_APPLICATIONS.find((a) => a.id === entityId);
  const score = lead?.score ?? customer ? 78 : app ? 72 : 70;

  return {
    entityType,
    entityId,
    sessionId: `rec-${entityId}`,
    products: [
      {
        productName: lead?.productName ?? app?.productName ?? 'Personal Loan',
        rankScore: score,
        approvalProbability: score,
        recommendedAmount: lead?.loanAmount ?? app?.loanAmount ?? 1000000,
        recommendedEmi: 28500,
        reason: 'Best fit based on income, FOIR, and product eligibility',
      },
    ],
    lenders: [
      { lenderName: 'HDFC Bank', rankScore: 92, approvalProbability: score, expectedTatDays: 7, estimatedEmi: 28200, reason: 'Lowest indicative rate' },
      { lenderName: 'ICICI Bank', rankScore: 88, approvalProbability: score - 3, expectedTatDays: 10, estimatedEmi: 29100, reason: 'Fast sanction TAT' },
      { lenderName: 'Axis Bank', rankScore: 85, approvalProbability: score - 5, expectedTatDays: 12, estimatedEmi: 29400, reason: 'Flexible tenure options' },
    ],
    crossSell: [
      { label: 'Loan Protection Insurance', description: 'Bundle at disbursement', matchScore: 72 },
      { label: 'Top-Up Loan', description: 'Eligible after 12 EMI cycles', matchScore: 58 },
    ],
    actions: [
      { title: 'Call customer', description: 'Follow up on document collection', priority: 90, actionType: 'CALL_CUSTOMER' },
      { title: 'Collect documents', description: 'Request pending KYC documents', priority: 85, actionType: 'COLLECT_DOCUMENTS' },
    ],
    documents: { required: ['PAN', 'Aadhaar', 'Bank Statement'], missing: ['Salary Slip'], risk: ['ITR'] },
    risk: { riskLevel: score >= 85 ? 'LOW' : score >= 70 ? 'MEDIUM' : 'HIGH', explanations: ['Income verification pending'], mitigations: ['Collect last 3 salary slips'] },
    approvalProbability: score,
    disbursalProbability: Math.round(score * 0.85),
    recommendedEmi: 28500,
    generatedAt: daysAgo(0),
  };
}

export const MOCK_RECOMMENDATION_ANALYTICS = {
  totalGenerated: 1842,
  acceptanceRate: 62,
  lenderSuccessRate: 72,
  approvalAccuracy: 78,
  disbursalAccuracy: 74,
  crossSellConversionRate: 28,
  effectivenessScore: 50,
  byType: { PRODUCT: 420, LENDER: 380, CROSS_SELL: 290, ACTION: 510, DOCUMENT: 142, RISK: 100 },
};

export const MOCK_KNOWLEDGE_CATEGORIES = {
  items: [
    { id: 'kc-1', code: 'HOME_LOAN', name: 'Home Loan Policies', articleCount: 3, isActive: true },
    { id: 'kc-2', code: 'FAQS', name: 'FAQs', articleCount: 5, isActive: true },
    { id: 'kc-3', code: 'SALES_SCRIPTS', name: 'Sales Scripts', articleCount: 2, isActive: true },
    { id: 'kc-4', code: 'LENDER_POLICIES', name: 'Lender Policies', articleCount: 4, isActive: true },
    { id: 'kc-5', code: 'DOCUMENT_REQ', name: 'Document Requirements', articleCount: 3, isActive: true },
  ],
  meta: { total: 5, page: 1, limit: 50, totalPages: 1 },
};

export const MOCK_KNOWLEDGE_ARTICLES = [
  { id: 'ka-1', slug: 'home-loan-eligibility-2026', title: 'Home Loan Eligibility Criteria 2026', summary: 'Minimum income, CIBIL, FOIR and LTV requirements.', contentType: 'POLICY', categoryId: 'kc-1', categoryName: 'Home Loan Policies', status: 'PUBLISHED', currentVersion: 1, viewCount: 142, publishedAt: daysAgo(5), tags: [{ id: 't1', code: 'HOME_LOAN', name: 'Home Loan' }] },
  { id: 'ka-2', slug: 'hdfc-home-loan-guidelines', title: 'HDFC Bank Home Loan Guidelines', summary: 'HDFC-specific home loan policy including rate and tenure.', contentType: 'POLICY', categoryId: 'kc-4', categoryName: 'Lender Policies', status: 'PUBLISHED', currentVersion: 2, viewCount: 98, publishedAt: daysAgo(3), tags: [{ id: 't2', code: 'HDFC', name: 'HDFC Bank' }] },
  { id: 'ka-3', slug: 'faq-cibil-score-impact', title: 'How does CIBIL score affect loan approval?', summary: 'FAQ on CIBIL score impact on eligibility.', contentType: 'FAQ', categoryId: 'kc-2', categoryName: 'FAQs', status: 'PUBLISHED', currentVersion: 1, viewCount: 215, publishedAt: daysAgo(10) },
  { id: 'ka-4', slug: 'sales-script-lead-qualification', title: 'Lead Qualification Sales Script', summary: 'Standard script for qualifying inbound leads.', contentType: 'SCRIPT', categoryId: 'kc-3', categoryName: 'Sales Scripts', status: 'PUBLISHED', currentVersion: 1, viewCount: 67, publishedAt: daysAgo(7) },
  { id: 'ka-5', slug: 'kyc-document-checklist', title: 'KYC Document Checklist', summary: 'Complete KYC document list for all products.', contentType: 'SOP', categoryId: 'kc-5', categoryName: 'Document Requirements', status: 'REVIEW', currentVersion: 1, viewCount: 45, publishedAt: null },
];

export const MOCK_KNOWLEDGE_TAGS = {
  items: [
    { id: 't1', code: 'HOME_LOAN', name: 'Home Loan', tagGroup: 'products' },
    { id: 't2', code: 'HDFC', name: 'HDFC Bank', tagGroup: 'lenders' },
    { id: 't3', code: 'SALES', name: 'Sales', tagGroup: 'departments' },
    { id: 't4', code: 'KYC', name: 'KYC Process', tagGroup: 'processes' },
  ],
  meta: { total: 4, page: 1, limit: 50, totalPages: 1 },
};

export const MOCK_KNOWLEDGE_ANALYTICS = {
  totalArticles: 24,
  publishedArticles: 18,
  draftArticles: 3,
  pendingReview: 3,
  totalViews: 1248,
  totalSearches: 342,
  averageFeedbackRating: 4.2,
  mostViewed: [
    { id: 'ka-3', title: 'How does CIBIL score affect loan approval?', viewCount: 215 },
    { id: 'ka-1', title: 'Home Loan Eligibility Criteria 2026', viewCount: 142 },
    { id: 'ka-2', title: 'HDFC Bank Home Loan Guidelines', viewCount: 98 },
  ],
  mostUsedPolicies: [
    { id: 'ka-1', title: 'Home Loan Eligibility Criteria 2026', viewCount: 142 },
    { id: 'ka-2', title: 'HDFC Bank Home Loan Guidelines', viewCount: 98 },
  ],
  searchTrends: [
    { query: 'cibil score', count: 45 },
    { query: 'home loan eligibility', count: 38 },
    { query: 'hdfc rate', count: 22 },
  ],
  departmentUsage: [
    { department: 'CRM', views: 520 },
    { department: 'AI_ADVISOR', views: 380 },
    { department: 'COPILOT', views: 210 },
  ],
  contentTypeDistribution: { POLICY: 8, FAQ: 5, SCRIPT: 3, SOP: 4, ARTICLE: 4 },
};

export function mockKnowledgeArticle(id: string) {
  const article = MOCK_KNOWLEDGE_ARTICLES.find((a) => a.id === id) ?? MOCK_KNOWLEDGE_ARTICLES[0];
  return {
    ...article,
    content: 'Full article content for ' + article!.title + '. This is the detailed knowledge base content used by AI Advisor, Voice AI, and Sales Copilot.',
    searchKeywords: 'loan eligibility cibil',
    department: 'SALES',
    riskCategory: null,
    authorId: 'user-001',
    versions: [{ version: 1, changeNotes: 'Initial version', createdAt: daysAgo(5) }],
    attachments: [],
  };
}

export const MOCK_AI_PLATFORM_HEALTH = {
  status: 'degraded',
  version: 'ai-platform-v1.0',
  openaiConfigured: false,
  completionAvailable: false,
  embeddingProvider: 'LOCAL_HASH',
  activeModels: 7,
  features: ['chat', 'completion', 'embedding', 'transcribe', 'speech', 'function_calling', 'moderation'],
};

export const MOCK_AI_MODELS = {
  items: [
    { id: 'm1', code: 'gpt-4o-mini', name: 'GPT-4o Mini', capability: 'CHAT', isDefault: true, isActive: true },
    { id: 'm2', code: 'text-embedding-3-small', name: 'Embedding 3 Small', capability: 'EMBEDDING', isDefault: true, isActive: true },
    { id: 'm3', code: 'whisper-1', name: 'Whisper', capability: 'TRANSCRIPTION', isDefault: true, isActive: true },
    { id: 'm4', code: 'tts-1', name: 'TTS-1', capability: 'TTS', isDefault: true, isActive: true },
  ],
  meta: { total: 4 },
};

export const MOCK_AI_USAGE = {
  totalRequests: 4280,
  totalTokens: 1842000,
  avgLatencyMs: 890,
  errorRate: 2,
  totalCost: 12.45,
  byModule: { AI_ADVISOR: 1820, VOICE_AI: 640, COPILOT: 980, RAG: 840 },
  byRequestType: { CHAT: 3200, EMBEDDING: 820, TRANSCRIPTION: 180, TTS: 80 },
  topModels: [
    { model: 'gpt-4o-mini', count: 2800, tokens: 1420000 },
    { model: 'text-embedding-3-small', count: 820, tokens: 320000 },
  ],
};

export const MOCK_AI_COSTS = {
  totalCost: 12.45,
  currency: 'USD',
  byModule: { AI_ADVISOR: 6.2, COPILOT: 2.8, RAG: 2.1, VOICE_AI: 1.35 },
  byModel: { 'gpt-4o-mini': 9.8, 'text-embedding-3-small': 1.9, 'whisper-1': 0.45, 'tts-1': 0.3 },
  dailyCosts: [],
};

export const MOCK_AI_PROMPTS = [
  { id: 'pt1', code: 'advisor.system', name: 'AI Advisor System Prompt', module: 'AI_ADVISOR', role: 'system', versions: [{ content: 'You are Kuber AI Advisor for Kuber Finserve...' }] },
  { id: 'pt2', code: 'rag.answer', name: 'RAG Answer Generation', module: 'RAG', role: 'system', versions: [{ content: 'Answer ONLY using retrieved knowledge...' }] },
];

export const MOCK_RAG_DOCUMENTS = [
  { id: 'rd-1', title: 'Home Loan Eligibility Criteria 2026', sourceType: 'POLICY', status: 'INDEXED', ingestionStatus: 'COMPLETED', chunkCount: 12, embeddingCount: 12, indexedAt: daysAgo(2) },
  { id: 'rd-2', title: 'HDFC Bank Home Loan Guidelines', sourceType: 'LENDER_POLICY', status: 'INDEXED', ingestionStatus: 'COMPLETED', chunkCount: 8, embeddingCount: 8, indexedAt: daysAgo(1) },
  { id: 'rd-3', title: 'How does CIBIL score affect loan approval?', sourceType: 'FAQ', status: 'INDEXED', ingestionStatus: 'COMPLETED', chunkCount: 4, embeddingCount: 4, indexedAt: daysAgo(5) },
  { id: 'rd-4', title: 'KYC Document Checklist', sourceType: 'SOP', status: 'PROCESSING', ingestionStatus: 'EMBEDDING', chunkCount: 0, embeddingCount: 0, indexedAt: null },
];

export const MOCK_RAG_ANALYTICS = {
  totalQueries: 1842,
  totalRetrievals: 1620,
  avgLatencyMs: 142,
  avgFeedbackRating: 4.1,
  retrievalAccuracy: 88,
  searchEffectiveness: 82,
  topDocuments: [
    { id: 'rd-1', title: 'Home Loan Eligibility Criteria 2026', retrievalCount: 12 },
    { id: 'rd-2', title: 'HDFC Bank Home Loan Guidelines', retrievalCount: 8 },
    { id: 'rd-3', title: 'How does CIBIL score affect loan approval?', retrievalCount: 4 },
  ],
  topCategories: [
    { code: 'HOME_LOAN', count: 45 },
    { code: 'LENDER_POLICY', count: 32 },
    { code: 'FAQ', count: 28 },
  ],
  queriesBySource: {
    AI_ADVISOR: 620,
    VOICE_AI: 310,
    COPILOT: 480,
    RECOMMENDATION: 290,
    ADMIN: 142,
  },
};

export function mockRagDocument(id: string) {
  const doc = MOCK_RAG_DOCUMENTS.find((d) => d.id === id) ?? MOCK_RAG_DOCUMENTS[0];
  return {
    ...doc,
    chunks: [
      { id: 'ch-1', chunkIndex: 0, content: 'Minimum monthly income ₹25,000 for salaried applicants. CIBIL score 700+ preferred.' },
      { id: 'ch-2', chunkIndex: 1, content: 'FOIR should not exceed 50% for home loans. LTV up to 80% for primary residence.' },
      { id: 'ch-3', chunkIndex: 2, content: 'Required documents: PAN, Aadhaar, salary slips (3 months), bank statements (6 months).' },
    ],
  };
}

export const MOCK_LEAD_SCORING_ANALYTICS = {
  totalScored: 248,
  gradeDistribution: { A_PLUS: 42, A: 68, B: 85, C: 38, REJECTED: 15 },
  riskDistribution: { LOW: 95, MEDIUM: 88, HIGH: 45, CRITICAL: 20 },
  priorityDistribution: { HOT: 55, WARM: 72, NORMAL: 85, LOW: 36 },
  averageScore: 72,
  averageApprovalProbability: 68.5,
  averageDisbursalProbability: 58.2,
  conversionRate: 34.5,
  predictionAccuracy: 76.8,
};

export function mockLeadScoreResult(leadId: string) {
  const lead = MOCK_LEADS.find((l) => l.id === leadId) ?? MOCK_LEADS[0];
  const score = lead?.score ?? 78;
  return {
    id: `ls-${leadId}`,
    leadId: lead?.id ?? leadId,
    score,
    grade: lead?.grade === 'A+' ? 'A_PLUS' : lead?.grade ?? 'B',
    gradeAlias: lead?.grade ?? 'B',
    classification: score >= 90 ? 'Premium Lead' : score >= 75 ? 'High Quality Lead' : 'Moderate Lead',
    approvalProbability: score,
    disbursalProbability: Math.round(score * 0.82),
    conversionProbability: Math.round(score * 0.65),
    riskRating: score >= 85 ? 'LOW' : score >= 70 ? 'MEDIUM' : 'HIGH',
    priorityLevel: score >= 85 ? 'HOT' : score >= 70 ? 'WARM' : 'NORMAL',
    riskIndicators: score < 70 ? ['Income verification pending'] : [],
    factorBreakdown: {
      income: { score: 80, weight: 0.12, weighted: 9.6 },
      cibil: { score: score, weight: 0.15, weighted: score * 0.15 },
      location: { score: 75, weight: 0.05, weighted: 3.75 },
    },
    modelVersion: 'lms-v2.0',
    calculatedAt: daysAgo(0),
  };
}

export function mockCopilotLeadAnalysis(leadId: string) {
  const lead = MOCK_LEADS.find((l) => l.id === leadId) ?? MOCK_LEADS[0];
  return {
    leadId: lead?.id ?? leadId,
    leadGrade: lead?.grade ?? 'B+',
    approvalProbability: lead?.score ?? 75,
    disbursalProbability: Math.round((lead?.score ?? 75) * 0.82),
    conversionProbability: Math.round((lead?.score ?? 75) * 0.65),
    riskFlags: [
      { code: 'INCOME_VERIFICATION', label: 'Income verification pending', severity: 'MEDIUM', description: 'Salary slips not yet verified' },
    ],
    recommendedProduct: { title: lead?.productName ?? 'Home Loan', description: 'Best fit based on profile and loan amount' },
    recommendedLender: { title: 'HDFC Bank', description: 'Lowest indicative rate for this segment' },
    recommendedExecutive: { title: lead?.assignedToName ?? 'Branch RM', description: 'Recommended based on branch load' },
    nextBestActions: [
      { actionType: 'CALL_CUSTOMER', title: 'Call customer', description: 'Follow up on document collection', priority: 90 },
      { actionType: 'COLLECT_DOCUMENTS', title: 'Collect documents', description: 'Request pending KYC documents', priority: 85 },
    ],
    crossSellOpportunities: [
      { code: 'INSURANCE', label: 'Home Insurance', description: 'Bundle at disbursement', score: 72 },
      { code: 'TOP_UP', label: 'Future Top-Up', description: 'Eligible after 12 EMI cycles', score: 55 },
    ],
    insights: [
      { category: 'LEAD', title: 'Lead qualification summary', summary: `Lead ${lead?.leadNumber} graded ${lead?.grade} with strong conversion potential.`, confidence: lead?.score ?? 80 },
    ],
    sessionId: `sess-lead-${leadId}`,
  };
}

export function mockCopilotApplicationAnalysis(appId: string) {
  const app = MOCK_APPLICATIONS.find((a) => a.id === appId) ?? MOCK_APPLICATIONS[0];
  const base = app?.status === 'DISBURSED' ? 95 : app?.status === 'REJECTED' ? 25 : app?.status === 'SANCTIONED' ? 88 : 72;
  return {
    applicationId: app?.id ?? appId,
    successProbability: base,
    delayRisk: app?.status === 'UNDER_REVIEW' ? 35 : 15,
    approvalProbability: base,
    disbursalProbability: Math.round(base * 0.9),
    missingInformation: app?.status === 'DRAFT' ? ['Bank login', 'Income proof'] : [],
    escalationRequired: app?.status === 'UNDER_REVIEW',
    riskFlags: [{ code: 'DOC_PENDING', label: 'Document pending', severity: 'MEDIUM' }],
    nextBestActions: [
      { actionType: 'UPDATE_BANK_LOGIN', title: 'Update bank login', description: 'Complete lender portal login', priority: 80 },
    ],
    crossSellOpportunities: [{ code: 'INSURANCE', label: 'Loan protection insurance', score: 68 }],
    insights: [
      { category: 'APPLICATION', title: 'Pipeline status', summary: `${app?.applicationNumber} is ${app?.status?.replace(/_/g, ' ').toLowerCase()}.`, confidence: base },
    ],
    sessionId: `sess-app-${appId}`,
  };
}
