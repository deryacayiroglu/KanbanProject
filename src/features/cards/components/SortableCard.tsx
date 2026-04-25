import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "../types";
import { AlignLeft } from "lucide-react";

export function SortableCard({ card, onClick }: { card: Card, onClick: () => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : "auto",
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing hover:border-blue-300 hover:shadow transition-all group relative ${isDragging ? 'border-blue-500 shadow-md ring-2 ring-blue-500/20' : ''}`}
    >
      <p className="text-sm font-medium text-gray-900 leading-snug break-words">{card.title}</p>
      {card.description && (
        <div className="mt-2 text-gray-400 flex items-center">
          <AlignLeft className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
}
