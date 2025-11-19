
export enum UserRole {
  Admin = 'admin',
  Supervisor = 'supervisor',
  Technician = 'tecnico',
}

export interface User {
  id: string; // Changed to string for Supabase UUID
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
}

export interface Customer {
  id: number;
  name: string;
  cnpj_cpf?: string;
  address?: string;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  created_at: string;
}

export interface Equipment {
    id: number;
    customer_id: number;
    name: string;
    brand?: string;
    model?: string;
    serial_number?: string;
    capacity_btu?: number;
    type?: string;     // New: e.g., Split, VRF
    location?: string; // New: e.g., Sala de Reunião
    created_at: string;
    customers?: Customer; // For joins
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
    Aprovado = 'aprovado',
}

export interface Material {
  name: string;
  quantity: number;
}

export interface ServiceOrder {
    id: number;
    customer_id: number;
    equipment_id?: number | null;
    technician_id?: string | null; // Changed to string for Supabase UUID
    contract_id?: number;
    reported_problem: string;
    service_description?: string;
    observations?: string;
    geolocation?: string;
    service_type: ServiceType;
    status: ServiceOrderStatus;
    scheduled_at?: string | null;
    completed_at?: string | null;
    required_materials?: Material[];
    created_at: string;

    // Digital Report Fields
    technical_report?: string;
    completed_by_customer?: string;
    photos_urls?: string[];
    
    // For relational queries
    customers?: Customer; 
    users?: User; 
    equipments?: Equipment;
}

export enum CampaignStatus {
    Agendada = 'agendada',
    Enviada = 'enviada',
    Falha = 'falha',
}

export interface Campaign {
    id: number;
    name: string;
    message: string;
    media_url?: string;
    media_type?: 'image' | 'video';
    target: string; // 'all' or customer_id as string
    scheduled_at: string;
    status: CampaignStatus;
    created_at: string;
}

export enum ContractStatus {
    Ativo = 'ativo',
    Inativo = 'inativo',
}

export interface Contract {
    id: number;
    name: string;
    customer_id: number;
    status: ContractStatus;
    start_date: string;
    end_date: string;
    frequency: 'mensal' | 'bimestral' | 'trimestral';
    created_at: string;
    
    // For relational queries
    customers?: Customer;
    equipments?: Equipment[];
}
