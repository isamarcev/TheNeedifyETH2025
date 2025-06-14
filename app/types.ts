export interface Task {
  _id: string;
  owner: string;
  title: string;
  description: string;
  asset: string;
  amount: number;
  deadline: string | null;
  executor: string | null;
  taken_at: string | null;
  owner_approved: boolean;
  executor_approved: boolean;
  category: string;
  created_at: string;
  channel_id?: string;
}
