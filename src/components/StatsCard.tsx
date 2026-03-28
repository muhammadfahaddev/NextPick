import type { LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  color?: "indigo" | "green" | "yellow" | "red";
}

const colorMap = {
  indigo: "bg-indigo-500/20 text-indigo-400",
  green: "bg-green-500/20 text-green-400",
  yellow: "bg-yellow-500/20 text-yellow-400",
  red: "bg-red-500/20 text-red-400",
};

export default function StatsCard({
  title,
  value,
  icon: Icon,
  description,
  color = "indigo",
}: Props) {
  return (
    <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-slate-400">{title}</p>
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {description && (
        <p className="text-xs text-slate-500 mt-1">{description}</p>
      )}
    </div>
  );
}
