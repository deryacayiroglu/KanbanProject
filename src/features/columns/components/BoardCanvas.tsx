"use client";

import { useState } from "react";
import { Plus, MoreHorizontal, Loader2, Trash2, Edit2 } from "lucide-react";
import { Column } from "../types";
import { createColumn, deleteColumn, renameColumn } from "../actions";

export function BoardCanvas({ boardId, columns }: { boardId: string; columns: Column[] }) {
  const [isCreating, setIsCreating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Track which column is being renamed or has its menu open
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleCreate(formData: FormData) {
    const title = formData.get("title") as string;
    
    if (!title || !title.trim()) {
      setErrorMsg("List title is required");
      return;
    }
    if (title.trim().length > 50) {
      setErrorMsg("Maximum 50 characters allowed");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    const result = await createColumn(boardId, title.trim());
    setIsSubmitting(false);

    if (result?.error) {
      setErrorMsg(result.error);
    } else {
      setIsCreating(false);
    }
  }

  async function handleRename(title: string, colId: string) {
    if (!title || !title.trim() || title.trim().length > 50) {
      setEditingColId(null);
      return;
    }

    setIsSubmitting(true);
    const result = await renameColumn(colId, title.trim(), boardId);
    setIsSubmitting(false);

    if (result?.error) {
      alert(result.error);
    } else {
      setEditingColId(null);
    }
  }

  async function handleDelete(colId: string) {
    if (confirm("Are you sure you want to delete this list? All cards inside will be permanently lost.")) {
      setDeletingId(colId);
      const result = await deleteColumn(colId, boardId);
      setDeletingId(null);
      if (result?.error) {
        alert(result.error);
      } else {
        setMenuOpenId(null);
      }
    }
  }

  return (
    <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 flex items-start gap-4">
      {columns.map((column) => (
        <div key={column.id} className="shrink-0 w-72 max-h-full flex flex-col bg-gray-100/80 border border-gray-200 rounded-xl shadow-sm relative">
          
          {/* Column Header */}
          <div className="p-3 pb-2 flex items-center justify-between group">
            {editingColId === column.id ? (
              <input 
                type="text" 
                defaultValue={column.title} 
                autoFocus
                disabled={isSubmitting}
                maxLength={50}
                onBlur={(e) => handleRename(e.target.value, column.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur();
                  } else if (e.key === "Escape") {
                    setEditingColId(null);
                  }
                }}
                className="w-full px-1.5 py-0.5 text-sm font-medium text-gray-900 bg-white border border-blue-500 rounded outline-none disabled:opacity-50"
              />
            ) : (
              <h3 
                onClick={() => setEditingColId(column.id)}
                className="font-medium text-sm text-gray-900 px-1.5 py-0.5 cursor-text flex-1 truncate"
                title="Click to rename"
              >
                {column.title}
              </h3>
            )}
            
            <div className="relative ml-2">
              <button 
                onClick={() => setMenuOpenId(menuOpenId === column.id ? null : column.id)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors focus:outline-none relative z-50"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              
              {/* Three-dot Dropdown Menu */}
              {menuOpenId === column.id && (
                <>
                  {/* Invisible Overlay to catch clicks outside the menu */}
                  <div 
                    className="fixed inset-0 z-40 cursor-default" 
                    onClick={() => setMenuOpenId(null)} 
                  />
                  
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 shadow-md rounded-lg z-50 py-1 overflow-hidden">
                    <button 
                    onClick={() => { setEditingColId(column.id); setMenuOpenId(null); }}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                  >
                    <Edit2 className="w-3 h-3" /> Rename list
                  </button>
                  <button 
                    onClick={() => handleDelete(column.id)}
                    disabled={deletingId === column.id}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors disabled:opacity-50"
                  >
                    {deletingId === column.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                    Delete list
                  </button>
                </div>
                </>
              )}
            </div>
          </div>
          
          {/* Cards Area (Empty Placeholder) */}
          <div className="flex-1 overflow-y-auto px-3 py-1 space-y-2 min-h-[40px]">
            {/* Future cards will be mapped here */}
          </div>

          {/* Add Card Footer */}
          <div className="p-3 pt-2">
            <button className="w-full flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-200 p-2 rounded-lg transition-colors font-medium focus:outline-none">
              <Plus className="w-4 h-4" />
              Add card
            </button>
          </div>
        </div>
      ))}
      
      {/* Create New Column UI */}
      {isCreating ? (
        <form action={handleCreate} className="shrink-0 w-72 bg-white border border-gray-300 rounded-xl p-2 shadow-sm">
          <input 
            type="text" 
            name="title" 
            autoFocus 
            disabled={isSubmitting}
            maxLength={50}
            placeholder="List title..."
            className="w-full text-sm outline-none font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-lg p-2.5 mb-2 focus:bg-white focus:border-blue-500 disabled:opacity-50 transition-colors"
          />
          {errorMsg && <p className="text-[10px] font-medium text-red-500 mb-2 px-1">{errorMsg}</p>}
          <div className="flex gap-1.5">
            <button 
              type="submit" 
              disabled={isSubmitting}
              className="text-xs font-medium bg-gray-900 text-white px-3 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50 flex items-center gap-1 transition-colors"
            >
              {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
              Add list
            </button>
            <button 
              type="button" 
              onClick={() => { setIsCreating(false); setErrorMsg(null); }}
              disabled={isSubmitting}
              className="text-xs font-medium text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button 
          onClick={() => setIsCreating(true)}
          className="shrink-0 w-72 h-12 flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 border border-dashed border-gray-300 hover:border-gray-400 rounded-xl px-4 transition-colors focus:outline-none shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add another list
        </button>
      )}
    </div>
  );
}
