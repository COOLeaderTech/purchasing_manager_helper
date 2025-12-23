export interface ComplianceRule {
  id: number;
  rule_type: string;
  rule_name: string;
  rule_config: string; // JSON
  is_active: boolean;
  severity: 'info' | 'warning' | 'error';
  created_at: string;
}

export interface ComplianceViolation {
  id: number;
  entity_type: 'requisition' | 'rfq' | 'quotation';
  entity_id: number;
  rule_id: number;
  violation_details: string;
  severity: 'info' | 'warning' | 'error';
  resolved: boolean;
  flagged_at: string;
  resolved_at?: string;
}

export interface ComplianceCheckRequest {
  entity_type: 'requisition' | 'rfq' | 'quotation';
  entity_id: number;
}

export interface ComplianceCheckResponse {
  violations: ComplianceViolation[];
  has_critical_errors: boolean;
  summary: {
    info_count: number;
    warning_count: number;
    error_count: number;
  };
}

export interface AnomalyDetectionResult {
  has_anomalies: boolean;
  anomalies: {
    type: string;
    severity: 'info' | 'warning' | 'error';
    description: string;
    affected_items?: string[];
  }[];
}
