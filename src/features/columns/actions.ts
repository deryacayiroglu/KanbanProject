"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createColumn(boardId: string, title: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // 1. Get the highest position value currently in the board
  const { data: existingCols, error: fetchError } = await supabase
    .from("columns")
    .select("position")
    .eq("board_id", boardId)
    .order("position", { ascending: false })
    .limit(1);

  if (fetchError) return { error: fetchError.message };

  // 2. Calculate new position (add 100 to the max, or start at 100)
  const newPosition = existingCols && existingCols.length > 0 
    ? existingCols[0].position + 100 
    : 100;

  // 3. Insert the new column
  const { error: insertError } = await supabase
    .from("columns")
    .insert([{ board_id: boardId, title, position: newPosition }]);

  if (insertError) return { error: insertError.message };

  revalidatePath(`/boards/${boardId}`);
  return { success: true };
}

export async function renameColumn(columnId: string, title: string, boardId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // RLS natively protects against unauthorized modification!
  const { error } = await supabase
    .from("columns")
    .update({ title })
    .eq("id", columnId);

  if (error) return { error: error.message };

  revalidatePath(`/boards/${boardId}`);
  return { success: true };
}

export async function deleteColumn(columnId: string, boardId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { data, error } = await supabase
    .from("columns")
    .delete()
    .eq("id", columnId)
    .select();

  if (error) {
    console.error("Supabase Delete Error:", error.message);
    return { error: error.message };
  }

  if (!data || data.length === 0) {
    return { error: "Failed to delete. The column may not exist, or an RLS policy is blocking the delete operation." };
  }

  revalidatePath(`/boards/${boardId}`);
  return { success: true };
}
