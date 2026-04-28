import { notFound } from "next/navigation";
import nextDynamic from "next/dynamic";
import { getBoardById, getColumnsByBoardId } from "@/features/boards/queries";
import { getCardsForBoard } from "@/features/cards/queries";

const BoardCanvas = nextDynamic(
  () => import("@/features/columns/components/BoardCanvas").then((mod) => mod.BoardCanvas),
  { ssr: false }
);

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
      {/* Board Canvas Area - Interactive Client Component */}
      <BoardCanvas boardId={board.id} boardTitle={board.title} columns={columns as any} cards={cards as any} />
    </div>
  );
}
