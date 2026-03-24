import React from "react";

type Props = {
  stats: {
    hotLeads: number;
    potentialRevenue: number;
    inactiveLeads: number;
    needsFollowUp: number;
  };
};

type MetricKey = keyof Props['stats'];

const metrics: Array<{
  icon: string;
  label: string;
  key: MetricKey;
  color: string;
}> = [
  { icon: "🔥", label: "Hot Leads", key: "hotLeads", color: "text-red-500" },
  { icon: "💰", label: "Potential Revenue", key: "potentialRevenue", color: "text-green-500" },
  { icon: "⏳", label: "Inactive Leads", key: "inactiveLeads", color: "text-slate-500" },
  { icon: "🔔", label: "Needs Follow-Up", key: "needsFollowUp", color: "text-yellow-500" },
];

const MetricsGrid: React.FC<Props> = ({ stats }) => {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {metrics.map((m) => (
        <div key={m.key} className="bg-white rounded-2xl shadow p-6 flex flex-col items-center justify-center min-h-[120px]">
          <span className={`text-3xl mb-2 ${m.color}`}>{m.icon}</span>
          <span className="text-2xl font-bold mb-1">
            {m.key === "potentialRevenue"
              ? `$${stats[m.key].toLocaleString()}`
              : stats[m.key]}
          </span>
          <span className="text-xs text-slate-500 tracking-wide uppercase">{m.label}</span>
        </div>
      ))}
    </section>
  );
};

export default MetricsGrid;
