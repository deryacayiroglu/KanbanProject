import { useEffect, useRef } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card } from "../types";
import { AlignLeft } from "lucide-react";
import { AVAILABLE_LABELS, parseLabels } from "../labels";

export function SortableCard({ card, onClick, isSettling }: { card: Card, onClick: () => void, isSettling?: boolean }) {
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
    zIndex: isDragging ? 100 : "auto",
    touchAction: "pan-y",
  };

  const wasDraggingRef = useRef(false);

  useEffect(() => {
    if (isDragging) {
      wasDraggingRef.current = true;
    } else if (wasDraggingRef.current) {
      const timeout = setTimeout(() => {
        wasDraggingRef.current = false;
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [isDragging]);

  const handleClick = (e: React.MouseEvent) => {
    if (wasDraggingRef.current) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    onClick();
  };

  const isHidden = isDragging || isSettling;
  const cardLabels = parseLabels(card.label);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClickCapture={handleClick}
      className={`bg-white p-3 rounded-lg shadow-sm border border-gray-200 cursor-grab active:cursor-grabbing active:bg-blue-50 active:border-blue-300 active:shadow-md transition-colors duration-200 hover:border-blue-300 hover:shadow group relative flex flex-col ${isHidden ? 'opacity-0' : ''}`}
    >
      {cardLabels.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {cardLabels.map(id => {
            const labelDef = AVAILABLE_LABELS.find(l => l.id === id);
            if (!labelDef) return null;
            return (
              <span 
                key={id} 
                className={`h-2.5 w-2.5 rounded-full shadow-sm transition-transform hover:scale-125 cursor-default ${labelDef.color.split(' ')[0]}`} 
                title={labelDef.name}
              />
            );
          })}
        </div>
      )}
      <p className="text-sm font-medium text-gray-900 leading-snug break-words">{card.title}</p>
      {card.description && (
        <div className="mt-2 text-gray-400 flex items-center">
          <AlignLeft className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
}
