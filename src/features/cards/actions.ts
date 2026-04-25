"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createCard(columnId: string, boardId: string, title: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Calculate position: Put new card at the bottom of the list
  const { data: existingCards } = await supabase
    .from("cards")
    .select("position")
    .eq("column_id", columnId)
    .order("position", { ascending: false })
    .limit(1);

  const newPosition = existingCards && existingCards.length > 0 
    ? existingCards[0].position + 100 
    : 100;

  const { error } = await supabase
    .from("cards")
    .insert([{ column_id: columnId, title, position: newPosition }]);

  if (error) return { error: error.message };

  revalidatePath(`/boards/${boardId}`);
  return { success: true };
}

export async function updateCard(cardId: string, boardId: string, payload: { title?: string; description?: string | null }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("cards")
    .update(payload)
    .eq("id", cardId);

  if (error) return { error: error.message };

  revalidatePath(`/boards/${boardId}`);
  return { success: true };
}

export async function deleteCard(cardId: string, boardId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("cards")
    .delete()
    .eq("id", cardId);

  if (error) return { error: error.message };

  revalidatePath(`/boards/${boardId}`);
  return { success: true };
}

export async function updateCardPositions(updates: { id: string, position: number }[], boardId: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { error: "Unauthorized" };

  // Loop through updates and fire Promises concurrently
  const promises = updates.map(update => 
    supabase.from("cards").update({ position: update.position }).eq("id", update.id)
  );
  
  await Promise.all(promises);

  revalidatePath(`/boards/${boardId}`);
  return { success: true };
}
