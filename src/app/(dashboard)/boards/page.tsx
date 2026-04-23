import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function BoardsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  // Here we would eventually fetch boards from Supabase
  // const { data: boards } = await supabase.from('boards').select('*');
  
  // Empty array to demonstrate the "No boards yet" placeholder state
  const boards: any[] = [];

  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          Your Boards
        </h1>
        {boards.length > 0 && (
          <button className="bg-gray-900 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900/20">
            + Create Board
          </button>
        )}
      </div>

      {boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 bg-white rounded-2xl border border-dashed border-gray-300 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h2 className="text-lg font-medium text-gray-900 mb-1">No boards yet</h2>
          <p className="text-sm text-gray-500 mb-6 text-center max-w-sm">
            You don't have any Kanban boards. Create your first board to start tracking your tasks and projects.
          </p>
          <button className="bg-gray-900 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900/20 shadow-sm">
            Create your first board
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {/* New Board Action Card */}
          <button className="h-32 rounded-xl bg-gray-50 border border-dashed border-gray-300 flex flex-col items-center justify-center text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors group">
            <svg className="w-6 h-6 mb-2 text-gray-400 group-hover:text-gray-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create new board</span>
          </button>

          {/* Existing Boards */}
          {boards.map((board) => (
            <Link 
              key={board.id} 
              href={`/boards/${board.id}`}
              className={`${board.theme || 'bg-blue-600'} h-32 rounded-xl p-5 text-white font-medium hover:brightness-110 transition-all shadow-sm flex flex-col justify-between group relative overflow-hidden`}
            >
              <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 text-lg">{board.title}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
