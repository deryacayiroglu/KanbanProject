export const AVAILABLE_LABELS = [
  { id: "bug", name: "Bug", color: "bg-red-500 text-white" },
  { id: "feature", name: "Feature", color: "bg-blue-500 text-white" },
  { id: "urgent", name: "Urgent", color: "bg-orange-500 text-white" },
  { id: "review", name: "Review", color: "bg-purple-500 text-white" },
] as const;

export function parseLabels(labelStr: string | null): string[] {
  if (!labelStr) return [];
  return labelStr.split(",").map(s => s.trim()).filter(Boolean);
}

export function stringifyLabels(labels: string[]): string | null {
  if (!labels || labels.length === 0) return null;
  return labels.join(",");
}
