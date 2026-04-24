import { createClient } from "@/lib/supabase/server";
import { Board } from "./types";

export async function getBoards(): Promise<Board[]> {
  const supabase = createClient();
  
  // Since RLS is enabled, this will securely fetch ONLY the current user's boards
  const { data: boards, error } = await supabase
    .from("boards")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching boards:", error.message);
    return [];
  }

  return boards as Board[];
}

export async function getBoardById(id: string): Promise<Board | null> {
  const supabase = createClient();
  
  const { data: board, error } = await supabase
    .from("boards")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Error fetching board by ID:", error.message);
    return null;
  }

  return board as Board;
}
