export interface Card {
  id: string;
  column_id: string;
  title: string;
  description: string | null;
  position: number;
  label: string | null;
  created_at: string;
  updated_at: string;
}
