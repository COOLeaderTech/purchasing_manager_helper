export interface Vendor {
  id: number;
  name: string;
  email: string;
  phone?: string;
  country?: string;
  ports_served?: string; // JSON array
  categories_served?: string; // JSON array
  rating: number;
  total_orders: number;
  is_active: boolean;
  created_at: string;
  notes?: string;
}

export interface VendorRecommendation {
  vendor_id: number;
  vendor_name: string;
  relevance_score: number;
  reason: string;
  historical_price_min?: number;
  historical_price_max?: number;
  historical_price_avg?: number;
  past_purchases_count: number;
  quality_rating?: number;
}

export interface CreateVendorDTO {
  name: string;
  email: string;
  phone?: string;
  country?: string;
  ports_served?: string[];
  categories_served?: string[];
  notes?: string;
}
