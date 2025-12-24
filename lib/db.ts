import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { Requisition, RequisitionItem } from '@/types/requisition';
import { RFQ } from '@/types/rfq';
import { Vendor } from '@/types/vendor';
import { Quotation, QuotationItem } from '@/types/quotation';

let db: Database.Database | null = null;

export function initDatabase() {
  if (db) return db;

  // Use /tmp for serverless environments (Vercel)
  const isVercel = process.env.VERCEL === '1';
  const defaultPath = isVercel ? '/tmp/maritime-assistant.db' : './data/maritime-assistant.db';
  const dbPath = process.env.DATABASE_PATH || defaultPath;
  const dbDir = path.dirname(dbPath);

  // Create data directory if needed (skip for /tmp as it always exists)
  if (dbDir !== '/tmp' && !fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }

  db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Load schema
  const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf-8');
    db.exec(schema);
  }

  return db;
}

export function getDb(): Database.Database {
  if (!db) {
    initDatabase();
  }
  return db!;
}

// Helper functions for common operations
export const dbHelpers = {
  // Requisitions
  getRequisitions: () => getDb().prepare('SELECT * FROM requisitions ORDER BY uploaded_at DESC').all() as Requisition[],
  getRequisition: (id: number) => getDb().prepare('SELECT * FROM requisitions WHERE id = ?').get(id) as Requisition | undefined,
  createRequisition: (data: any) => {
    const stmt = getDb().prepare(`
      INSERT INTO requisitions (vessel_name, vessel_imo, requisition_number, requisition_title, requisition_date, requisition_group, port_name, delivery_date, currency, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      data.vessel_name,
      data.vessel_imo,
      data.requisition_number,
      data.requisition_title,
      data.requisition_date,
      data.requisition_group,
      data.port_name,
      data.delivery_date,
      data.currency,
      data.notes
    );
  },

  // Requisition Items
  getRequisitionItems: (requisitionId: number) =>
    getDb().prepare('SELECT * FROM requisition_items WHERE requisition_id = ? ORDER BY line_number').all(requisitionId) as RequisitionItem[],
  addRequisitionItem: (data: any) => {
    const stmt = getDb().prepare(`
      INSERT INTO requisition_items (requisition_id, line_number, item_number, item_name, item_description, quantity, unit, department, specifications, item_notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(
      data.requisition_id,
      data.line_number,
      data.item_number,
      data.item_name,
      data.item_description,
      data.quantity,
      data.unit,
      data.department,
      data.specifications,
      data.item_notes
    );
  },

  // Vendors
  getVendors: () => getDb().prepare('SELECT * FROM vendors WHERE is_active = 1 ORDER BY name').all() as Vendor[],
  getVendor: (id: number) => getDb().prepare('SELECT * FROM vendors WHERE id = ?').get(id) as Vendor | undefined,
  createVendor: (data: any) => {
    const stmt = getDb().prepare(`
      INSERT INTO vendors (name, email, phone, country, ports_served, categories_served, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(data.name, data.email, data.phone, data.country, data.ports_served, data.categories_served, data.notes);
  },

  // RFQs
  getRFQs: () => getDb().prepare('SELECT * FROM rfqs ORDER BY created_at DESC').all() as RFQ[],
  getRFQ: (id: number) => getDb().prepare('SELECT * FROM rfqs WHERE id = ?').get(id) as RFQ | undefined,
  getRFQByRequisition: (requisitionId: number) =>
    getDb().prepare('SELECT * FROM rfqs WHERE requisition_id = ?').get(requisitionId) as RFQ | undefined,
  createRFQ: (data: any) => {
    const stmt = getDb().prepare(`
      INSERT INTO rfqs (requisition_id, rfq_draft, subject, body, recipients, status)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(data.requisition_id, data.rfq_draft, data.subject, data.body, data.recipients, data.status);
  },
  updateRFQ: (id: number, data: any) => {
    const stmt = getDb().prepare(`
      UPDATE rfqs
      SET rfq_draft = ?, subject = ?, body = ?
      WHERE id = ?
    `);
    return stmt.run(data.rfq_draft, data.subject, data.body, id);
  },

  // Quotations
  getQuotations: () => getDb().prepare('SELECT * FROM quotations ORDER BY received_at DESC').all() as Quotation[],
  getQuotation: (id: number) => getDb().prepare('SELECT * FROM quotations WHERE id = ?').get(id) as Quotation | undefined,
  getQuotationsByRFQ: (rfqId: number) =>
    getDb().prepare('SELECT * FROM quotations WHERE rfq_id = ? ORDER BY received_at DESC').all(rfqId) as Quotation[],
  createQuotation: (data: any) => {
    const stmt = getDb().prepare(`
      INSERT INTO quotations (rfq_id, vendor_id, vendor_email, extraction_status)
      VALUES (?, ?, ?, ?)
    `);
    return stmt.run(data.rfq_id, data.vendor_id, data.vendor_email, data.extraction_status);
  },

  // Quotation Items
  getQuotationItems: (quotationId: number) =>
    getDb().prepare('SELECT * FROM quotation_items WHERE quotation_id = ?').all(quotationId) as QuotationItem[],

  // Purchase History
  getPurchaseHistory: (vendorId: number) =>
    getDb().prepare('SELECT * FROM purchase_history WHERE vendor_id = ? ORDER BY purchase_date DESC').all(vendorId),
  addPurchaseHistory: (data: any) => {
    const stmt = getDb().prepare(`
      INSERT INTO purchase_history (vendor_id, item_name, port_name, quantity, unit_price, total_price, currency, delivery_time_days, purchase_date, vessel_name, quality_rating, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(data.vendor_id, data.item_name, data.port_name, data.quantity, data.unit_price, data.total_price, data.currency, data.delivery_time_days, data.purchase_date, data.vessel_name, data.quality_rating, data.notes);
  },

  // Compliance
  getComplianceViolations: () =>
    getDb().prepare('SELECT * FROM compliance_violations WHERE resolved = 0 ORDER BY flagged_at DESC').all(),
  createViolation: (data: any) => {
    const stmt = getDb().prepare(`
      INSERT INTO compliance_violations (entity_type, entity_id, rule_id, violation_details, severity)
      VALUES (?, ?, ?, ?, ?)
    `);
    return stmt.run(data.entity_type, data.entity_id, data.rule_id, data.violation_details, data.severity);
  },

  // AI Logs
  logAIOperation: (data: any) => {
    const stmt = getDb().prepare(`
      INSERT INTO ai_logs (operation, entity_type, entity_id, prompt, response, model, tokens_used, duration_ms, status, error_message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    return stmt.run(data.operation, data.entity_type, data.entity_id, data.prompt, data.response, data.model, data.tokens_used, data.duration_ms, data.status, data.error_message);
  },
};
