export interface Requisition {
  id: number;
  vessel_name: string;
  vessel_imo?: string;
  requisition_number?: string;
  requisition_title?: string;
  requisition_date?: string;
  requisition_group?: string;
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
  item_number?: string;
  item_name: string;
  item_description?: string;
  quantity: number;
  unit?: string;
  department?: string;
  specifications?: string;
  item_notes?: string;
}

export interface CreateRequisitionDTO {
  vessel_name: string;
  vessel_imo?: string;
  requisition_number?: string;
  requisition_title?: string;
  requisition_date?: string;
  requisition_group?: string;
  port_name: string;
  delivery_date: string;
  currency?: string;
  notes?: string;
  items: Omit<RequisitionItem, 'id' | 'requisition_id'>[];
}
