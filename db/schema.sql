-- Requisitions (uploaded from Excel)
CREATE TABLE IF NOT EXISTS requisitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vessel_name TEXT NOT NULL,
  vessel_imo TEXT,
  requisition_number TEXT,
  requisition_title TEXT,
  requisition_date TEXT,
  requisition_group TEXT,
  port_name TEXT NOT NULL,
  delivery_date TEXT NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'draft',
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  uploaded_by TEXT,
  notes TEXT
);

-- Requisition Items (line items from Excel)
CREATE TABLE IF NOT EXISTS requisition_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requisition_id INTEGER NOT NULL,
  line_number INTEGER,
  item_number TEXT,
  item_name TEXT NOT NULL,
  item_description TEXT,
  quantity REAL NOT NULL,
  unit TEXT,
  department TEXT,
  specifications TEXT,
  item_notes TEXT,
  FOREIGN KEY (requisition_id) REFERENCES requisitions(id) ON DELETE CASCADE
);

-- RFQs (generated emails)
CREATE TABLE IF NOT EXISTS rfqs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  requisition_id INTEGER NOT NULL,
  rfq_draft TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  recipients TEXT NOT NULL,
  sent_at TIMESTAMP,
  status TEXT DEFAULT 'draft',
  message_id TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (requisition_id) REFERENCES requisitions(id) ON DELETE CASCADE
);

-- Vendors (master list)
CREATE TABLE IF NOT EXISTS vendors (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  country TEXT,
  ports_served TEXT,
  categories_served TEXT,
  rating REAL DEFAULT 0.0,
  total_orders INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notes TEXT
);

-- Quotations (received from vendors)
CREATE TABLE IF NOT EXISTS quotations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rfq_id INTEGER NOT NULL,
  vendor_id INTEGER,
  vendor_email TEXT NOT NULL,
  received_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  gmail_message_id TEXT,
  attachment_path TEXT,
  extraction_status TEXT DEFAULT 'pending',
  extracted_data TEXT,
  total_amount REAL,
  currency TEXT,
  delivery_time TEXT,
  notes TEXT,
  FOREIGN KEY (rfq_id) REFERENCES rfqs(id) ON DELETE CASCADE,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE SET NULL
);

-- Quotation Items (extracted line items)
CREATE TABLE IF NOT EXISTS quotation_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quotation_id INTEGER NOT NULL,
  item_name TEXT NOT NULL,
  quantity REAL,
  unit_price REAL,
  total_price REAL,
  unit TEXT,
  delivery_time TEXT,
  notes TEXT,
  FOREIGN KEY (quotation_id) REFERENCES quotations(id) ON DELETE CASCADE
);

-- Historical Purchases (for vendor recommendations)
CREATE TABLE IF NOT EXISTS purchase_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor_id INTEGER NOT NULL,
  item_name TEXT NOT NULL,
  port_name TEXT NOT NULL,
  quantity REAL NOT NULL,
  unit_price REAL NOT NULL,
  total_price REAL NOT NULL,
  currency TEXT NOT NULL,
  delivery_time_days INTEGER,
  purchase_date DATE NOT NULL,
  vessel_name TEXT,
  quality_rating INTEGER,
  notes TEXT,
  FOREIGN KEY (vendor_id) REFERENCES vendors(id) ON DELETE CASCADE
);

-- Compliance Rules
CREATE TABLE IF NOT EXISTS compliance_rules (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  rule_type TEXT NOT NULL,
  rule_name TEXT NOT NULL,
  rule_config TEXT NOT NULL,
  is_active BOOLEAN DEFAULT 1,
  severity TEXT DEFAULT 'warning',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Compliance Violations
CREATE TABLE IF NOT EXISTS compliance_violations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL,
  entity_id INTEGER NOT NULL,
  rule_id INTEGER NOT NULL,
  violation_details TEXT NOT NULL,
  severity TEXT NOT NULL,
  resolved BOOLEAN DEFAULT 0,
  flagged_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP,
  FOREIGN KEY (rule_id) REFERENCES compliance_rules(id)
);

-- AI Processing Logs
CREATE TABLE IF NOT EXISTS ai_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  operation TEXT NOT NULL,
  entity_type TEXT,
  entity_id INTEGER,
  prompt TEXT,
  response TEXT,
  model TEXT,
  tokens_used INTEGER,
  duration_ms INTEGER,
  status TEXT,
  error_message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_requisitions_status ON requisitions(status);
CREATE INDEX IF NOT EXISTS idx_requisitions_vessel ON requisitions(vessel_name);
CREATE INDEX IF NOT EXISTS idx_requisition_items_req_id ON requisition_items(requisition_id);
CREATE INDEX IF NOT EXISTS idx_quotations_rfq_id ON quotations(rfq_id);
CREATE INDEX IF NOT EXISTS idx_quotations_vendor ON quotations(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_history_vendor ON purchase_history(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_history_item ON purchase_history(item_name);
CREATE INDEX IF NOT EXISTS idx_purchase_history_port ON purchase_history(port_name);
CREATE INDEX IF NOT EXISTS idx_compliance_violations_entity ON compliance_violations(entity_type, entity_id);
