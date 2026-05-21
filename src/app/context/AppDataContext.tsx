import React, { createContext, useContext, useState } from "react";

// ── per-SO detail types (used by SalesOrderDetails) ─────────────────────────
export interface OrderItem {
  id: string;
  name: string;
  sku: string;
  unit: string;
  totalQty: number;
  deliveredQty: number;
  notedQty: number;
  price: number;
  tax: number;
}

export interface DeliveryNote {
  id: string;
  rep: string;
  warehouse?: string;
  status: "PENDING" | "PROCESSING" | "APPROVED" | "CANCELED";
  adminTransfer: "NONE" | "DONE";
  repTransfer: "NONE" | "CONFIRMED";
  date: string;
  items: { id: string; qty: number; unit: string; qtyBase: number; warehouse?: string }[];
  cancelReason?: string;
  isManual?: boolean;
}

export interface ReturnTransfer {
  id: string;
  relatedDnId: string;
  rep: string;
  warehouse?: string;
  items: { id: string; qty: number; unit: string; qtyBase: number }[];
  date: string;
  repReturn: "NONE" | "CONFIRMED";
  adminReturn: "NONE" | "CONFIRMED";
  status: "PENDING" | "CONFIRMED";
}

export interface Reservation {
  id: string;
  itemId: string;
  itemName: string;
  qty: number;
  unit: string;
  qtyBase: number;
  warehouse?: string;
  status: "ACTIVE" | "CANCELED" | "REVOKED";
  date: string;
  type: "AUTO" | "MANUAL";
  sourceSOId?: string;
  sourceInvoiceId?: string;
  linkedDNId?: string;
  linkedDNNumber?: string;
  groupId?: string;
}

// Stock layout (11 warehouses):
//  FULL (6) — Main Branch, Zarqaa Warehouse, Maram, Local Maram Van Warehouse, Dream Warehouse, مستودع الكوم الرئيسي
//  SHORTAGE (3) — Mohammad test (itm1 short), Van مستودع الكوم (itm2/3 short), Khald Warehouse (itm1/2 short)
//  NONE (2) — ismaeil, new 11
export const MOCK_STOCK: Record<string, Record<string, number>> = {
  "itm1": {
    "Main Branch": 10, "Zarqaa Warehouse": 12, "Maram": 8,  "Local Maram Van Warehouse": 15, "Dream Warehouse": 7,  "مستودع الكوم الرئيسي": 9,
    "Mohammad test": 3, "Van مستودع الكوم": 6, "Khald Warehouse": 4,
    "ismaeil": 0, "new 11": 0,
  },
  "itm2": {
    "Main Branch": 8,  "Zarqaa Warehouse": 6,  "Maram": 10, "Local Maram Van Warehouse": 7,  "Dream Warehouse": 9,  "مستودع الكوم الرئيسي": 5,
    "Mohammad test": 2, "Van مستودع الكوم": 3, "Khald Warehouse": 1,
    "ismaeil": 0, "new 11": 0,
  },
  // SO-11 items — needs: p11-itm1 ×10, p11-itm2 ×3 boxes, p11-itm3 ×1 box
  "p11-itm1": {
    "Main Branch": 15, "Zarqaa Warehouse": 20, "Maram": 12, "Local Maram Van Warehouse": 18, "Dream Warehouse": 14, "مستودع الكوم الرئيسي": 16,
    "Mohammad test": 6,  "Van مستودع الكوم": 12, "Khald Warehouse": 8,
    "ismaeil": 0, "new 11": 0,
  },
  "p11-itm2": {
    "Main Branch": 8,  "Zarqaa Warehouse": 6,  "Maram": 10, "Local Maram Van Warehouse": 5,  "Dream Warehouse": 7,  "مستودع الكوم الرئيسي": 9,
    "Mohammad test": 5,  "Van مستودع الكوم": 2,  "Khald Warehouse": 1,
    "ismaeil": 0, "new 11": 0,
  },
  "p11-itm3": {
    "Main Branch": 4,  "Zarqaa Warehouse": 3,  "Maram": 5,  "Local Maram Van Warehouse": 6,  "Dream Warehouse": 3,  "مستودع الكوم الرئيسي": 4,
    "Mohammad test": 2,  "Van مستودع الكوم": 0,  "Khald Warehouse": 1,
    "ismaeil": 0, "new 11": 0,
  },
};

export function getWhStatus(itemId: string, warehouse: string, neededBase: number): "full" | "partial" | "none" {
  const stock = MOCK_STOCK[itemId]?.[warehouse] ?? 0;
  if (neededBase <= 0) return "full";
  if (stock >= neededBase) return "full";
  if (stock > 0) return "partial";
  return "none";
}

// ── list-level entity types ──────────────────────────────────────────────────
export interface SalesOrderRecord {
  id: string;
  orderNo: string;
  issueDate: string;
  externalSerial: string;
  time: string;
  version: string;
  creator: string;
  editor: string;
  clientName: string;
  clientCode: string;
  geoTag: boolean;
  items: number;
  total: string;
  customStatus: string;
  status: "pending" | "approved" | "rejected" | "invoiced";
  deliveryStatus: "Undelivered" | "Partially Delivered" | "Delivered";
  visitId: string;
  linkedInvoiceId?: string;
  itemsData?: OrderItem[];
}

export interface InvoiceRecord {
  id: string;
  serialNo: string;
  externalSerial: string;
  issueDate: string;
  creator: string;
  clientName: string;
  items: number;
  total: string;
  balance: string;
  paymentType: string;
  status: "PENDING" | "APPROVED" | "CANCELED";
  delivery: "No Delivery Note" | "Has Delivery Note" | "Delivered";
  comment: string;
  sourceSOId?: string;
  itemsData?: OrderItem[];
  reservedItems?: { itemId: string; itemName: string; qty: number; unit: string; warehouse: string }[];
}

export interface DNItem {
  id: string;
  name: string;
  sku: string;
  qty: number;
  unit: string;
  qtyBase: number;
  soQty: number;
  soUnit: string;
  delivered: number;
  warehouse: string;
}

export interface DNRecord {
  id: string;
  dnNumber: string;
  status: "PENDING" | "PROCESSING" | "APPROVED" | "CANCELED";
  sourceSOId?: string;
  sourceSONumber?: string;
  sourceInvoiceId?: string;
  clientName: string;
  rep: string;
  createdBy: string;
  warehouse: string;
  items: number;
  createdDate: string;
  isManual?: boolean;
  adminTransfer?: string;
  repTransfer?: string;
  cancelReason?: string;
  itemsData?: DNItem[];
}

type PNStatus = "PENDING" | "PROCESSING" | "RECEIVED" | "CANCELED";
type DestType = "Main Warehouse" | "Rep Van";

export interface PNItem {
  id: string;
  name: string;
  sku: string;
  unit: string;
  deliveredQty: number;
  returnQty: number;
  status: "Reserved" | "Damaged" | "Resellable" | "Pending" | "Free";
  condition: "Resellable" | "Damaged" | null;
}

export interface PNRecord {
  id: string;
  rnNumber: string;
  status: PNStatus;
  sourceSOId: string;
  sourceSONumber: string;
  sourceDNs: { id: string; number: string }[];
  invoiceNumber: string;
  clientName: string;
  rep: string;
  createdBy: string;
  warehouse: string;
  destinationWarehouse: DestType;
  destinationRep?: string;
  items: number;
  reservedCount: number;
  createdDate: string;
  inRepVan: boolean;
  creditNoteStatus: "Issued" | "Pending" | "N/A";
  invoicePaymentStatus: "Paid" | "Partially Paid" | "Unpaid";
  repConfirmed: boolean;
  adminConfirmed: boolean;
  itemsData?: PNItem[];
  returnReason?: string;
}

export interface UnloadItem {
  id: string;
  name: string;
  sku: string;
  qty: number;
  unit: string;
  originalWarehouse: string;
}

export interface UnloadRecord {
  id: string;
  dnNumber: string;
  dnId?: string;
  originalWarehouse: string;
  unloadWarehouse: string;
  rep: string;
  createdBy: string;
  client: string;
  itemsCount: number;
  status: "Pending Unload" | "Accepted" | "Rejected" | "Unloaded";
  cancellationReason?: string;
  date: string;
  itemsData?: UnloadItem[];
}

export interface TransferItem {
  id: string;
  productId: string;
  sku: string;
  productName: string;
  variantName: string;
  measureUnit: string;
  quantity: number;
  originQty: number;
  destQty: number;
  note?: string;
}

export type TransferType = "LOAD" | "UNLOAD" | "TRANSFER";
export type TransferStatus = "PENDING" | "COMPLETED" | "CANCELED";

export interface TransferRecord {
  id: string;
  serialNo: string;
  createdAt: string;
  createdBy: string;
  from: string;
  to: string;
  type: TransferType;
  status: TransferStatus;
  customStatus?: string;
  processTime?: string;
  numberOfProducts: number;
  comment?: string;
  items: TransferItem[];
  sourceDNId?: string;
  sourceDNNumber?: string;
  sourceUnloadId?: string;
  sourceRNId?: string;
  sourceRNNumber?: string;
}

// ── SO audit / history log ───────────────────────────────────────────────────
export type SOAuditAction =
  | "created"
  | "approved_1st"
  | "approved_2nd"
  | "approved"
  | "rejected"
  | "dn_created"
  | "dn_delivered"
  | "dn_canceled"
  | "reservation_created"
  | "reservation_canceled"
  | "reservation_edited"
  | "converted_to_invoice"
  | "return_transfer_created"
  | "payment_marked_paid";

export interface SOAuditEntry {
  id: string;
  soId: string;
  action: SOAuditAction;
  by: string;
  timestamp: number;
  date: string;
  linkedId?: string;
  linkedLabel?: string;
  note?: string;
}

// ── reservation audit log ────────────────────────────────────────────────────
export interface ReservationAuditEntry {
  id: string;
  reservationId: string;
  itemName: string;
  sku: string;
  qty: number;
  unit: string;
  warehouse: string;
  sourceSOId?: string;
  sourceSONumber?: string;
  sourceInvoiceId?: string;
  sourceInvoiceNumber?: string;
  linkedDNId?: string;
  linkedDNNumber?: string;
  reservationType: "AUTO" | "MANUAL";
  status: "ACTIVE" | "CANCELED" | "REVOKED";
  eventType: "Used in delivery note" | "Manually Deleted" | "Created" | "Warehouse Transfer" | "Edited";
  triggeredBy: string;
  date: string;
  time?: string;
  note?: string;
}

// ── initial seed data ────────────────────────────────────────────────────────
const INITIAL_ORDER_ITEMS: OrderItem[] = [
  { id: "itm1", name: "American Coffe", sku: "AC-500", unit: "Piece", totalQty: 10, deliveredQty: 0, notedQty: 0, price: 4.00, tax: 0.55 },
  { id: "itm2", name: "Croissant",      sku: "CR-001", unit: "Piece", totalQty: 5,  deliveredQty: 0, notedQty: 0, price: 2.50, tax: 0.35 },
];

const INITIAL_SALES_ORDERS: SalesOrderRecord[] = [
  { id: "1",  orderNo: "PRO-ADM-2182", issueDate: "08/04/2026", externalSerial: "-",         time: "08/04/2026, 02:26 PM", version: "1", creator: "ADMIN Yousef1",       editor: "ADMIN Yousef1",       clientName: "Gaza",           clientCode: "_800010", geoTag: true,  items: 1, total: "JOD 20.00",    customStatus: "undamaged",  status: "approved",  deliveryStatus: "Undelivered",          visitId: "b8144831-3fa4-4ec", itemsData: [{ id: "itm1", name: "American Coffee", sku: "AC-500", unit: "Piece", totalQty: 5, deliveredQty: 0, notedQty: 0, price: 4.0, tax: 0 }] },
  { id: "2",  orderNo: "PRO-1734-91",  issueDate: "07/04/2026", externalSerial: "jb_jmm",   time: "07/04/2026, 11:37:", version: "1", creator: "REP Ahmad Alshaik",    editor: "ADMIN M.htaht",       clientName: "test 666 11717", clientCode: "t 23 yv", geoTag: false, items: 1, total: "JOD 0.56",     customStatus: "-",          status: "invoiced",  deliveryStatus: "Undelivered",          visitId: "-", linkedInvoiceId: "INV-002", itemsData: [{ id: "itm2", name: "Croissant", sku: "CR-001", unit: "Box", totalQty: 1, deliveredQty: 0, notedQty: 0, price: 0.56, tax: 0 }] },
  { id: "3",  orderNo: "PRO-1734-90",  issueDate: "07/04/2026", externalSerial: "565457554", time: "07/04/2026, 11:32:", version: "1", creator: "REP Ahmad Alshaikh",   editor: "ADMIN Ayah Al-Ori",   clientName: "test 666 11717", clientCode: "t 23 yv", geoTag: false, items: 3, total: "JOD 149.5",    customStatus: "-",          status: "invoiced",  deliveryStatus: "Partially Delivered",  visitId: "-", linkedInvoiceId: "INV-003", itemsData: [{ id: "itm3", name: "American Coffee", sku: "AC-500", unit: "Piece", totalQty: 10, deliveredQty: 0, notedQty: 0, price: 4.0, tax: 0 }, { id: "itm4", name: "Croissant", sku: "CR-001", unit: "Piece", totalQty: 5, deliveredQty: 0, notedQty: 0, price: 2.5, tax: 0 }, { id: "itm5", name: "Premium Pack", sku: "PP-200", unit: "Box", totalQty: 3, deliveredQty: 0, notedQty: 0, price: 32.33, tax: 0 }] },
  { id: "4",  orderNo: "PRO-1734-89",  issueDate: "07/04/2026", externalSerial: "-",         time: "07/04/2026, 11:31:", version: "0", creator: "REP Ahmad Alshaikh",  editor: "REP Ahmad Alshaikh",  clientName: "test 666 11717", clientCode: "t 23 yv", geoTag: false, items: 1, total: "JOD 0.75",     customStatus: "-",          status: "invoiced",  deliveryStatus: "Undelivered",          visitId: "-", linkedInvoiceId: "INV-001", itemsData: [{ id: "itm1", name: "Test Item 1", sku: "SKU-001", unit: "Piece", totalQty: 5, deliveredQty: 0, notedQty: 0, price: 0.75, tax: 0 }] },
  { id: "5",  orderNo: "PRO-1734-88",  issueDate: "07/04/2026", externalSerial: "-",         time: "07/04/2026, 11:31:", version: "0", creator: "REP Ahmad Alshaik",   editor: "REP Ahmad Alshaik",   clientName: "test 666 11717", clientCode: "t 23 yv", geoTag: false, items: 1, total: "JOD 10.8",     customStatus: "-",          status: "approved", deliveryStatus: "Delivered",            visitId: "-", itemsData: [{ id: "itm1", name: "American Coffee", sku: "AC-500", unit: "Piece", totalQty: 2, deliveredQty: 2, notedQty: 0, price: 5.4, tax: 0 }] },
  { id: "6",  orderNo: "PRO-1/34-87",  issueDate: "07/04/2026", externalSerial: "hh",        time: "07/04/2026, 11:26:", version: "0", creator: "REP Ahmad Alshaik",   editor: "REP Ahmad Alshaik",   clientName: "test 666 11/17", clientCode: "t 23 yv", geoTag: false, items: 1, total: "JOD 0.75",     customStatus: "-",          status: "invoiced", deliveryStatus: "Delivered",            visitId: "-", linkedInvoiceId: "INV-005", itemsData: [{ id: "itm1", name: "Test Item 1", sku: "SKU-001", unit: "Piece", totalQty: 1, deliveredQty: 1, notedQty: 0, price: 0.75, tax: 0 }] },
  { id: "7",  orderNo: "PRO-1545-693", issueDate: "01/02/2026", externalSerial: "-",         time: "01/02/2026, 04:37:", version: "0", creator: "REP khaled",          editor: "REP khaled",          clientName: "99ik",           clientCode: "_000470", geoTag: false, items: 1, total: "JOD 2,596.81", customStatus: "undamaged",  status: "invoiced",  deliveryStatus: "Undelivered",          visitId: "rep2o_223456789", linkedInvoiceId: "INV-006", itemsData: [] },
  { id: "8",  orderNo: "PRO-1545-692", issueDate: "12/01/2026", externalSerial: "-",         time: "12/01/2026, 10:21:", version: "0", creator: "REP khaled",          editor: "REP khaled",          clientName: "new m2",         clientCode: "_000465", geoTag: false, items: 1, total: "JOD 2,596.81", customStatus: "undamaged",  status: "invoiced",  deliveryStatus: "Undelivered",          visitId: "-", linkedInvoiceId: "INV-007", itemsData: [] },
  { id: "9",  orderNo: "PRO-ADM-2179", issueDate: "06/04/2026", externalSerial: "sdfsdf",    time: "06/04/2026, 06:43:", version: "0", creator: "ADMIN Yousef1",       editor: "ADMIN Yousef1",       clientName: "Karak Tes",      clientCode: "_800001", geoTag: true,  items: 4, total: "JOD 4.35",     customStatus: "undamaged",  status: "invoiced",  deliveryStatus: "Partially Delivered",  visitId: "b8144831-3fa4-4ec", linkedInvoiceId: "INV-004", itemsData: [] },
  { id: "10", orderNo: "PRO-1555-135", issueDate: "06/04/2026", externalSerial: "-",         time: "06/04/2026, 02:41:", version: "0", creator: "REP Ahmad Abudre",    editor: "REP Ahmad Abudre",    clientName: "nofal0",         clientCode: "_800008", geoTag: true,  items: 2, total: "JOD 3.45",     customStatus: "undamaged",  status: "approved",  deliveryStatus: "Undelivered",          visitId: "b8144831-3fa4-4ec", itemsData: [] },
  { id: "11", orderNo: "PRO-ADM-2183", issueDate: "06/05/2026", externalSerial: "-",         time: "06/05/2026, 09:15 AM", version: "0", creator: "ADMIN Ayah Al-Ori",   editor: "ADMIN Ayah Al-Ori",   clientName: "test 666 11717", clientCode: "t 23 yv", geoTag: false, items: 3, total: "JOD 52.50",    customStatus: "undamaged",  status: "pending",   deliveryStatus: "Undelivered",          visitId: "-", itemsData: [{ id: "p11-itm1", name: "American Coffee", sku: "AC-500", unit: "Piece", totalQty: 10, deliveredQty: 0, notedQty: 0, price: 4.0, tax: 0 }, { id: "p11-itm2", name: "Croissant", sku: "CR-001", unit: "Box", totalQty: 3, deliveredQty: 0, notedQty: 0, price: 2.5, tax: 0 }, { id: "p11-itm3", name: "Premium Pack", sku: "PP-200", unit: "Box", totalQty: 1, deliveredQty: 0, notedQty: 0, price: 32.0, tax: 0 }] },
];

const INITIAL_INVOICES: InvoiceRecord[] = [
  { id: "INV-001", serialNo: "INV-2026-001", externalSerial: "-",        issueDate: "07/04/2026", creator: "ADMIN Ayah Al-Ori",   clientName: "test 666 11717", items: 1, total: "JOD 3.75",     balance: "JOD 0.00",  paymentType: "Cash",     status: "APPROVED", delivery: "Delivered", comment: "-",                       sourceSOId: "4", itemsData: [{ id: "itm1", name: "Test Item 1", sku: "SKU-001", unit: "Piece", totalQty: 5, deliveredQty: 5, notedQty: 0, price: 0.75, tax: 0 }] },
  { id: "INV-002", serialNo: "INV-2026-002", externalSerial: "jb_jmm",   issueDate: "07/04/2026", creator: "ADMIN M.htaht",       clientName: "test 666 11717", items: 1, total: "JOD 0.56",     balance: "JOD 0.56",  paymentType: "Credit",   status: "PENDING",  delivery: "No Delivery Note",    comment: "-",                       sourceSOId: "2", itemsData: [{ id: "itm2", name: "Test Item 2", sku: "SKU-002", unit: "Box", totalQty: 1, deliveredQty: 0, notedQty: 0, price: 0.56, tax: 0 }] },
  { id: "INV-003", serialNo: "INV-2026-003", externalSerial: "565457554", issueDate: "07/04/2026", creator: "REP Ahmad Alshaikh",  clientName: "test 666 11717", items: 3, total: "JOD 149.50",   balance: "JOD 149.50",paymentType: "Deferred", status: "PENDING",  delivery: "Has Delivery Note",   comment: "Urgent delivery",         sourceSOId: "3", itemsData: [{ id: "itm3", name: "American Coffee", sku: "AC-500", unit: "Piece", totalQty: 10, deliveredQty: 0, notedQty: 0, price: 4.0, tax: 0 }, { id: "itm4", name: "Croissant", sku: "CR-001", unit: "Piece", totalQty: 5, deliveredQty: 0, notedQty: 0, price: 2.5, tax: 0 }, { id: "itm5", name: "Premium Pack", sku: "PP-200", unit: "Box", totalQty: 3, deliveredQty: 0, notedQty: 0, price: 32.33, tax: 0 }] },
  { id: "INV-004", serialNo: "INV-2026-004", externalSerial: "-",        issueDate: "06/04/2026", creator: "ADMIN Yousef1",       clientName: "Karak Tes",      items: 4, total: "JOD 4.35",     balance: "JOD 0.00",  paymentType: "Cash",     status: "APPROVED", delivery: "Delivered", comment: "-",                       sourceSOId: "9", itemsData: [] },
  { id: "INV-005", serialNo: "INV-2026-005", externalSerial: "hh",       issueDate: "06/04/2026", creator: "REP Ahmad Alshaikh",  clientName: "test 666 11717", items: 1, total: "JOD 0.75",     balance: "JOD 0.75",  paymentType: "Credit",   status: "PENDING",  delivery: "No Delivery Note",    comment: "-",                       sourceSOId: "6", itemsData: [] },
  { id: "INV-006", serialNo: "INV-2026-006", externalSerial: "-",        issueDate: "01/02/2026", creator: "REP khaled",          clientName: "99ik",           items: 2, total: "JOD 2,596.81", balance: "JOD 0.00",  paymentType: "Cash",     status: "APPROVED", delivery: "Delivered", comment: "Paid on time",            sourceSOId: "7", itemsData: [] },
  { id: "INV-007", serialNo: "INV-2026-007", externalSerial: "-",        issueDate: "12/01/2026", creator: "REP khaled",          clientName: "new m2",         items: 1, total: "JOD 10.80",    balance: "JOD 5.40",  paymentType: "Deferred", status: "PENDING",  delivery: "Has Delivery Note",   comment: "Partial payment received", sourceSOId: "8", itemsData: [] },
  { id: "INV-008", serialNo: "INV-2026-008", externalSerial: "sdfsdf",   issueDate: "06/04/2026", creator: "ADMIN Yousef1",       clientName: "Gaza",           items: 2, total: "JOD 8.00",     balance: "JOD 8.00",  paymentType: "Credit",   status: "CANCELED", delivery: "No Delivery Note",    comment: "Client requested cancellation", sourceSOId: "1", itemsData: [] },
];

const INITIAL_DN_LIST: DNRecord[] = [
  { id: "dn-khaled-new", dnNumber: "DN-KHALED-WAIT", status: "PENDING", clientName: "test 666 11717", rep: "REP khaled", createdBy: "Admin", warehouse: "Main Branch", items: 1, createdDate: "06/05/2026", adminTransfer: "NONE", repTransfer: "NONE", isManual: true, itemsData: [{ id: "p11-itm1", name: "American Coffee", sku: "AC-500", qty: 2, unit: "Piece", qtyBase: 2, soQty: 2, soUnit: "Piece", delivered: 0, warehouse: "Main Branch" }] },
  { id: "dn-khaled-new-2", dnNumber: "DN-KHALED-WAIT-2", status: "PENDING", clientName: "test 666 11717", rep: "REP khaled", createdBy: "Admin", warehouse: "Main Branch", items: 2, createdDate: "06/05/2026", adminTransfer: "NONE", repTransfer: "NONE", isManual: true, itemsData: [{ id: "p11-itm2", name: "Croissant", sku: "CR-001", qty: 1, unit: "Box", qtyBase: 1, soQty: 1, soUnit: "Box", delivered: 0, warehouse: "Main Branch" }] },
  { id: "dn-1",  dnNumber: "DN-ADM-0041", status: "PENDING",    sourceSOId: "1",  sourceSONumber: "PRO-ADM-2182", clientName: "Gaza",           rep: "ADMIN Yousef1",       createdBy: "ADMIN Yousef1",    warehouse: "Main Branch",    items: 1, createdDate: "08/04/2026", adminTransfer: "NONE", repTransfer: "NONE", itemsData: [{ id: "itm1", name: "American Coffee", sku: "AC-500", qty: 5, unit: "Piece", qtyBase: 5, soQty: 10, soUnit: "Piece", delivered: 0, warehouse: "Main Branch" }] },
  { id: "dn-2",  dnNumber: "DN-1734-18",  status: "PROCESSING", sourceSOId: "2",  sourceSONumber: "PRO-1734-91",  clientName: "test 666 11717", rep: "REP Ahmad Alshaikh",  createdBy: "ADMIN Ayah Al-Ori", warehouse: "Zarqaa Warehouse", items: 1, createdDate: "07/04/2026", adminTransfer: "DONE", repTransfer: "CONFIRMED", itemsData: [{ id: "itm2", name: "Croissant", sku: "CR-001", qty: 1, unit: "Box", qtyBase: 6, soQty: 8, soUnit: "Piece", delivered: 0, warehouse: "Dream Warehouse" }] },
  { id: "dn-3",  dnNumber: "DN-1734-17",  status: "APPROVED",   sourceSOId: "3",  sourceSONumber: "PRO-1734-90",  clientName: "test 666 11717", rep: "REP Ahmad Alshaikh",  createdBy: "ADMIN Ayah Al-Ori", warehouse: "Main Branch",    items: 3, createdDate: "07/04/2026", adminTransfer: "DONE", repTransfer: "CONFIRMED", itemsData: [{ id: "itm1", name: "American Coffee", sku: "AC-500", qty: 1, unit: "Carton", qtyBase: 24, soQty: 48, soUnit: "Piece", delivered: 24, warehouse: "Zarqaa Warehouse" }] },
  { id: "dn-4",  dnNumber: "DN-1734-16",  status: "CANCELED",   sourceSOId: "4",  sourceSONumber: "PRO-1734-89",  clientName: "test 666 11717", rep: "REP Ahmad Alshaikh",  createdBy: "REP Ahmad Alshaikh", warehouse: "Dream Warehouse", items: 1, createdDate: "07/04/2026", adminTransfer: "NONE", repTransfer: "NONE", cancelReason: "Canceled", itemsData: [{ id: "itm2", name: "Croissant", sku: "CR-001", qty: 3, unit: "Piece", qtyBase: 3, soQty: 5, soUnit: "Piece", delivered: 0, warehouse: "Main Branch" }] },
  { id: "dn-5",  dnNumber: "DN-1734-15",  status: "APPROVED",   sourceSOId: "5",  sourceSONumber: "PRO-1734-88",  clientName: "test 666 11717", rep: "REP Ahmad Alshaikh",  createdBy: "REP Ahmad Alshaikh", warehouse: "Main Branch",    items: 2, createdDate: "07/04/2026", adminTransfer: "DONE", repTransfer: "CONFIRMED", itemsData: [{ id: "itm1", name: "American Coffee", sku: "AC-500", qty: 2, unit: "Piece", qtyBase: 2, soQty: 10, soUnit: "Piece", delivered: 2, warehouse: "Khald Warehouse" }] },
  { id: "dn-6",  dnNumber: "DN-ADM-0040", status: "PENDING",    sourceSOId: "9",  sourceSONumber: "PRO-ADM-2179", clientName: "Karak Tes",      rep: "ADMIN Yousef1",       createdBy: "ADMIN Yousef1",    warehouse: "Zarqaa Warehouse", items: 4, createdDate: "06/04/2026", adminTransfer: "NONE", repTransfer: "NONE", itemsData: [{ id: "itm1", name: "American Coffee", sku: "AC-500", qty: 4, unit: "Piece", qtyBase: 4, soQty: 10, soUnit: "Piece", delivered: 0, warehouse: "Main Branch" }] },
  { id: "dn-7",  dnNumber: "DN-1545-22",  status: "PROCESSING", sourceSOId: "7",  sourceSONumber: "PRO-1545-693", clientName: "99ik",           rep: "REP khaled",          createdBy: "ADMIN Maram Alsl", warehouse: "Dream Warehouse", items: 1, createdDate: "01/02/2026", adminTransfer: "DONE", repTransfer: "NONE", itemsData: [{ id: "itm2", name: "Croissant", sku: "CR-001", qty: 2, unit: "Piece", qtyBase: 2, soQty: 5, soUnit: "Piece", delivered: 0, warehouse: "Zarqaa Warehouse" }] },
  { id: "dn-8",  dnNumber: "DN-1545-21",  status: "PENDING",    sourceSOId: "8",  sourceSONumber: "PRO-1545-692", clientName: "new m2",         rep: "REP khaled",          createdBy: "REP khaled",       warehouse: "Main Branch",    items: 1, createdDate: "12/01/2026", adminTransfer: "NONE", repTransfer: "NONE", itemsData: [{ id: "itm1", name: "American Coffee", sku: "AC-500", qty: 6, unit: "Piece", qtyBase: 6, soQty: 10, soUnit: "Piece", delivered: 0, warehouse: "Main Branch" }] },
  { id: "dn-9",  dnNumber: "DN-1555-09",  status: "APPROVED",   sourceSOId: "10", sourceSONumber: "PRO-1555-135", clientName: "nofal0",         rep: "REP Ahmad Abudre",    createdBy: "ADMIN Ayah Al-Ori", warehouse: "Zarqaa Warehouse", items: 2, createdDate: "06/04/2026", adminTransfer: "DONE", repTransfer: "CONFIRMED", itemsData: [{ id: "itm2", name: "Croissant", sku: "CR-001", qty: 5, unit: "Piece", qtyBase: 5, soQty: 5, soUnit: "Piece", delivered: 5, warehouse: "Main Branch" }] },
  { id: "dn-10", dnNumber: "DN-ADM-0039", status: "CANCELED",   sourceSOId: "10", sourceSONumber: "PRO-ADM-2175", clientName: "Gaza",           rep: "ADMIN Maram Alsl",    createdBy: "ADMIN Maram Alsl", warehouse: "Dream Warehouse", items: 5, createdDate: "05/04/2026", adminTransfer: "NONE", repTransfer: "NONE", cancelReason: "Canceled", itemsData: [{ id: "itm1", name: "American Coffee", sku: "AC-500", qty: 3, unit: "Piece", qtyBase: 3, soQty: 10, soUnit: "Piece", delivered: 0, warehouse: "Zarqaa Warehouse" }] },
];

const INITIAL_UNLOAD_LIST: UnloadRecord[] = [
  { id: "UNL-001", dnNumber: "DN-ADM-0041", dnId: "dn-1", originalWarehouse: "Main Branch",    unloadWarehouse: "Main Branch",    rep: "Ahmad Alshaikh",    createdBy: "ADMIN Yousef1",    client: "test 666 11717", itemsCount: 2, status: "Pending Unload", cancellationReason: "Client refused delivery",        date: "Apr 14, 2026", itemsData: [{ id: "itm1", name: "American Coffee", sku: "AC-500", qty: 2, unit: "Piece", originalWarehouse: "Main Branch" }, { id: "itm2", name: "Croissant", sku: "CR-001", qty: 1, unit: "Box", originalWarehouse: "Main Branch" }] },
  { id: "UNL-002", dnNumber: "DN-1734-18",  dnId: "dn-2", originalWarehouse: "Dream Warehouse", unloadWarehouse: "Zarqaa Warehouse", rep: "REP khaled",       createdBy: "ADMIN Ayah Al-Ori", client: "Karak Tes",      itemsCount: 1, status: "Pending Unload", cancellationReason: "Address not found",              date: "Apr 13, 2026", itemsData: [{ id: "itm2", name: "Croissant", sku: "CR-001", qty: 3, unit: "Piece", originalWarehouse: "Dream Warehouse" }] },
  { id: "UNL-003", dnNumber: "DN-1734-17",  dnId: "dn-3", originalWarehouse: "Zarqaa Warehouse",unloadWarehouse: "Zarqaa Warehouse", rep: "REP Ahmad Abudre", createdBy: "ADMIN Maram Alsl", client: "Demo Client",    itemsCount: 3, status: "Accepted",       cancellationReason: "Order rejected by client",       date: "Apr 10, 2026", itemsData: [{ id: "itm1", name: "American Coffee", sku: "AC-500", qty: 1, unit: "Piece", originalWarehouse: "Zarqaa Warehouse" }, { id: "itm2", name: "Croissant", sku: "CR-001", qty: 2, unit: "Box", originalWarehouse: "Zarqaa Warehouse" }, { id: "itm3", name: "Premium Pack", sku: "PP-200", qty: 1, unit: "Box", originalWarehouse: "Zarqaa Warehouse" }] },
  { id: "UNL-004", dnNumber: "DN-1734-16",  dnId: "dn-4", originalWarehouse: "Main Branch",    unloadWarehouse: "Main Branch",    rep: "Ahmad Alshaikh",    createdBy: "Ahmad Alshaikh",   client: "test 666 11717", itemsCount: 4, status: "Unloaded",                                                                     date: "Apr 8, 2026", itemsData: [{ id: "itm1", name: "American Coffee", sku: "AC-500", qty: 3, unit: "Piece", originalWarehouse: "Main Branch" }, { id: "itm2", name: "Croissant", sku: "CR-001", qty: 1, unit: "Piece", originalWarehouse: "Main Branch" }, { id: "itm3", name: "Premium Pack", sku: "PP-200", qty: 2, unit: "Box", originalWarehouse: "Main Branch" }, { id: "itm4", name: "Test Item 2", sku: "SKU-002", qty: 1, unit: "Box", originalWarehouse: "Main Branch" }] },
  { id: "UNL-005", dnNumber: "DN-1734-15",  dnId: "dn-5", originalWarehouse: "Khald Warehouse", unloadWarehouse: "Khald Warehouse", rep: "REP khaled",       createdBy: "REP khaled",       client: "Global Client A",itemsCount: 2, status: "Pending Unload", cancellationReason: "Damaged goods found during loading", date: "Apr 7, 2026", itemsData: [{ id: "itm1", name: "American Coffee", sku: "AC-500", qty: 2, unit: "Piece", originalWarehouse: "Khald Warehouse" }, { id: "itm2", name: "Croissant", sku: "CR-001", qty: 3, unit: "Piece", originalWarehouse: "Khald Warehouse" }] },
];

const INITIAL_PN_LIST: PNRecord[] = [
  { id: "RN-001", rnNumber: "RN-001", status: "PENDING", sourceSOId: "PRO-1734-88", sourceSONumber: "PRO-1734-88", sourceDNs: [{ id: "DN-ADM-0041", number: "DN-ADM-0041" }], invoiceNumber: "INV-2026-001", clientName: "test 666 11717", rep: "Ahmad Alshaikh", createdBy: "Ahmad Alshaikh", warehouse: "Main Branch", destinationWarehouse: "Main Warehouse", items: 2, reservedCount: 2, createdDate: "08/04/2026", inRepVan: false, creditNoteStatus: "Pending", invoicePaymentStatus: "Paid", repConfirmed: false, adminConfirmed: false, itemsData: [{ id: "itm1", name: "American Coffe", sku: "AC-500", unit: "Piece", deliveredQty: 5, returnQty: 2, status: "Reserved", condition: "Resellable" }] },
  { id: "RN-002", rnNumber: "RN-002", status: "PROCESSING", sourceSOId: "PRO-1734-87", sourceSONumber: "PRO-1734-87", sourceDNs: [{ id: "DN-1734-18", number: "DN-1734-18" }], invoiceNumber: "INV-2026-002", clientName: "Karak Test", rep: "REP khaled", createdBy: "REP khaled", warehouse: "Zarqaa Warehouse", destinationWarehouse: "Rep Van", destinationRep: "REP khaled", items: 1, reservedCount: 1, createdDate: "07/04/2026", inRepVan: true, creditNoteStatus: "N/A", invoicePaymentStatus: "Unpaid", repConfirmed: true, adminConfirmed: false, itemsData: [{ id: "itm2", name: "Croissant", sku: "CR-001", unit: "Box", deliveredQty: 3, returnQty: 3, status: "Reserved", condition: "Damaged" }] },
  { id: "RN-003", rnNumber: "RN-003", status: "RECEIVED", sourceSOId: "PRO-1545-693", sourceSONumber: "PRO-1545-693", sourceDNs: [{ id: "DN-1545-22", number: "DN-1545-22" }, { id: "DN-1545-21", number: "DN-1545-21" }], invoiceNumber: "INV-2026-003", clientName: "99ik", rep: "REP khaled", createdBy: "ADMIN Yousef1", warehouse: "Khald Warehouse", destinationWarehouse: "Main Warehouse", items: 3, reservedCount: 3, createdDate: "01/02/2026", inRepVan: false, creditNoteStatus: "Issued", invoicePaymentStatus: "Partially Paid", repConfirmed: true, adminConfirmed: true, itemsData: [] },
  { id: "RN-004", rnNumber: "RN-004", status: "CANCELED", sourceSOId: "PRO-1545-692", sourceSONumber: "PRO-1545-692", sourceDNs: [{ id: "DN-1545-21", number: "DN-1545-21" }], invoiceNumber: "INV-2026-004", clientName: "new m2", rep: "REP Ahmad Abudre", createdBy: "REP Ahmad Abudre", warehouse: "Dream Warehouse", destinationWarehouse: "Main Warehouse", items: 1, reservedCount: 0, createdDate: "12/01/2026", inRepVan: false, creditNoteStatus: "N/A", invoicePaymentStatus: "Unpaid", repConfirmed: false, adminConfirmed: false, itemsData: [] },
  { id: "RN-005", rnNumber: "RN-005", status: "PENDING", sourceSOId: "PRO-ADM-2179", sourceSONumber: "PRO-ADM-2179", sourceDNs: [{ id: "DN-ADM-0040", number: "DN-ADM-0040" }], invoiceNumber: "INV-2026-005", clientName: "Karak Tes", rep: "ADMIN Yousef1", createdBy: "ADMIN Yousef1", warehouse: "Main Branch", destinationWarehouse: "Rep Van", destinationRep: "ADMIN Yousef1", items: 4, reservedCount: 4, createdDate: "06/04/2026", inRepVan: true, creditNoteStatus: "Pending", invoicePaymentStatus: "Paid", repConfirmed: false, adminConfirmed: false, itemsData: [] },
];

const INITIAL_TRANSFER_LIST: TransferRecord[] = [
  {
    id: "TRN-1742-1", serialNo: "TRN-1742-1", createdAt: "2026-04-16 2:23 PM",
    createdBy: "Ayah", from: "Dream Warehouse", to: "Dream Van",
    type: "LOAD", status: "PENDING", processTime: undefined, numberOfProducts: 1, comment: "",
    items: [{ id: "ti-1", productId: "p-chocolate", sku: "PC-001", productName: "pink chocolate", variantName: "pink chocolate 6 cubes", measureUnit: "Piece", quantity: 5, originQty: 144, destQty: 0 }],
    sourceDNId: "dn-2", sourceDNNumber: "DN-1734-18",
  },
  {
    id: "TRN-ADM-1506", serialNo: "TRN-ADM-1506", createdAt: "2026-04-16 12:24 PM",
    createdBy: "Ayah Al-Omari", from: "مستودع الكوم الرئيسي", to: "Dream Warehouse",
    type: "LOAD", status: "COMPLETED", processTime: "2026-04-16 12:24 PM", numberOfProducts: 1, comment: "",
    items: [{ id: "ti-2", productId: "p-chocolate", sku: "PC-001", productName: "pink chocolate", variantName: "pink chocolate 6 cubes", measureUnit: "Piece", quantity: 144, originQty: 0, destQty: 144 }],
    sourceRNId: "RN-002", sourceRNNumber: "RN-002",
  },
  {
    id: "TRN-ADM-1505", serialNo: "TRN-ADM-1505", createdAt: "2026-04-13 9:54 AM",
    createdBy: "M.htaht", from: "Mohammad test", to: "Dream Warehouse",
    type: "LOAD", status: "COMPLETED", processTime: "2026-04-13 9:54 AM", numberOfProducts: 2, comment: "",
    items: [
      { id: "ti-3", productId: "itm3", sku: "AC-500", productName: "American Coffee", variantName: "American Coffee 1kg", measureUnit: "Piece", quantity: 10, originQty: 0, destQty: 10 },
      { id: "ti-4", productId: "itm4", sku: "CR-001", productName: "Croissant", variantName: "Croissant Plain", measureUnit: "Box", quantity: 5, originQty: 0, destQty: 5 },
    ],
    sourceUnloadId: "UNL-002",
  },
  // DN-linked transfers
  { id: "TRN-DN-001", serialNo: "TRN-DN-001", createdAt: "2026-04-08 10:00 AM", createdBy: "ADMIN Yousef1", from: "Main Branch", to: "ADMIN Yousef1 Van Warehouse", type: "LOAD", status: "PENDING", numberOfProducts: 1, comment: "", items: [{ id: "ti-dn1-1", productId: "itm1", sku: "AC-500", productName: "American Coffee", variantName: "American Coffee 1kg", measureUnit: "Piece", quantity: 5, originQty: 5, destQty: 0 }], sourceDNId: "dn-1", sourceDNNumber: "DN-ADM-0041" },
  { id: "TRN-DN-003", serialNo: "TRN-DN-003", createdAt: "2026-04-07 11:00 AM", createdBy: "ADMIN Ayah Al-Ori", from: "Main Branch", to: "REP Ahmad Alshaikh Van Warehouse", type: "LOAD", status: "COMPLETED", processTime: "2026-04-07 2:00 PM", numberOfProducts: 3, comment: "", items: [{ id: "ti-dn3-1", productId: "itm1", sku: "AC-500", productName: "American Coffee", variantName: "American Coffee 1kg", measureUnit: "Carton", quantity: 1, originQty: 1, destQty: 1 }], sourceDNId: "dn-3", sourceDNNumber: "DN-1734-17" },
  { id: "TRN-DN-005", serialNo: "TRN-DN-005", createdAt: "2026-04-07 10:00 AM", createdBy: "REP Ahmad Alshaikh", from: "Main Branch", to: "REP Ahmad Alshaikh Van Warehouse", type: "LOAD", status: "COMPLETED", processTime: "2026-04-07 1:00 PM", numberOfProducts: 2, comment: "", items: [{ id: "ti-dn5-1", productId: "itm1", sku: "AC-500", productName: "American Coffee", variantName: "American Coffee 1kg", measureUnit: "Piece", quantity: 2, originQty: 2, destQty: 2 }], sourceDNId: "dn-5", sourceDNNumber: "DN-1734-15" },
  { id: "TRN-DN-006", serialNo: "TRN-DN-006", createdAt: "2026-04-06 09:00 AM", createdBy: "ADMIN Yousef1", from: "Zarqaa Warehouse", to: "ADMIN Yousef1 Van Warehouse", type: "LOAD", status: "PENDING", numberOfProducts: 4, comment: "", items: [{ id: "ti-dn6-1", productId: "itm1", sku: "AC-500", productName: "American Coffee", variantName: "American Coffee 1kg", measureUnit: "Piece", quantity: 4, originQty: 4, destQty: 0 }], sourceDNId: "dn-6", sourceDNNumber: "DN-ADM-0040" },
  { id: "TRN-DN-007", serialNo: "TRN-DN-007", createdAt: "2026-02-01 11:00 AM", createdBy: "ADMIN Maram Alsl", from: "Dream Warehouse", to: "REP khaled Van Warehouse", type: "LOAD", status: "PENDING", numberOfProducts: 1, comment: "", items: [{ id: "ti-dn7-1", productId: "itm2", sku: "CR-001", productName: "Croissant", variantName: "Croissant Plain", measureUnit: "Piece", quantity: 2, originQty: 2, destQty: 0 }], sourceDNId: "dn-7", sourceDNNumber: "DN-1545-22" },
  { id: "TRN-DN-008", serialNo: "TRN-DN-008", createdAt: "2026-01-12 10:00 AM", createdBy: "REP khaled", from: "Main Branch", to: "REP khaled Van Warehouse", type: "LOAD", status: "PENDING", numberOfProducts: 1, comment: "", items: [{ id: "ti-dn8-1", productId: "itm1", sku: "AC-500", productName: "American Coffee", variantName: "American Coffee 1kg", measureUnit: "Piece", quantity: 6, originQty: 6, destQty: 0 }], sourceDNId: "dn-8", sourceDNNumber: "DN-1545-21" },
  { id: "TRN-DN-009", serialNo: "TRN-DN-009", createdAt: "2026-04-06 08:00 AM", createdBy: "ADMIN Ayah Al-Ori", from: "Zarqaa Warehouse", to: "REP Ahmad Abudre Van Warehouse", type: "LOAD", status: "COMPLETED", processTime: "2026-04-06 12:00 PM", numberOfProducts: 2, comment: "", items: [{ id: "ti-dn9-1", productId: "itm2", sku: "CR-001", productName: "Croissant", variantName: "Croissant Plain", measureUnit: "Piece", quantity: 5, originQty: 5, destQty: 5 }], sourceDNId: "dn-9", sourceDNNumber: "DN-1555-09" },

];

const INITIAL_RESERVATIONS: Reservation[] = [
  { id: "RES-001", itemName: "Wireless Headphones Pro", itemId: "itm1", qty: 10, unit: "PCS", qtyBase: 10, warehouse: "Main Branch", status: "ACTIVE", date: "2026-04-01", type: "AUTO" },
  { id: "RES-002", itemName: "USB-C Charging Cable", itemId: "itm2", qty: 50, unit: "PCS", qtyBase: 50, warehouse: "Zarqaa Warehouse", status: "ACTIVE", date: "2026-04-02", type: "MANUAL" },
  { id: "RES-003", itemName: "Laptop Stand Aluminum", itemId: "itm3", qty: 5, unit: "PCS", qtyBase: 5, warehouse: "Main Branch", status: "CANCELED", date: "2026-03-28", type: "AUTO" },
];

const INITIAL_RESERVATION_AUDIT_LOG: ReservationAuditEntry[] = [
  {
    id: "AUDIT-001",
    reservationId: "RES-003",
    itemName: "Laptop Stand Aluminum",
    sku: "LSA-012",
    qty: 5,
    unit: "PCS",
    warehouse: "Main Branch",
    linkedDNId: "dn-3",
    linkedDNNumber: "DN-1734-17",
    eventType: "Used in delivery note",
    triggeredBy: "ADMIN Ayah Al-Ori",
    date: "2026-03-28",
    time: "10:14 AM",
    reservationType: "AUTO",
    status: "REVOKED",
    note: "Reservation consumed when delivery note was created",
  },
];

// ── context shape ────────────────────────────────────────────────────────────
interface AppDataContextValue {
  // per-SO detail state
  orderItems: OrderItem[];
  setOrderItems: React.Dispatch<React.SetStateAction<OrderItem[]>>;
  deliveryNotes: DeliveryNote[];
  setDeliveryNotes: React.Dispatch<React.SetStateAction<DeliveryNote[]>>;
  returnTransfers: ReturnTransfer[];
  setReturnTransfers: React.Dispatch<React.SetStateAction<ReturnTransfer[]>>;
  reservations: Reservation[];
  setReservations: React.Dispatch<React.SetStateAction<Reservation[]>>;
  soStatus: string;
  setSoStatus: React.Dispatch<React.SetStateAction<string>>;
  approvalStep: number;
  setApprovalStep: React.Dispatch<React.SetStateAction<number>>;
  cycle: number;
  setCycle: React.Dispatch<React.SetStateAction<number>>;
  paymentStatus: "PAID" | "UNPAID" | null;
  setPaymentStatus: React.Dispatch<React.SetStateAction<"PAID" | "UNPAID" | null>>;
  enableReservationModel: boolean;
  setEnableReservationModel: React.Dispatch<React.SetStateAction<boolean>>;
  reservationMode: "flexible" | "strict";
  setReservationMode: React.Dispatch<React.SetStateAction<"flexible" | "strict">>;
  allowMultiWarehouseReservation: boolean;
  setAllowMultiWarehouseReservation: React.Dispatch<React.SetStateAction<boolean>>;
  allowSOApprovalWithoutStock: boolean;
  setAllowSOApprovalWithoutStock: React.Dispatch<React.SetStateAction<boolean>>;
  allowNegativeReservation: boolean;
  setAllowNegativeReservation: React.Dispatch<React.SetStateAction<boolean>>;
  preventInvoiceReservations: boolean;
  setPreventInvoiceReservations: React.Dispatch<React.SetStateAction<boolean>>;
  enableTransactionalInvoice: boolean;
  setEnableTransactionalInvoice: React.Dispatch<React.SetStateAction<boolean>>;
  transactionalMode: "unchecked" | "checked" | "strict";
  setTransactionalMode: React.Dispatch<React.SetStateAction<"unchecked" | "checked" | "strict">>;

  // global list data
  salesOrders: SalesOrderRecord[];
  setSalesOrders: React.Dispatch<React.SetStateAction<SalesOrderRecord[]>>;
  invoices: InvoiceRecord[];
  setInvoices: React.Dispatch<React.SetStateAction<InvoiceRecord[]>>;
  dnList: DNRecord[];
  setDnList: React.Dispatch<React.SetStateAction<DNRecord[]>>;
  pnList: PNRecord[];
  setPnList: React.Dispatch<React.SetStateAction<PNRecord[]>>;
  unloadList: UnloadRecord[];
  setUnloadList: React.Dispatch<React.SetStateAction<UnloadRecord[]>>;
  transferList: TransferRecord[];
  setTransferList: React.Dispatch<React.SetStateAction<TransferRecord[]>>;
  reservationAuditLog: ReservationAuditEntry[];
  setReservationAuditLog: React.Dispatch<React.SetStateAction<ReservationAuditEntry[]>>;
  soAuditLog: SOAuditEntry[];
  setSOAuditLog: React.Dispatch<React.SetStateAction<SOAuditEntry[]>>;

  resetData: () => void;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>(() => INITIAL_ORDER_ITEMS.map(i => ({ ...i })));
  const [deliveryNotes, setDeliveryNotes] = useState<DeliveryNote[]>([]);
  const [returnTransfers, setReturnTransfers] = useState<ReturnTransfer[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>(() => INITIAL_RESERVATIONS.map(r => ({ ...r })));
  const [soStatus, setSoStatus] = useState("PENDING");
  const [approvalStep, setApprovalStep] = useState(0);
  const [cycle, setCycle] = useState(1);
  const [paymentStatus, setPaymentStatus] = useState<"PAID" | "UNPAID" | null>(null);
  const [enableReservationModel, setEnableReservationModel] = useState(true);
  const [reservationMode, setReservationMode] = useState<"flexible" | "strict">("flexible");
  const [allowMultiWarehouseReservation, setAllowMultiWarehouseReservation] = useState(false);
  const [allowSOApprovalWithoutStock, setAllowSOApprovalWithoutStock] = useState(true);
  const [allowNegativeReservation, setAllowNegativeReservation] = useState(false);
  const [preventInvoiceReservations, setPreventInvoiceReservations] = useState(false);
  const [enableTransactionalInvoice, setEnableTransactionalInvoice] = useState(false);
  const [transactionalMode, setTransactionalMode] = useState<"unchecked" | "checked" | "strict">("unchecked");

  const [salesOrders, setSalesOrders] = useState<SalesOrderRecord[]>(() => INITIAL_SALES_ORDERS.map(o => ({ ...o })));
  const [invoices, setInvoices] = useState<InvoiceRecord[]>(() => INITIAL_INVOICES.map(i => ({ ...i })));
  const [dnList, setDnList] = useState<DNRecord[]>(() => INITIAL_DN_LIST.map(d => ({ ...d })));
  const [pnList, setPnList] = useState<PNRecord[]>(() => INITIAL_PN_LIST.map(p => ({ ...p })));
  const [unloadList, setUnloadList] = useState<UnloadRecord[]>(() => INITIAL_UNLOAD_LIST.map(u => ({ ...u })));
  const [transferList, setTransferList] = useState<TransferRecord[]>(() => INITIAL_TRANSFER_LIST.map(t => ({ ...t })));
  const [reservationAuditLog, setReservationAuditLog] = useState<ReservationAuditEntry[]>(() => [...INITIAL_RESERVATION_AUDIT_LOG]);
  const [soAuditLog, setSOAuditLog] = useState<SOAuditEntry[]>([]);

  const resetData = () => {
    setOrderItems(INITIAL_ORDER_ITEMS.map(i => ({ ...i })));
    setDeliveryNotes([]);
    setReturnTransfers([]);
    setReservations(INITIAL_RESERVATIONS.map(r => ({ ...r })));
    setSoStatus("PENDING");
    setApprovalStep(0);
    setCycle(1);
    setPaymentStatus(null);
    setSalesOrders(INITIAL_SALES_ORDERS.map(o => ({ ...o })));
    setInvoices(INITIAL_INVOICES.map(i => ({ ...i })));
    setDnList(INITIAL_DN_LIST.map(d => ({ ...d })));
    setPnList(INITIAL_PN_LIST.map(p => ({ ...p })));
    setUnloadList(INITIAL_UNLOAD_LIST.map(u => ({ ...u })));
    setTransferList(INITIAL_TRANSFER_LIST.map(t => ({ ...t })));
    setReservationAuditLog([...INITIAL_RESERVATION_AUDIT_LOG]);
    setSOAuditLog([]);
    setEnableTransactionalInvoice(false);
    setTransactionalMode("unchecked");
  };

  return (
    <AppDataContext.Provider value={{
      orderItems, setOrderItems,
      deliveryNotes, setDeliveryNotes,
      returnTransfers, setReturnTransfers,
      reservations, setReservations,
      soStatus, setSoStatus,
      approvalStep, setApprovalStep,
      cycle, setCycle,
      paymentStatus, setPaymentStatus,
      enableReservationModel, setEnableReservationModel,
      reservationMode, setReservationMode,
      allowMultiWarehouseReservation, setAllowMultiWarehouseReservation,
      allowSOApprovalWithoutStock, setAllowSOApprovalWithoutStock,
      allowNegativeReservation, setAllowNegativeReservation,
      preventInvoiceReservations, setPreventInvoiceReservations,
      enableTransactionalInvoice, setEnableTransactionalInvoice,
      transactionalMode, setTransactionalMode,
      salesOrders, setSalesOrders,
      invoices, setInvoices,
      dnList, setDnList,
      pnList, setPnList,
      unloadList, setUnloadList,
      transferList, setTransferList,
      reservationAuditLog, setReservationAuditLog,
      soAuditLog, setSOAuditLog,
      resetData,
    }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
