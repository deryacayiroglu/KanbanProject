"use client";

import { useState, useRef, useEffect } from "react";
import { MoreHorizontal, Loader2, Trash2, Edit2, AlertTriangle } from "lucide-react";
import { renameBoard, deleteBoard } from "../actions";
import { useRouter } from "next/navigation";

export function BoardHeader({ boardId, initialTitle }: { boardId: string, initialTitle: string }) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(initialTitle);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Menu and Modal state
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Handle click outside menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Move cursor to the end
      inputRef.current.setSelectionRange(inputRef.current.value.length, inputRef.current.value.length);
    }
  }, [isEditing]);

  async function handleSave() {
    const trimmedTitle = title.trim();
    if (!trimmedTitle || trimmedTitle === initialTitle) {
      setTitle(initialTitle);
      setIsEditing(false);
      return;
    }

    if (trimmedTitle.length > 50) {
      alert("Board name must be 50 characters or less.");
      setTitle(initialTitle);
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    const result = await renameBoard(boardId, trimmedTitle);
    setIsSaving(false);

    if (result.error) {
      alert(result.error);
      setTitle(initialTitle);
    } else {
      setTitle(trimmedTitle);
    }
    
    setIsEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleSave();
    } else if (e.key === "Escape") {
      setTitle(initialTitle);
      setIsEditing(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteBoard(boardId);
    
    if (result.error) {
      setIsDeleting(false);
      alert(result.error);
    } else {
      // Redirect to boards list
      router.push("/boards");
      router.refresh();
    }
  }

  return (
    <>
      <div className="h-14 px-6 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-2">
          {isEditing ? (
            <input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              disabled={isSaving}
              className="font-semibold text-gray-900 tracking-tight bg-gray-50 border border-blue-500 rounded px-2 py-0.5 outline-none w-64 disabled:opacity-50"
              maxLength={50}
            />
          ) : (
            <h1 
              onClick={() => setIsEditing(true)}
              className="font-semibold text-gray-900 tracking-tight cursor-text hover:bg-gray-100 px-2 py-0.5 rounded -ml-2 transition-colors inline-block min-w-[2rem]"
              title="Click to rename"
            >
              {title}
            </h1>
          )}
          {isSaving && <Loader2 className="w-4 h-4 text-gray-400 animate-spin" />}
        </div>
        
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`p-1.5 rounded-md transition-colors focus:outline-none ${isMenuOpen ? 'bg-gray-200 text-gray-900' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'}`}
          >
            <MoreHorizontal className="w-5 h-5" />
          </button>
          
          {isMenuOpen && (
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-in fade-in zoom-in-95 duration-100">
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsEditing(true);
                }}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 flex items-center gap-2 transition-colors"
              >
                <Edit2 className="w-4 h-4 text-gray-500" />
                Rename board
              </button>
              <div className="h-px bg-gray-200 my-1"></div>
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  setIsDeleteModalOpen(true);
                }}
                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700 flex items-center gap-2 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-red-500" />
                Delete board
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6">
              <div className="flex items-center gap-4 text-red-600 mb-4">
                <div className="p-3 bg-red-100 rounded-full">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Delete Board?</h3>
              </div>
              <p className="text-gray-600 text-sm mb-2">
                This action cannot be undone.
              </p>
              <p className="text-gray-600 text-sm font-medium">
                All columns and cards will be permanently deleted.
              </p>
            </div>
            <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isDeleting ? "Deleting..." : "Delete board"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
