import { notFound } from "next/navigation";
import { getBoardById, getColumnsByBoardId } from "@/features/boards/queries";
import { Plus, MoreHorizontal } from "lucide-react";

// Opt out of static caching
export const dynamic = "force-dynamic";

export default async function BoardPage({ params }: { params: { id: string } }) {
  // Fetch board and columns data securely from server
  const board = await getBoardById(params.id);

  if (!board) {
    notFound();
  }

  const columns = await getColumnsByBoardId(board.id);

  return (
    // We use calc(100vh - 64px) assuming the top navbar is ~64px tall (h-16). 
    // This allows the board to scroll horizontally without scrolling the whole page vertically.
    <div className="h-[calc(100vh-4rem)] bg-gray-50 flex flex-col">
      {/* Board Header */}
      <div className="h-14 px-6 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm shrink-0">
        <h1 className="font-semibold text-gray-900 tracking-tight">
          {board.title}
        </h1>
        {/* Future board menu placeholder */}
        <button className="text-gray-400 hover:text-gray-600 transition-colors">
          <MoreHorizontal className="w-5 h-5" />
        </button>
      </div>

      {/* Board Canvas Area */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 flex items-start gap-4">
        {columns.map((column) => (
          <div key={column.id} className="shrink-0 w-72 max-h-full flex flex-col bg-gray-100/80 border border-gray-200 rounded-xl shadow-sm">
            {/* Column Header */}
            <div className="p-3 pb-2 flex items-center justify-between cursor-grab">
              <h3 className="font-medium text-sm text-gray-900">{column.title}</h3>
              <button className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded transition-colors">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            
            {/* Cards Area (Empty for now) */}
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
        
        {/* Add New Column Placeholder */}
        <button className="shrink-0 w-72 h-12 flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-white border border-dashed border-gray-300 hover:border-gray-400 rounded-xl px-4 transition-colors focus:outline-none shadow-sm">
          <Plus className="w-4 h-4" />
          Add another list
        </button>
      </div>
    </div>
  );
}
