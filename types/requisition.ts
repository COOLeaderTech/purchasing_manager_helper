export interface Requisition {
  id: number;
  vessel_name: string;
  vessel_imo?: string;
  port_name: string;
  delivery_date: string;
  currency: string;
  status: 'draft' | 'rfq_sent' | 'quotations_received' | 'completed';
  uploaded_at: string;
  uploaded_by?: string;
  notes?: string;
}

export interface RequisitionItem {
  id: number;
  requisition_id: number;
  line_number?: number;
  item_name: string;
  item_description?: string;
  quantity: number;
  unit?: string;
  specifications?: string;
}

export interface CreateRequisitionDTO {
  vessel_name: string;
  vessel_imo?: string;
  port_name: string;
  delivery_date: string;
  currency?: string;
  notes?: string;
  items: Omit<RequisitionItem, 'id' | 'requisition_id'>[];
}
