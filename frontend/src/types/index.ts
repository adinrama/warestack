export type Role = "STAFF_LEAD" | "STAFF";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  staffLeadId?: string | null;
  staffLead?: { id: string; name: string; email: string } | null;
  _count?: { staffMembers: number; products: number };
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string | null;
  quantity: number;
  price: number | string;
  category?: string | null;
  staffLeadId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductsResponse {
  products: Product[];
  total: number;
  page: number;
  pages: number;
}

export interface TeamResponse {
  members: User[];
  count: number;
  maxAllowed: number;
}

export interface ApiError {
  message: string;
  errors?: { msg: string; path: string }[];
}
