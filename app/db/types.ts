export interface User {
  address: string;
  full_name?: string;
  avatar?: string;
  forecaster_id?: string;
  forecaster_nickname?: string;
  created_at: Date;
}

export interface Task {
  _id?: string;
  owner: string;
  title: string;
  description: string;
  asset: string;
  amount: number;
  deadline?: Date | null;
  executor: string | null;
  taken_at: Date | null;
  owner_approved: boolean;
  executor_approved: boolean;
  channel_id?: string; // <-- новое поле
  created_at: Date;
}
