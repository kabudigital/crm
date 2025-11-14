export enum UserRole {
  Admin = 'admin',
  Supervisor = 'supervisor',
  Technician = 'tecnico',
  Client = 'cliente'
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  password?: string;
}

export interface Customer {
  id: number;
  name: string;
  cnpj_cpf?: string;
  address?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
}

export enum ServiceOrderStatus {
    Open = 'aberta',
    InProgress = 'em_andamento',
    Completed = 'concluida',
    Canceled = 'cancelada',
}

export interface ServiceOrder {
    id: number;
    title: string;
    description: string;
    customer_id: number;
    technician_id?: number | null;
    status: ServiceOrderStatus;
    created_at: string;
    completed_at?: string | null;
    customers?: Customer; // For relational queries
    users?: User; // For relational queries
}