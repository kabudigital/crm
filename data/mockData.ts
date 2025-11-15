import { User, Customer, ServiceOrder, UserRole, ServiceOrderStatus, ServiceType, Equipment } from '../types';

export const mockUsers: User[] = [
  { id: 1, name: 'Alice Admin', email: 'admin@demo.com', role: UserRole.Admin, password: 'password' },
  { id: 2, name: 'Bob Supervisor', email: 'supervisor@demo.com', role: UserRole.Supervisor, password: 'password' },
  { id: 3, name: 'Charlie Técnico', email: 'tech@demo.com', role: UserRole.Technician, phone: '(11) 98765-4321', password: 'password' },
  { id: 4, name: 'Diana Técnica', email: 'diana@demo.com', role: UserRole.Technician, phone: '(21) 91234-5678', password: 'password' },
];

export const mockCustomers: Customer[] = [
  { id: 1, name: 'Shopping Center Norte', cnpj_cpf: '12.345.678/0001-99', address: 'Tv. Casalbuono, 120 - Vila Guilherme, São Paulo', contact_name: 'Gerente Predial', contact_email: 'gerencia@norte.com', contact_phone: '(11) 2224-5959' },
  { id: 2, name: 'Edifício Copan', cnpj_cpf: '98.765.432/0001-11', address: 'Av. Ipiranga, 200 - Centro Histórico de São Paulo', contact_name: 'Síndico Responsável', contact_email: 'sindico@copan.com', contact_phone: '(11) 3259-5917' },
  { id: 3, name: 'Padaria Bela Paulista', cnpj_cpf: '45.678.912/0001-33', address: 'R. Haddock Lobo, 354 - Cerqueira César, São Paulo', contact_name: 'Sr. Manuel', contact_email: 'contato@belapaulista.com', contact_phone: '(11) 3218-2400' },
];

export const mockEquipments: Equipment[] = [
    { id: 1, customer_id: 1, name: 'Ar Condicionado Central - Praça de Alimentação', brand: 'Carrier', model: 'X-1000', serial_number: 'SN12345' },
    { id: 2, customer_id: 2, name: 'Split Corredor Bloco A', brand: 'LG', model: 'Dual Inverter', serial_number: 'SN67890' },
    { id: 3, customer_id: 3, name: 'Refrigerador Balcão', brand: 'Metalfrio', model: 'VB40', serial_number: 'SN54321' },
    { id: 4, customer_id: 1, name: 'Split Loja C&A', brand: 'Daikin', model: 'Eco-Plus', serial_number: 'SN09876' }
];

export const mockServiceOrders: ServiceOrder[] = [
  { 
    id: 101, 
    customer_id: 1,
    equipment_id: 1,
    technician_id: 3,
    reported_problem: 'Ar condicionado da praça de alimentação não está gelando o suficiente.', 
    service_type: ServiceType.Corretiva, 
    status: ServiceOrderStatus.EmExecucao, 
    created_at: '2024-07-29T10:00:00Z',
    scheduled_at: '2024-07-29T14:00:00Z',
  },
  { 
    id: 102, 
    customer_id: 2,
    equipment_id: 2,
    technician_id: 4,
    reported_problem: 'Manutenção preventiva mensal nos splits do Bloco A.', 
    service_type: ServiceType.Preventiva, 
    status: ServiceOrderStatus.Agendada, 
    created_at: '2024-07-28T15:30:00Z',
    scheduled_at: '2024-08-05T09:00:00Z',
  },
  { 
    id: 103, 
    customer_id: 3,
    equipment_id: 3,
    technician_id: 3,
    reported_problem: 'Refrigerador do balcão fazendo barulho estranho.', 
    service_type: ServiceType.Corretiva, 
    status: ServiceOrderStatus.AguardandoPeca, 
    created_at: '2024-07-27T09:15:00Z',
    required_materials: ['Compressor Embraco EM200', 'Gás R134a'],
  },
  { 
    id: 104, 
    customer_id: 1,
    equipment_id: 4,
    technician_id: null,
    reported_problem: 'Orçamento para instalação de 3 novos aparelhos na expansão.', 
    service_type: ServiceType.Orcamento, 
    status: ServiceOrderStatus.AguardandoAgendamento, 
    created_at: '2024-07-26T18:00:00Z',
  },
  { 
    id: 105, 
    customer_id: 2,
    equipment_id: 2,
    technician_id: 4,
    reported_problem: 'Troca de filtro de ar do split do 5º andar.', 
    service_type: ServiceType.Preventiva, 
    status: ServiceOrderStatus.Concluida, 
    created_at: '2024-07-20T11:00:00Z',
    completed_at: '2024-07-22T14:30:00Z',
  },
  { 
    id: 106, 
    customer_id: 3,
    equipment_id: 3,
    technician_id: 3,
    reported_problem: 'Cliente cancelou visita para verificação de rotina.', 
    service_type: ServiceType.Preventiva, 
    status: ServiceOrderStatus.Cancelada, 
    created_at: '2024-07-19T16:00:00Z',
  }
];

// Helper to "join" data like Supabase would
export const getFullServiceOrders = () => {
    return mockServiceOrders.map(so => ({
        ...so,
        customers: mockCustomers.find(c => c.id === so.customer_id),
        users: mockUsers.find(u => u.id === so.technician_id),
        equipments: mockEquipments.find(e => e.id === so.equipment_id),
    })) as (ServiceOrder & { customers?: Customer, users?: User, equipments?: Equipment })[];
};