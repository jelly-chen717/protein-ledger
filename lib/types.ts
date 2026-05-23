export type ProteinRecord = {
  id: string;
  user_id: string;
  record_date: string;
  name: string;
  protein_g: number;
  created_at: string;
};

export type LedgerType = "income" | "expense";

export type LedgerRecord = {
  id: string;
  user_id: string;
  record_date: string;
  type: LedgerType;
  category: string;
  amount: number;
  note: string | null;
  created_at: string;
};
