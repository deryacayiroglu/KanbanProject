"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, MoreHorizontal, Loader2, Trash2, Edit2, AlignLeft, GripHorizontal, Filter, X } from "lucide-react";
import { Column } from "../types";
import { Card } from "@/features/cards/types";
import { createColumn, deleteColumn, renameColumn, moveColumn } from "../actions";
import { createCard, updateCardPositions, moveCard } from "@/features/cards/actions";
import { CardModal } from "@/features/cards/components/CardModal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SortableCard } from "@/features/cards/components/SortableCard";
import { AVAILABLE_LABELS, parseLabels } from "@/features/cards/labels";
import { BoardHeader } from "@/features/boards/components/BoardHeader";

import {
  DndContext,
  closestCenter,
  pointerWithin,
  CollisionDetection,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  useDroppable,
  DragOverlay,
  DropAnimation,
  defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  useSortable,
  defaultAnimateLayoutChanges
} from '@dnd-kit/sortable';
import { CSS } from "@dnd-kit/utilities";

function SortableColumnWrapper({ column, children }: { column: Column, children: (dragHandleProps: any) => React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: { type: 'Column' },
    // Completely disable dnd-kit layout animations for columns
    animateLayoutChanges: () => false
  });

  const wasDraggingRef = useRef(false);
  if (isDragging) {
    wasDraggingRef.current = true;
  }

  useEffect(() => {
    if (!isDragging && wasDraggingRef.current) {
      const timeout = setTimeout(() => {
        wasDraggingRef.current = false;
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [isDragging]);

  const isJustDropped = !isDragging && wasDraggingRef.current;

  const style = {
    // Ignore transform when dragging because the DOM node is actively moving via onDragOver arrayMove!
    transform: (isJustDropped || isDragging) ? undefined : CSS.Transform.toString(transform),
    transition: isJustDropped ? 'none' : transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`shrink-0 w-72 mr-4 max-h-full flex flex-col bg-gray-100/80 border border-gray-200 rounded-xl shadow-sm relative ${isDragging ? 'ring-2 ring-blue-500/50 z-50' : ''}`}>
      {children({ attributes, listeners })}
    </div>
  );
}

// Droppable wrapper to allow dropping into empty columns
function DroppableColumn({ id, children }: { id: string, children: React.ReactNode }) {
  const { setNodeRef } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className="flex-1 overflow-y-auto px-3 py-1 space-y-2.5 min-h-[40px]">
      {children}
    </div>
  );
}

// Visual overlay card during drag
function CardPreview({ card }: { card: Card }) {
  return (
    <div className="bg-white p-3 rounded-lg shadow-xl border border-blue-500 ring-2 ring-blue-500/20 cursor-grabbing opacity-90 rotate-2 w-[264px]">
      <p className="text-sm font-medium text-gray-900 leading-snug break-words">{card.title}</p>
      {card.description && (
        <div className="mt-2 text-gray-400 flex items-center">
          <AlignLeft className="w-3.5 h-3.5" />
        </div>
      )}
    </div>
  );
}

const dropAnimationConfig: DropAnimation = {
  duration: 35,
  easing: "cubic-bezier(0.16, 1, 0.3, 1)",
  sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }),
};

export function BoardCanvas({ boardId, boardTitle, columns, cards = [] }: { boardId: string; boardTitle: string; columns: Column[]; cards?: Card[] }) {
  // Column State
  const [isCreatingCol, setIsCreatingCol] = useState(false);
  const [isSubmittingCol, setIsSubmittingCol] = useState(false);
  const [errorMsgCol, setErrorMsgCol] = useState<string | null>(null);
  const [editingColId, setEditingColId] = useState<string | null>(null);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [deletingColId, setDeletingColId] = useState<string | null>(null);
  const [confirmDeleteColId, setConfirmDeleteColId] = useState<string | null>(null);

  // Card State
  const [creatingCardIn, setCreatingCardIn] = useState<string | null>(null);
  const [isSubmittingCard, setIsSubmittingCard] = useState(false);
  const [activeCard, setActiveCard] = useState<Card | null>(null);

  // Focus Refs
  const addCardTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const addColInputRef = useRef<HTMLInputElement | null>(null);
  const editColInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!creatingCardIn) return;
    let timeoutId: NodeJS.Timeout;
    const frame = requestAnimationFrame(() => {
      const el = addCardTextareaRef.current;
      if (!el) return;
      el.focus();
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      timeoutId = setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      }, 150);
    });
    return () => { cancelAnimationFrame(frame); clearTimeout(timeoutId); };
  }, [creatingCardIn]);

  useEffect(() => {
    if (!isCreatingCol) return;
    let timeoutId: NodeJS.Timeout;
    const frame = requestAnimationFrame(() => {
      const el = addColInputRef.current;
      if (!el) return;
      el.focus();
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      timeoutId = setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      }, 150);
    });
    return () => { cancelAnimationFrame(frame); clearTimeout(timeoutId); };
  }, [isCreatingCol]);

  useEffect(() => {
    if (!editingColId) return;
    let timeoutId: NodeJS.Timeout;
    const frame = requestAnimationFrame(() => {
      const el = editColInputRef.current;
      if (!el) return;
      el.focus();
      el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      timeoutId = setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "center", inline: "nearest" });
      }, 150);
    });
    return () => { cancelAnimationFrame(frame); clearTimeout(timeoutId); };
  }, [editingColId]);

  // Drag State
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [settlingCardId, setSettlingCardId] = useState<string | null>(null);

  // Filter State
  const [filterLabels, setFilterLabels] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Local optimistic state for cards
  const [localCards, setLocalCards] = useState<Card[]>(cards);

  // Local optimistic state for columns
  const [localColumns, setLocalColumns] = useState<Column[]>([...columns].sort((a, b) => a.position - b.position));
  const localColumnsRef = useRef<Column[]>(localColumns);

  useEffect(() => {
    localColumnsRef.current = localColumns;
  }, [localColumns]);

  useEffect(() => {
    setLocalCards(cards);
  }, [cards]);

  useEffect(() => {
    setLocalColumns([...columns].sort((a, b) => a.position - b.position));
  }, [columns]);

  const cardsByColumn = localColumns.reduce((acc, col) => {
    let colCards = localCards.filter(c => c.column_id === col.id).sort((a, b) => a.position - b.position);
    
    if (filterLabels.length > 0) {
      colCards = colCards.filter(c => {
        const cLabels = parseLabels(c.label);
        return filterLabels.some(lbl => cLabels.includes(lbl));
      });
    }
    
    acc[col.id] = colCards;
    return acc;
  }, {} as Record<string, Card[]>);

  // DnD Sensors
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 8,
      },
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // --- COLUMN LOGIC ---
  async function handleCreateCol(formData: FormData) {
    const title = formData.get("title") as string;
    if (!title || !title.trim()) { setErrorMsgCol("List title required"); return; }
    if (title.trim().length > 50) { setErrorMsgCol("Max 50 characters"); return; }
    setIsSubmittingCol(true); setErrorMsgCol(null);
    const result = await createColumn(boardId, title.trim());
    setIsSubmittingCol(false);
    if (result?.error) setErrorMsgCol(result.error);
    else setIsCreatingCol(false);
  }

  async function handleRenameCol(title: string, colId: string) {
    if (!title || !title.trim() || title.trim().length > 50) { setEditingColId(null); return; }
    setIsSubmittingCol(true);
    const result = await renameColumn(colId, title.trim(), boardId);
    setIsSubmittingCol(false);
    if (result?.error) alert(result.error);
    else setEditingColId(null);
  }

  function handleDeleteCol(colId: string) {
    setConfirmDeleteColId(colId);
  }

  async function handleConfirmDeleteCol() {
    if (!confirmDeleteColId) return;
    const colId = confirmDeleteColId;
    setDeletingColId(colId);
    const result = await deleteColumn(colId, boardId);
    setDeletingColId(null);
    if (result?.error) alert(result.error);
    else setMenuOpenId(null);
    setConfirmDeleteColId(null);
  }

  // --- CARD LOGIC ---
  async function handleCreateCard(formData: FormData, colId: string) {
    const title = formData.get("title") as string;
    if (!title || !title.trim() || title.trim().length > 80) return;

    setIsSubmittingCard(true);
    const result = await createCard(colId, boardId, title.trim());
    setIsSubmittingCard(false);

    if (result?.error) alert(result.error);
    else setCreatingCardIn(null);
  }

  // --- DRAG LOGIC ---
  function handleDragStart(event: DragStartEvent) {
    setActiveDragId(event.active.id as string);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const isActiveColumn = active.data.current?.type === 'Column';
    if (isActiveColumn) {
      setLocalColumns((items) => {
        const activeIndex = items.findIndex(c => c.id === activeId);
        const overIndex = items.findIndex(c => c.id === overId);
        
        if (activeIndex !== -1 && overIndex !== -1 && activeIndex !== overIndex) {
          return arrayMove(items, activeIndex, overIndex);
        }
        return items;
      });
      return;
    }

    setLocalCards((items) => {
      const activeCard = items.find(c => c.id === activeId);
      const overCard = items.find(c => c.id === overId);

      if (!activeCard) return items;

      const activeColId = activeCard.column_id;
      const overColId = overCard ? overCard.column_id : columns.find(c => c.id === overId)?.id;

      if (!overColId || activeColId === overColId) return items;

      // Cross-column drag over: change column and compute a rough position to make it snap visually
      const newItems = [...items];
      const activeIndex = newItems.findIndex(c => c.id === activeId);
      const activeItem = { ...newItems[activeIndex], column_id: overColId };

      const targetColCards = newItems.filter(c => c.column_id === overColId && c.id !== activeId).sort((a, b) => a.position - b.position);

      let overIndex = targetColCards.length;
      if (overCard) {
        overIndex = targetColCards.findIndex(c => c.id === overId);
        const isBelowOverItem = over && active.rect.current.translated && active.rect.current.translated.top > over.rect.top + over.rect.height / 2;
        const modifier = isBelowOverItem ? 1 : 0;
        overIndex = overIndex >= 0 ? overIndex + modifier : targetColCards.length;
      }

      let newPos = 100;
      if (targetColCards.length === 0) {
        newPos = 100;
      } else if (overIndex <= 0) {
        newPos = targetColCards[0].position / 2;
      } else if (overIndex >= targetColCards.length) {
        newPos = targetColCards[targetColCards.length - 1].position + 100;
      } else {
        newPos = (targetColCards[overIndex - 1].position + targetColCards[overIndex].position) / 2;
      }

      activeItem.position = newPos;
      newItems[activeIndex] = activeItem;

      return newItems;
    });
  }

  function handleDragCancel() {
    setActiveDragId(null);
    setSettlingCardId(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveDragId(null);
    const { active, over } = event;

    if (!active || !over) return;

    const isActiveColumn = active.data.current?.type === 'Column';

    if (isActiveColumn) {
      const activeId = active.id as string;
      const overId = over.id as string;
      
      const finalItems = localColumnsRef.current;
      const newIndex = finalItems.findIndex(c => c.id === activeId);
      
      if (newIndex === -1) return;

      let newPosition = 100;
      if (finalItems.length === 1) {
        newPosition = 100;
      } else if (newIndex === 0) {
        newPosition = finalItems[1].position / 2;
      } else if (newIndex === finalItems.length - 1) {
        newPosition = finalItems[finalItems.length - 2].position + 100;
      } else {
        newPosition = (finalItems[newIndex - 1].position + finalItems[newIndex + 1].position) / 2;
      }

      const movedCol = { ...finalItems[newIndex], position: newPosition };
      
      const updatedItems = [...finalItems];
      updatedItems[newIndex] = movedCol;
      setLocalColumns(updatedItems);

      const needsRebalance = newPosition < 10 ||
        (newIndex > 0 && Math.abs(newPosition - finalItems[newIndex - 1].position) < 1) ||
        (newIndex < finalItems.length - 1 && Math.abs(finalItems[newIndex + 1].position - newPosition) < 1);

      if (needsRebalance) {
        const rebalancedItems = updatedItems.map((col, idx) => ({ ...col, position: (idx + 1) * 100 }));
        setLocalColumns(rebalancedItems);
        import('@/features/columns/actions').then(({ updateColumnPositions }) => {
          updateColumnPositions(rebalancedItems.map(c => ({ id: c.id, position: c.position })), boardId);
        });
      } else {
        moveColumn(movedCol.id, newPosition, boardId).then((result) => {
          if (result?.error) {
            console.error("Failed to move column:", result.error);
            setLocalColumns([...columns].sort((a, b) => a.position - b.position));
          }
        });
      }

      return;
    }

    setSettlingCardId(active.id as string);
    // Use 40ms to tightly match the new snappy 35ms drop animation duration
    setTimeout(() => setSettlingCardId(null), 40);

    const activeId = active.id as string;
    const overId = over.id as string;

    const items = [...localCards];
    const activeCard = items.find(c => c.id === activeId);
    if (!activeCard) return;

    const overCard = items.find(c => c.id === overId);
    const targetColId = overCard ? overCard.column_id : columns.find(c => c.id === overId)?.id || activeCard.column_id;

    let finalItems = [...items];

    // Ensure activeCard is in the right column
    const activeItemIndex = finalItems.findIndex(c => c.id === activeId);
    if (finalItems[activeItemIndex].column_id !== targetColId) {
      finalItems[activeItemIndex] = { ...finalItems[activeItemIndex], column_id: targetColId };
    }

    let targetColCards = finalItems.filter(c => c.column_id === targetColId).sort((a, b) => a.position - b.position);

    if (overCard && activeId !== overId) {
      const oldIndex = targetColCards.findIndex(c => c.id === activeId);
      const newIndex = targetColCards.findIndex(c => c.id === overId);
      targetColCards = arrayMove(targetColCards, oldIndex, newIndex);
    } else if (!overCard) {
      // Dropped on empty column
      const oldIndex = targetColCards.findIndex(c => c.id === activeId);
      targetColCards = arrayMove(targetColCards, oldIndex, targetColCards.length - 1);
    }

    const newCardIndex = targetColCards.findIndex(c => c.id === activeId);

    let newPosition = 100;
    if (targetColCards.length === 1) {
      newPosition = 100;
    } else if (newCardIndex === 0) {
      newPosition = targetColCards[1].position / 2;
    } else if (newCardIndex === targetColCards.length - 1) {
      newPosition = targetColCards[targetColCards.length - 2].position + 100;
    } else {
      newPosition = (targetColCards[newCardIndex - 1].position + targetColCards[newCardIndex + 1].position) / 2;
    }

    const movedCard = { ...finalItems[activeItemIndex], position: newPosition };
    finalItems[activeItemIndex] = movedCard;
    targetColCards[newCardIndex] = movedCard;

    const needsRebalance = newPosition < 10 ||
      (newCardIndex > 0 && Math.abs(newPosition - targetColCards[newCardIndex - 1].position) < 1) ||
      (newCardIndex < targetColCards.length - 1 && Math.abs(targetColCards[newCardIndex + 1].position - newPosition) < 1);

    if (needsRebalance) {
      const rebalanced = targetColCards.map((c, idx) => ({ ...c, position: (idx + 1) * 100 }));
      rebalanced.forEach(rc => {
        const idx = finalItems.findIndex(c => c.id === rc.id);
        if (idx !== -1) finalItems[idx] = rc;
      });
      
      setLocalCards(finalItems);
      
      import('@/features/cards/actions').then(({ updateCardPositions, moveCard }) => {
        moveCard(movedCard.id, targetColId, rebalanced[newCardIndex].position, boardId).then(() => {
          updateCardPositions(rebalanced.map(c => ({ id: c.id, position: c.position })), boardId);
        });
      });
    } else {
      const previousState = [...items];
      setLocalCards(finalItems);
      
      moveCard(movedCard.id, targetColId, newPosition, boardId).then((result) => {
        if (result?.error) {
          console.error("Failed to move card:", result.error);
          setLocalCards(previousState);
        }
      });
    }
  }

  const activeDragCard = activeDragId ? localCards.find(c => c.id === activeDragId) : null;

  const customCollisionDetection: CollisionDetection = (args) => {
    // When dragging a column, completely ignore cards for collision detection.
    // Use pointerWithin to prevent infinite loops when mutating localColumns in onDragOver
    if (activeDragId && localColumns.some(c => c.id === activeDragId)) {
      const columnContainers = args.droppableContainers.filter(
        (container) => container.data.current?.type === 'Column'
      );
      return pointerWithin({
        ...args,
        droppableContainers: columnContainers,
      });
    }
    return closestCenter(args);
  };

  return (
    <>
      {activeCard && (
        <CardModal card={activeCard} boardId={boardId} onClose={() => setActiveCard(null)} />
      )}

      <BoardHeader boardId={boardId} initialTitle={boardTitle}>
        <div className="flex items-center gap-2">
          {isFilterOpen && (
            <div className="fixed inset-0 z-40" onClick={() => setIsFilterOpen(false)} />
          )}
          <div className={`relative ${isFilterOpen ? 'z-50' : ''}`}>
            <button
              onClick={() => {
                setMenuOpenId(null);
                setIsFilterOpen(!isFilterOpen);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                isFilterOpen || filterLabels.length > 0
                  ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50 shadow-sm'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filter {filterLabels.length > 0 && !isFilterOpen ? `(${filterLabels.length})` : ''}
            </button>
            
            {/* Filter Panel Dropdown */}
            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 p-3 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Filter by labels</div>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_LABELS.map(lbl => {
                    const isActive = filterLabels.includes(lbl.id);
                    return (
                      <button
                        key={lbl.id}
                        onClick={() => {
                          if (isActive) setFilterLabels(prev => prev.filter(id => id !== lbl.id));
                          else setFilterLabels(prev => [...prev, lbl.id]);
                        }}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors flex-1 min-w-[45%] ${
                          isActive ? 'bg-gray-800 text-white border-gray-800' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full shrink-0 ${lbl.color.split(' ')[0]}`} />
                        <span className="truncate">{lbl.name}</span>
                      </button>
                    );
                  })}
                </div>
                {filterLabels.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between">
                    <span className="text-xs text-gray-400">
                      {filterLabels.length} active
                    </span>
                    <button
                      onClick={() => setFilterLabels([])}
                      className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors"
                    >
                      <X className="w-3 h-3" />
                      Clear
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          
          {!isFilterOpen && filterLabels.length > 0 && (
            <button
              onClick={() => setFilterLabels([])}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
              Clear
            </button>
          )}
        </div>
      </BoardHeader>

      <DndContext
        sensors={sensors}
        collisionDetection={customCollisionDetection}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 flex items-start">
          <SortableContext
            items={localColumns.map(c => c.id)}
            strategy={horizontalListSortingStrategy}
          >
            {localColumns.map((column) => (
              <SortableColumnWrapper key={column.id} column={column}>
                {({ attributes, listeners }) => (
                  <>
                    {/* Column Header */}
                    <div className="p-3 pb-2 flex items-center justify-between group">
                      <div className="flex items-center flex-1 truncate mr-2">
                        <button
                          {...attributes}
                          {...listeners}
                          className="mr-1.5 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing focus:outline-none"
                        >
                          <GripHorizontal className="w-4 h-4" />
                        </button>
                        {editingColId === column.id ? (
                          <input
                            ref={(el) => {
                              if (editingColId === column.id) {
                                editColInputRef.current = el;
                              }
                            }}
                            type="text"
                            defaultValue={column.title}
                            disabled={isSubmittingCol}
                            maxLength={50}
                            onBlur={(e) => handleRenameCol(e.target.value, column.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") e.currentTarget.blur();
                              else if (e.key === "Escape") setEditingColId(null);
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
                      </div>

                      <div className="relative ml-2">
                        <button
                          onClick={() => {
                            setIsFilterOpen(false);
                            setMenuOpenId(menuOpenId === column.id ? null : column.id);
                          }}
                          className={`p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors focus:outline-none relative ${menuOpenId === column.id ? 'z-50' : ''}`}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>

                        {menuOpenId === column.id && (
                          <>
                            <div className="fixed inset-0 z-40 cursor-default" onClick={() => setMenuOpenId(null)} />
                            <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 shadow-md rounded-lg z-50 py-1 overflow-hidden">
                              <button
                                onClick={() => { setEditingColId(column.id); setMenuOpenId(null); }}
                                className="w-full text-left px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 flex items-center gap-2 transition-colors"
                              >
                                <Edit2 className="w-3 h-3" /> Rename list
                              </button>
                              <button
                                onClick={() => handleDeleteCol(column.id)}
                                disabled={deletingColId === column.id}
                                className="w-full text-left px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors disabled:opacity-50"
                              >
                                {deletingColId === column.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                                Delete list
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Cards Area with Droppable Column Wrapper */}
                    <DroppableColumn id={column.id}>
                      <SortableContext
                        items={cardsByColumn[column.id]?.map(c => c.id) || []}
                        strategy={verticalListSortingStrategy}
                      >
                        {cardsByColumn[column.id]?.map((card) => (
                          <SortableCard
                            key={card.id}
                            card={card}
                            isSettling={card.id === settlingCardId}
                            onClick={() => setActiveCard(card)}
                          />
                        ))}
                      </SortableContext>

                      {/* Inline Card Creation */}
                      {creatingCardIn === column.id && (
                        <form action={(f) => handleCreateCard(f, column.id)} className="bg-white rounded-lg shadow-sm border border-blue-500 overflow-hidden mt-2">
                          <textarea
                            ref={(el) => {
                              if (creatingCardIn === column.id) {
                                addCardTextareaRef.current = el;
                              }
                            }}
                            name="title"
                            disabled={isSubmittingCard}
                            maxLength={80}
                            placeholder="Enter a title for this card..."
                            className="w-full text-sm outline-none resize-none bg-transparent p-3 pb-0 text-gray-900 placeholder-gray-400"
                            rows={3}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                e.currentTarget.form?.requestSubmit();
                              } else if (e.key === "Escape") {
                                setCreatingCardIn(null);
                              }
                            }}
                          />
                          <div className="flex gap-1.5 p-2 pt-1">
                            <button type="submit" disabled={isSubmittingCard} className="text-xs font-medium bg-blue-600 text-white px-3 py-1.5 rounded-md flex items-center gap-1 hover:bg-blue-700 transition-colors disabled:opacity-50">
                              {isSubmittingCard && <Loader2 className="w-3 h-3 animate-spin" />} Add
                            </button>
                            <button type="button" onClick={() => setCreatingCardIn(null)} disabled={isSubmittingCard} className="text-xs font-medium text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50">
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </DroppableColumn>

                    {/* Add Card Footer */}
                    <div className="p-3 pt-2 border-t border-gray-200/50">
                      {creatingCardIn !== column.id && (
                        <button
                          onClick={() => setCreatingCardIn(column.id)}
                          className="w-full flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 hover:bg-gray-200 p-2 rounded-lg transition-colors font-medium focus:outline-none"
                        >
                          <Plus className="w-4 h-4" />
                          Add a card
                        </button>
                      )}
                    </div>
                  </>
                )}
              </SortableColumnWrapper>
            ))}
          </SortableContext>

          {/* Create New Column UI */}
          {isCreatingCol ? (
            <form action={handleCreateCol} className="shrink-0 w-72 bg-white border border-gray-300 rounded-xl p-2 shadow-sm">
              <input
                ref={(el) => {
                  if (isCreatingCol) {
                    addColInputRef.current = el;
                  }
                }}
                type="text"
                name="title"
                disabled={isSubmittingCol}
                maxLength={50}
                placeholder="List title..."
                className="w-full text-sm outline-none font-medium text-gray-900 bg-gray-50 border border-gray-200 rounded-lg p-2.5 mb-2 focus:bg-white focus:border-blue-500 disabled:opacity-50 transition-colors"
              />
              {errorMsgCol && <p className="text-[10px] font-medium text-red-500 mb-2 px-1">{errorMsgCol}</p>}
              <div className="flex gap-1.5">
                <button
                  type="submit"
                  disabled={isSubmittingCol}
                  className="text-xs font-medium bg-gray-900 text-white px-3 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50 flex items-center gap-1 transition-colors"
                >
                  {isSubmittingCol && <Loader2 className="w-3 h-3 animate-spin" />} Add list
                </button>
                <button
                  type="button"
                  onClick={() => { setIsCreatingCol(false); setErrorMsgCol(null); }}
                  disabled={isSubmittingCol}
                  className="text-xs font-medium text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md hover:bg-gray-100 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsCreatingCol(true)}
              className="shrink-0 w-72 h-12 flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-200/50 border border-dashed border-gray-300 hover:border-gray-400 rounded-xl px-4 transition-colors focus:outline-none shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Add another list
            </button>
          )}
        </div>

        {/* Render the dragged card over everything else */}
        <DragOverlay dropAnimation={dropAnimationConfig}>
          {activeDragCard ? <CardPreview card={activeDragCard} /> : null}
        </DragOverlay>
      </DndContext>

      <ConfirmDialog
        open={!!confirmDeleteColId}
        onCancel={() => setConfirmDeleteColId(null)}
        onConfirm={handleConfirmDeleteCol}
        title="Delete list?"
        description="This action cannot be undone. All cards inside this list will be permanently deleted."
        confirmLabel="Delete list"
        isLoading={!!deletingColId}
      />
    </>
  );
}
