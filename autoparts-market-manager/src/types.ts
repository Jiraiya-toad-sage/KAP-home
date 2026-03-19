export enum JobStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export interface Part {
  id: string;
  name: string;
  brand?: string;
  price: number;
  quantity: number;
  addedAt: string;
}

export interface Job {
  id: string;
  shopId: string;
  customerName: string;
  customerPhone: string;
  vehicleNumber: string;
  vehicleModel: string;
  status: JobStatus;
  totalAmount: number;
  amountPaid?: number;
  waivedAmount?: number;
  parts: Part[];
  createdAt: string;
  completedAt?: string;
}

export interface Shop {
  id: string;
  name: string;
  ownerName: string;
  ownerEmail: string;
  ownerId: string;
  address?: string;
  phone?: string;
  createdAt: string;
}
