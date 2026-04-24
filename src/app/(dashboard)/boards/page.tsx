import { getBoards } from "@/features/boards/queries";
import { BoardGrid } from "@/features/boards/components/BoardGrid";

// Opt out of static caching so this page always fetches fresh boards on load
export const dynamic = "force-dynamic";

export default async function BoardsPage() {
  const boards = await getBoards();

  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          My Boards
        </h1>
      </div>
      
      <BoardGrid boards={boards} />
    </div>
  );
}
