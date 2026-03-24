import React from "react";

type Props = {
  distribution: {
    hot: number;
    warm: number;
    cold: number;
  };
};

const colors = {
  hot: "bg-red-500",
  warm: "bg-yellow-400",
  cold: "bg-slate-400",
};

const LeadDistribution: React.FC<Props> = ({ distribution }) => {
  const total = distribution.hot + distribution.warm + distribution.cold;
  return (
    <section className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4">
      <h3 className="font-semibold text-lg mb-2 text-slate-800">Lead Distribution</h3>
      <div className="flex gap-4 items-end">
        {(["hot", "warm", "cold"] as const).map((type) => (
          <div key={type} className="flex flex-col items-center flex-1">
            <div
              className={`${colors[type]} w-8 md:w-12 rounded-t-lg transition-all`}
              style={{ height: `${(distribution[type] / total) * 120 + 24}px` }}
            />
            <span className="text-xs mt-2 font-medium text-slate-600 capitalize">{type}</span>
            <span className="text-xs text-slate-400">{distribution[type]}</span>
          </div>
        ))}
      </div>
    </section>
  );
};

export default LeadDistribution;
