export interface Client {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
  latitude: string;
  longitude: string;
  address: string;
  clientCode: string;
  assignedTo: string;
  clientTags: string[];
  areaTags: string[];
  availabilityMSL: string;
  jobCategories: string;
  comment: string;
  isChain: boolean;
  clientChain: string;
  clientChannel: string;
  teams: string;
  clmPresentations: string[];
  contactName: string;
  contactTitle: string;
  phone: string;
  cellPhone: string;
  email: string;
  website: string;
  city: string;
  country: string;
  region: string;
  contacts: string[];
  specialty: string;
  assignedProductGroups: string;
  integratedClientBalance: number;
  creditLimit: number;
  taxNumber: string;
  paymentType: string;
  priceList: string;
  paymentTerm: string;
  lastSalesInvoiceTime: string;
  lastSalesOrderTime: string;
  avatar?: string;
  retailExecutionTemplate: string[];
  formsV2: string;
  mediaAssignedProducts: string;
  description: string;
  transactionBalanceLimit: number;
  gracePeriodAfterDueDate: number;
  creditLimitApplyInvoices: boolean;
  creditLimitApplySalesOrder: boolean;
  transactionBalanceLimitApplyInvoices: boolean;
  transactionBalanceLimitApplySalesOrder: boolean;
  gracePeriodApplyInvoices: boolean;
  gracePeriodApplySalesOrder: boolean;
}

const names = [
  "Test up loading images", "Test image path", "Test2026", "Karak Tea",
  "new serial", "test 10", "Serial 66", "Serial 65", "Serial 64", "Serial 63",
  "Alpha Market", "Beta Pharmacy", "Gamma Electronics", "Delta Foods",
  "Epsilon Mart", "Zeta Coffee", "Eta Solutions", "Theta Shop",
  "Iota Beverages", "Kappa Store", "Lambda Tech", "Mu Retail",
  "Nu Groceries", "Xi Hardware", "Omicron Supply", "Pi Distribution",
  "Rho Trading", "Sigma Depot", "Tau Wholesale", "Upsilon Center",
];

const cities = ["Amman", "Irbid", "Zarqa", "Aqaba", "Salt", "Madaba", "Jerash", "Mafraq"];
const channels = ["Retail", "Wholesale", "HORECA", "Pharmacy", "Modern Trade"];
const chains = ["Carrefour", "Spinneys", "LuLu", "Cozmo", "Safeway", "Miles", ""];
const reps = ["Ahmad Abudraya", "Sara Khalil", "Omar Rashed", "Layla Hassan", "Nour Ali", "Fadi Mansour"];
const paymentTypes = ["Cash Only", "Allow Credit"];
const paymentTerms = ["Net 30", "Net 60", "Net 90", "COD", "Net 15"];
const priceLists = ["Standard", "Wholesale", "VIP", "Promotional"];

function randomDate(start: string, end: string): string {
  const s = new Date(start).getTime();
  const e = new Date(end).getTime();
  const d = new Date(s + Math.random() * (e - s));
  return d.toISOString().replace("T", ", ").substring(0, 22) + " AM";
}

function randomCoord(min: number, max: number): string {
  return (min + Math.random() * (max - min)).toFixed(7);
}

export function generateClients(count: number = 30): Client[] {
  return Array.from({ length: count }, (_, i) => {
    const name = names[i % names.length] + (i >= names.length ? ` ${Math.floor(i / names.length) + 1}` : "");
    const isChain = Math.random() > 0.65;
    const chain = isChain ? chains[Math.floor(Math.random() * (chains.length - 1))] : "";
    const creditLimit = Math.floor(Math.random() * 50000) + 5000;
    const balance = Math.floor(Math.random() * creditLimit * 1.3);

    return {
      id: i + 1,
      name,
      createdAt: randomDate("2025-01-01", "2026-02-23"),
      updatedAt: randomDate("2026-01-01", "2026-02-24"),
      latitude: randomCoord(29.5, 33.4),
      longitude: randomCoord(35.7, 39.0),
      address: `${Math.floor(Math.random() * 999) + 1} ${["King Abdullah St", "Queen Rania Ave", "Mecca St", "University Rd", "Gardens St", "Zahran St"][Math.floor(Math.random() * 6)]}, ${cities[Math.floor(Math.random() * cities.length)]}, Jordan`,
      clientCode: `_${String(800000 + i).padStart(6, "0")}`,
      assignedTo: reps[Math.floor(Math.random() * reps.length)],
      clientTags: ["Active", "Premium", "New", "Standard"].slice(0, Math.floor(Math.random() * 3) + 1),
      areaTags: [cities[Math.floor(Math.random() * cities.length)]],
      availabilityMSL: ["Beverages MSL", "Snacks MSL", "Dairy MSL", "Household MSL", "Premium SKU List", "Core Range List"][Math.floor(Math.random() * 6)],
      jobCategories: channels[Math.floor(Math.random() * channels.length)],
      comment: i % 5 === 0 ? "Follow up needed" : "",
      isChain,
      clientChain: chain,
      clientChannel: channels[Math.floor(Math.random() * channels.length)],
      teams: `Team ${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`,
      clmPresentations: i % 3 === 0 ? [["Q1 Strategy Deck", "Product Launch 2026", "Brand Overview"][Math.floor(Math.random() * 3)], ["Promo Calendar", "Planogram Guide"][Math.floor(Math.random() * 2)]].slice(0, Math.floor(Math.random() * 2) + 1) : [],
      contactName: ["John Doe", "Jane Smith", "Mohammed Ali", "Fatima Hassan", "Khaled Omar"][Math.floor(Math.random() * 5)],
      contactTitle: ["Manager", "Owner", "Supervisor", "Director", "Coordinator"][Math.floor(Math.random() * 5)],
      phone: `+962-${Math.floor(Math.random() * 9) + 1}-${String(Math.floor(Math.random() * 9000000) + 1000000)}`,
      cellPhone: `+962-7${Math.floor(Math.random() * 9)}-${String(Math.floor(Math.random() * 9000000) + 1000000)}`,
      email: ["john.doe@example.com", "jane.smith@example.com", "mohammed.ali@example.com", "fatima.hassan@example.com", "khaled.omar@example.com"][Math.floor(Math.random() * 5)],
      website: ["www.example.com", "www.example.org", "www.example.net"][Math.floor(Math.random() * 3)],
      city: cities[Math.floor(Math.random() * cities.length)],
      country: "Jordan",
      region: ["North", "Central", "South"][Math.floor(Math.random() * 3)],
      contacts: i % 2 === 0 ? [["John Doe", "Jane Smith", "Mohammed Ali", "Fatima Hassan", "Khaled Omar"][Math.floor(Math.random() * 5)], ["Sara Khalil", "Omar Rashed"][Math.floor(Math.random() * 2)]].slice(0, Math.floor(Math.random() * 2) + 1) : [],
      specialty: channels[Math.floor(Math.random() * channels.length)],
      assignedProductGroups: ["Beverages", "Snacks", "Dairy", "Household", "Personal Care"][Math.floor(Math.random() * 5)],
      integratedClientBalance: balance,
      creditLimit,
      taxNumber: `TN-${String(Math.floor(Math.random() * 900000) + 100000)}`,
      paymentType: paymentTypes[Math.floor(Math.random() * paymentTypes.length)],
      priceList: priceLists[Math.floor(Math.random() * priceLists.length)],
      paymentTerm: paymentTerms[Math.floor(Math.random() * paymentTerms.length)],
      lastSalesInvoiceTime: randomDate("2025-06-01", "2026-02-24"),
      lastSalesOrderTime: randomDate("2025-06-01", "2026-02-24"),
      retailExecutionTemplate: i % 3 === 0 ? [["Template A", "Template B", "Template C"][Math.floor(Math.random() * 3)]]: [],
      formsV2: i % 4 === 0 ? ["Inspection Form", "Audit Form", "Survey Form"][Math.floor(Math.random() * 3)] : "",
      mediaAssignedProducts: i % 2 === 0 ? ["Coca Cola, Pepsi", "Samsung, Apple", "Nestle, Unilever"][Math.floor(Math.random() * 3)] : "",
      description: i % 3 === 0 ? "Key account in the " + cities[Math.floor(Math.random() * cities.length)] + " region. Priority for Q1 campaigns." : "",
      transactionBalanceLimit: Math.floor(Math.random() * 50000) + 5000,
      gracePeriodAfterDueDate: Math.floor(Math.random() * 30) + 1,
      creditLimitApplyInvoices: Math.random() > 0.5,
      creditLimitApplySalesOrder: Math.random() > 0.5,
      transactionBalanceLimitApplyInvoices: Math.random() > 0.5,
      transactionBalanceLimitApplySalesOrder: Math.random() > 0.5,
      gracePeriodApplyInvoices: Math.random() > 0.5,
      gracePeriodApplySalesOrder: Math.random() > 0.5,
    };
  });
}

/* =========================================
   CUSTOM FIELD TYPES & DEFINITIONS
   ========================================= */
export const CUSTOM_FIELD_TYPES = [
  "Text",
  "Number",
  "Dropdown",
  "Date",
  "Boolean",
  "Multi-Select",
] as const;

export type CustomFieldType = (typeof CUSTOM_FIELD_TYPES)[number];

export interface CustomField {
  id: string;
  name: string;
  localName: string;
  module: string;
  type: CustomFieldType;
  value: string;
}

export function generateCustomFields(): CustomField[] {
  return [
    // Text
    { id: "cf-1", name: "Internal Reference", localName: "المرجع الداخلي", module: "Client", type: "Text", value: "REF-20260102" },
    { id: "cf-2", name: "Brand Name", localName: "اسم العلامة", module: "Client", type: "Text", value: "Al-Noor Trading" },
    { id: "cf-3", name: "License Number", localName: "رقم الرخصة", module: "Client", type: "Text", value: "LIC-98712" },
    // Number
    { id: "cf-4", name: "Max Credit Days", localName: "أيام الائتمان القصوى", module: "Client", type: "Number", value: "45" },
    { id: "cf-5", name: "Target Monthly Visits", localName: "الزيارات الشهرية المستهدفة", module: "Client", type: "Number", value: "12" },
    { id: "cf-6", name: "Shelf Space (m²)", localName: "مساحة الرف", module: "Client", type: "Number", value: "8.5" },
    // Dropdown
    { id: "cf-7", name: "Client Tier", localName: "فئة العميل", module: "Client", type: "Dropdown", value: "Gold" },
    { id: "cf-8", name: "Preferred Language", localName: "اللغة المفضلة", module: "Client", type: "Dropdown", value: "Arabic" },
    // Date
    { id: "cf-9", name: "Contract Start Date", localName: "تاريخ بدء العقد", module: "Client", type: "Date", value: "2025-06-15" },
    { id: "cf-10", name: "Next Review Date", localName: "تاريخ المراجعة القادمة", module: "Client", type: "Date", value: "2026-03-01" },
    // Boolean
    { id: "cf-11", name: "Accepts Returns", localName: "يقبل المرتجعات", module: "Client", type: "Boolean", value: "true" },
    { id: "cf-12", name: "VAT Exempt", localName: "معفى من الضريبة", module: "Client", type: "Boolean", value: "false" },
    // Multi-Select
    { id: "cf-13", name: "Delivery Days", localName: "أيام التوصيل", module: "Client", type: "Multi-Select", value: "Sunday, Tuesday, Thursday" },
    { id: "cf-14", name: "Preferred Brands", localName: "العلامات المفضلة", module: "Client", type: "Multi-Select", value: "Nestle, Unilever, P&G" },
  ];
}

export const ALL_COLUMNS = [
  { key: "name", label: "Name", defaultVisible: true, width: 180 },
  { key: "createdAt", label: "Created At", defaultVisible: true, width: 175 },
  { key: "updatedAt", label: "Updated At", defaultVisible: true, width: 175 },
  { key: "latitude", label: "Latitude", defaultVisible: true, width: 130 },
  { key: "longitude", label: "Longitude", defaultVisible: true, width: 140 },
  { key: "address", label: "Address", defaultVisible: true, width: 220 },
  { key: "clientCode", label: "Client Code", defaultVisible: true, width: 110 },
  { key: "assignedTo", label: "Assigned To", defaultVisible: false, width: 150 },
  { key: "clientTags", label: "Client Tags", defaultVisible: false, width: 160 },
  { key: "areaTags", label: "Area Tags", defaultVisible: false, width: 120 },
  { key: "availabilityMSL", label: "Availability MSL", defaultVisible: false, width: 130 },
  { key: "jobCategories", label: "Job Categories", defaultVisible: false, width: 130 },
  { key: "comment", label: "Comment", defaultVisible: false, width: 160 },
  { key: "isChain", label: "Is Chain?", defaultVisible: false, width: 100 },
  { key: "clientChain", label: "Client Chain", defaultVisible: false, width: 130 },
  { key: "clientChannel", label: "Client Channel", defaultVisible: false, width: 130 },
  { key: "teams", label: "Teams", defaultVisible: false, width: 100 },
  { key: "clmPresentations", label: "CLM Presentations", defaultVisible: false, width: 150 },
  { key: "contactName", label: "Contact Name", defaultVisible: false, width: 140 },
  { key: "contactTitle", label: "Contact Title", defaultVisible: false, width: 120 },
  { key: "phone", label: "Phone", defaultVisible: false, width: 160 },
  { key: "cellPhone", label: "Cell Phone", defaultVisible: false, width: 160 },
  { key: "email", label: "Email", defaultVisible: false, width: 160 },
  { key: "website", label: "Website", defaultVisible: false, width: 160 },
  { key: "city", label: "City", defaultVisible: false, width: 100 },
  { key: "country", label: "Country", defaultVisible: false, width: 100 },
  { key: "region", label: "Region", defaultVisible: false, width: 100 },
  { key: "contacts", label: "Contacts", defaultVisible: false, width: 90 },
  { key: "specialty", label: "Specialty", defaultVisible: false, width: 120 },
  { key: "assignedProductGroups", label: "Assigned Product Groups", defaultVisible: false, width: 180 },
  { key: "integratedClientBalance", label: "Integrated Client Balance", defaultVisible: false, width: 190 },
  { key: "creditLimit", label: "Credit Limit", defaultVisible: false, width: 120 },
  { key: "taxNumber", label: "Tax Number", defaultVisible: false, width: 130 },
  { key: "paymentType", label: "Payment Type", defaultVisible: false, width: 120 },
  { key: "priceList", label: "Price List", defaultVisible: false, width: 110 },
  { key: "paymentTerm", label: "Payment Term", defaultVisible: false, width: 120 },
  { key: "lastSalesInvoiceTime", label: "Last Sales Invoice Time", defaultVisible: false, width: 180 },
  { key: "lastSalesOrderTime", label: "Last Sales Order Time", defaultVisible: false, width: 180 },
];