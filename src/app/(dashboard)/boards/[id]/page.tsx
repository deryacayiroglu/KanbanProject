import { notFound } from "next/navigation";
import { getBoardById, getColumnsByBoardId } from "@/features/boards/queries";
import { getCardsForBoard } from "@/features/cards/queries";
import { MoreHorizontal } from "lucide-react";
import { BoardCanvas } from "@/features/columns/components/BoardCanvas";

// Opt out of static caching
export const dynamic = "force-dynamic";

export default async function BoardPage({ params }: { params: { id: string } }) {
  // Fetch board securely from server
  const board = await getBoardById(params.id);

  if (!board) {
    notFound();
  }

  // Fetch columns and cards simultaneously for better performance
  const [columns, cards] = await Promise.all([
    getColumnsByBoardId(board.id),
    getCardsForBoard(board.id)
  ]);

  return (
    <div className="h-[calc(100vh-4rem)] bg-gray-50 flex flex-col">
      {/* Board Header */}
      <div className="h-14 px-6 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm shrink-0">
        <h1 className="font-semibold text-gray-900 tracking-tight">
          {board.title}
        </h1>
        {/* Future board menu placeholder */}
        <button className="text-gray-400 hover:text-gray-600 transition-colors focus:outline-none">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Board Canvas Area - Interactive Client Component */}
      <BoardCanvas boardId={board.id} columns={columns as any} cards={cards as any} />
    </div>
  );
}
