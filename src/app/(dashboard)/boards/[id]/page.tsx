import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function BoardPage({ params }: { params: { id: string } }) {
  return (
    <div className="h-full flex flex-col overflow-hidden bg-blue-50 dark:bg-gray-800">
      {/* Board Header */}
      <div className="h-14 px-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="font-bold text-lg text-gray-900 dark:text-white">Board {params.id}</h1>
          <Button variant="ghost" size="sm">★</Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">Filter</Button>
          <Button variant="outline" size="sm">Share</Button>
          <Button variant="ghost" size="sm">...</Button>
        </div>
      </div>

      {/* Board Canvas Placeholder */}
      <div className="flex-1 overflow-x-auto p-4 flex gap-4 items-start">
        {/* Placeholder Column 1 */}
        <div className="w-72 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-xl flex flex-col max-h-full">
          <div className="p-3 font-semibold text-sm flex justify-between items-center text-gray-700 dark:text-gray-200">
            To Do
            <span className="text-gray-500">...</span>
          </div>
          <div className="p-2 overflow-y-auto flex-1 space-y-2">
            <div className="bg-white dark:bg-gray-700 p-3 rounded shadow-sm text-sm border border-gray-200 dark:border-gray-600">
              Task 1 (Placeholder)
            </div>
            <div className="bg-white dark:bg-gray-700 p-3 rounded shadow-sm text-sm border border-gray-200 dark:border-gray-600">
              Task 2 (Placeholder)
            </div>
          </div>
          <div className="p-2">
            <Button variant="ghost" className="w-full justify-start text-gray-600 dark:text-gray-400">
              + Add a card
            </Button>
          </div>
        </div>

        {/* Placeholder Column 2 */}
        <div className="w-72 flex-shrink-0 bg-gray-100 dark:bg-gray-800 rounded-xl flex flex-col max-h-full">
          <div className="p-3 font-semibold text-sm flex justify-between items-center text-gray-700 dark:text-gray-200">
            In Progress
            <span className="text-gray-500">...</span>
          </div>
          <div className="p-2 overflow-y-auto flex-1 space-y-2">
            <div className="bg-white dark:bg-gray-700 p-3 rounded shadow-sm text-sm border border-gray-200 dark:border-gray-600">
              Task 3 (Placeholder)
            </div>
          </div>
          <div className="p-2">
            <Button variant="ghost" className="w-full justify-start text-gray-600 dark:text-gray-400">
              + Add a card
            </Button>
          </div>
        </div>

        {/* Add List Placeholder */}
        <div className="w-72 flex-shrink-0">
          <Button variant="ghost" className="w-full justify-start bg-white/20 dark:bg-gray-800/50 hover:bg-white/30 dark:hover:bg-gray-800/70 text-gray-700 dark:text-gray-200">
            + Add another list
          </Button>
        </div>
      </div>
    </div>
  );
}
