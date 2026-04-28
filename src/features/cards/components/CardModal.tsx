"use client";

import { useState } from "react";
import { Loader2, Trash2, X } from "lucide-react";
import { Card } from "../types";
import { updateCard, deleteCard } from "../actions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

export function CardModal({ card, boardId, onClose }: { card: Card, boardId: string, onClose: () => void }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || "");
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleSave() {
    if (!title.trim()) return;
    setIsSubmitting(true);
    await updateCard(card.id, boardId, { 
      title: title.trim(), 
      description: description.trim() || null 
    });
    setIsSubmitting(false);
    onClose();
  }

  function handleDeleteClick() {
    setShowConfirmDelete(true);
  }

  async function handleConfirmDelete() {
    setIsDeleting(true);
    await deleteCard(card.id, boardId);
    setIsDeleting(false);
    setShowConfirmDelete(false);
    onClose();
  }

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-gray-100">
          <input 
            type="text" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            className="font-semibold text-xl text-gray-900 outline-none w-full bg-transparent border-b border-transparent focus:border-blue-500 transition-colors"
            maxLength={80}
            placeholder="Card title"
            autoFocus
          />
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg ml-3 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea 
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Add a more detailed description..."
            className="w-full text-sm outline-none border border-gray-200 rounded-xl p-4 bg-gray-50 focus:bg-white focus:border-blue-500 transition-colors min-h-[140px] resize-y"
          />
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button 
            onClick={handleDeleteClick}
            disabled={isSubmitting || isDeleting}
            className="text-sm font-medium text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" /> Delete
          </button>
          
          <div className="flex gap-2">
            <button 
              onClick={onClose}
              disabled={isSubmitting}
              className="text-sm font-medium text-gray-600 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleSave}
              disabled={isSubmitting || !title.trim()}
              className="text-sm font-medium bg-gray-900 text-white px-5 py-2 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center gap-2 shadow-sm"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Save changes
            </button>
          </div>
        </div>

      </div>

      <ConfirmDialog
        open={showConfirmDelete}
        onCancel={() => setShowConfirmDelete(false)}
        onConfirm={handleConfirmDelete}
        title="Delete card?"
        description="This action cannot be undone."
        confirmLabel="Delete card"
        isLoading={isDeleting}
      />
    </div>
  );
}
