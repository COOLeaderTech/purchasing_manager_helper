export interface Quotation {
  id: number;
  rfq_id: number;
  vendor_id?: number;
  vendor_email: string;
  received_at: string;
  gmail_message_id?: string;
  attachment_path?: string;
  extraction_status: 'pending' | 'extracted' | 'failed';
  extracted_data?: string; // JSON
  total_amount?: number;
  currency?: string;
  delivery_time?: string;
  notes?: string;
}

export interface QuotationItem {
  id: number;
  quotation_id: number;
  item_name: string;
  quantity?: number;
  unit_price?: number;
  total_price?: number;
  unit?: string;
  delivery_time?: string;
  notes?: string;
}

export interface ExtractedQuotationData {
  vendor_name?: string;
  items: QuotationItemExtracted[];
  total_amount?: number;
  currency?: string;
  delivery_time?: string;
  payment_terms?: string;
  validity_date?: string;
  notes?: string;
}

export interface QuotationItemExtracted {
  item_name: string;
  quantity?: number;
  unit_price?: number;
  total_price?: number;
  unit?: string;
  delivery_time?: string;
}

export interface QuotationComparison {
  item_name: string;
  vendors: {
    vendor_name: string;
    quantity: number;
    unit_price?: number;
    total_price?: number;
    delivery_time?: string;
  }[];
  lowest_price?: number;
  highest_price?: number;
}
