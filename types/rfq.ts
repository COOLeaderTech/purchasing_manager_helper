export interface RFQ {
  id: number;
  requisition_id: number;
  subject: string;
  body: string;
  recipients: string; // JSON array of email addresses
  sent_at?: string;
  status: 'draft' | 'sent' | 'replied';
  message_id?: string;
}

export interface GenerateRFQRequest {
  requisition_id: number;
  vendor_ids: number[];
  custom_terms?: string;
}

export interface GenerateRFQResponse {
  subject: string;
  body: string;
  recipients: string[];
}

export interface SendRFQRequest {
  rfq_id: number;
  recipients: string[];
}
