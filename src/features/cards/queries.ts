import { createClient } from "@/lib/supabase/server";
import { Card } from "./types";

export async function getCardsForBoard(boardId: string): Promise<Card[]> {
  const supabase = createClient();
  
  // First, get all columns for this board securely
  const { data: columns } = await supabase
    .from("columns")
    .select("id")
    .eq("board_id", boardId);
    
  if (!columns || columns.length === 0) return [];
  
  const columnIds = columns.map(c => c.id);

  // Then, fetch all cards that belong to those columns
  const { data: cards, error } = await supabase
    .from("cards")
    .select("*")
    .in("column_id", columnIds)
    .order("position", { ascending: true });

  if (error) {
    console.error("Error fetching cards:", error.message);
    return [];
  }

  return cards as Card[];
}
