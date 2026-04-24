"use client";

import { useState } from "react";
import Link from "next/link";
import { Board } from "../types";
import { createBoard, deleteBoard, renameBoard } from "../actions";
import { Edit2, Trash2, Plus } from "lucide-react";

export function BoardGrid({ boards }: { boards: Board[] }) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingBoardId, setEditingBoardId] = useState<string | null>(null);

  async function handleCreate(formData: FormData) {
    const title = formData.get("title") as string;
    if (!title.trim()) return;
    setIsCreating(false);
    await createBoard(title);
  }

  async function handleRename(formData: FormData) {
    const title = formData.get("title") as string;
    if (!title.trim() || !editingBoardId) return;
    const id = editingBoardId;
    setEditingBoardId(null);
    await renameBoard(id, title);
  }

  async function handleDelete(id: string) {
    if (confirm("Are you sure you want to delete this board? All lists and tasks will be permanently removed.")) {
      await deleteBoard(id);
    }
  }

  if (boards.length === 0 && !isCreating) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h2 className="text-lg font-medium text-gray-900 mb-1">No boards yet</h2>
        <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
          Create your first board to start tracking your tasks and projects.
        </p>
        <button 
          onClick={() => setIsCreating(true)}
          className="bg-gray-900 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900/20 shadow-sm"
        >
          Create your first board
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {/* Create Board Action */}
      {isCreating ? (
        <form action={handleCreate} className="h-32 rounded-xl bg-white border border-gray-300 p-5 shadow-sm flex flex-col justify-between">
          <input 
            type="text" 
            name="title" 
            autoFocus 
            placeholder="Board title..."
            className="w-full text-sm outline-none font-medium text-gray-900 placeholder-gray-400 bg-transparent"
          />
          <div className="flex gap-2 justify-end">
            <button 
              type="button" 
              onClick={() => setIsCreating(false)} 
              className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="text-xs font-medium bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-800 transition-colors"
            >
              Create
            </button>
          </div>
        </form>
      ) : (
        <button 
          onClick={() => setIsCreating(true)}
          className="h-32 rounded-xl bg-gray-50 border border-dashed border-gray-300 flex flex-col items-center justify-center text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors group"
        >
          <Plus className="w-6 h-6 mb-2 text-gray-400 group-hover:text-gray-600 transition-colors" />
          <span>Create new board</span>
        </button>
      )}

      {/* Render Boards */}
      {boards.map((board) => (
        <div 
          key={board.id} 
          className="relative group h-32 rounded-xl bg-white border border-gray-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
        >
          {editingBoardId === board.id ? (
            <form action={handleRename} className="flex flex-col h-full justify-between relative z-20">
              <input 
                type="text" 
                name="title" 
                defaultValue={board.title}
                autoFocus 
                className="w-full text-sm outline-none font-semibold text-gray-900 bg-transparent border-b border-blue-500 pb-1"
              />
              <div className="flex gap-2 justify-end">
                <button 
                  type="button" 
                  onClick={() => setEditingBoardId(null)} 
                  className="text-xs font-medium text-gray-500 hover:text-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </form>
          ) : (
            <>
              {/* Entire card is a clickable link, behind the buttons */}
              <Link href={`/boards/${board.id}`} className="absolute inset-0 z-0 rounded-xl" />
              
              <div className="relative z-10 flex items-start justify-between">
                <Link href={`/boards/${board.id}`} className="font-semibold text-gray-900 truncate pr-4 hover:underline">
                  {board.title}
                </Link>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditingBoardId(board.id); }}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors focus:outline-none"
                    title="Rename Board"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(board.id); }}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors focus:outline-none"
                    title="Delete Board"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              <p className="relative z-10 text-xs text-gray-400 mt-auto">
                Created {new Date(board.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
