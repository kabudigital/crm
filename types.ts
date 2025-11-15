export enum UserRole {
  Admin = 'admin',
  Supervisor = 'supervisor',
  Technician = 'tecnico',
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

export interface Equipment {
    id: number;
    customer_id: number;
    name: string;
    brand?: string;
    model?: string;
    serial_number?: string;
    customers?: Customer;
}

export enum ServiceType {
    Preventiva = 'preventiva',
    Corretiva = 'corretiva',
    Instalacao = 'instalacao',
    Orcamento = 'orcamento',
}

export enum ServiceOrderStatus {
    AguardandoAgendamento = 'aguardando_agendamento',
    Agendada = 'agendada',
    EmExecucao = 'em_execucao',
    AguardandoPeca = 'aguardando_peca',
    Concluida = 'concluida',
    Cancelada = 'cancelada',
}

export interface ServiceOrder {
    id: number;
    customer_id: number;
    equipment_id?: number | null;
    technician_id?: number | null;
    reported_problem: string;
    service_type: ServiceType;
    status: ServiceOrderStatus;
    scheduled_at?: string | null;
    completed_at?: string | null;
    required_materials?: string[];
    created_at: string;
    
    // For relational queries
    customers?: Customer; 
    users?: User; 
    equipments?: Equipment;
}