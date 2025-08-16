export interface BankItem {
  id: number;
  bankName: string;
  logo: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

// Lista de bancos disponibles para seleccionar
export const availableBanks: BankItem[] = [
  {
    id: 1,
    bankName: "Banco de Chile",
    logo: "https://via.placeholder.com/150",
    status: "active",
    createdAt: "2021-01-01",
    updatedAt: "2021-01-01",
  },
  {
    id: 2,
    bankName: "Banco de Colombia",
    logo: "https://via.placeholder.com/151",
    status: "active",
    createdAt: "2021-01-01",
    updatedAt: "2021-01-01",
  },
  {
    id: 3,
    bankName: "Banco Santander",
    logo: "https://via.placeholder.com/152",
    status: "active",
    createdAt: "2021-01-01",
    updatedAt: "2021-01-01",
  },
  {
    id: 4,
    bankName: "BancoEstado",
    logo: "https://via.placeholder.com/153",
    status: "active",
    createdAt: "2021-01-01",
    updatedAt: "2021-01-01",
  },
];
