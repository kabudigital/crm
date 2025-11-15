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
    capacity_btu?: number;
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
    technician_id?: number | null;
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
    mediaUrl?: string; // For preview
    mediaType?: 'image' | 'video';
    target: 'all' | number; // 'all' or customer_id
    scheduledAt: string;
    status: CampaignStatus;
    createdAt: string;
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
    equipment_ids: number[];
    // For relational queries
    customers?: Customer;
    equipments?: Equipment[];
}