export interface Board {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

export interface Column {
  id: string;
  board_id: string;
  title: string;
  position: number;
  created_at: string;
}
