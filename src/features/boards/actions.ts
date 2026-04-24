"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createBoard(title: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("boards")
    .insert([
      { 
        title, 
        user_id: user.id 
      }
    ])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/boards");
  return { data };
}

export async function renameBoard(id: string, newTitle: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("boards")
    .update({ title: newTitle })
    .eq("id", id)
    .eq("user_id", user.id); // Double checking ownership before update

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/boards");
  revalidatePath(`/boards/${id}`);
  return { success: true };
}

export async function deleteBoard(id: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("boards")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return { error: error.message };
  }

  // Because of 'ON DELETE CASCADE' in our schema, all columns and cards 
  // associated with this board will automatically be deleted by the database.

  revalidatePath("/boards");
  return { success: true };
}
