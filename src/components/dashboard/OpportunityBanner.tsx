import React from "react";

type Props = {
  stats: {
    totalLeads: number;
    hotLeads: number;
    pipelineValue: number;
  };
  onViewHotLeads: () => void;
  onStartFollowUps: () => void;
};

const OpportunityBanner: React.FC<Props> = ({ stats, onViewHotLeads, onStartFollowUps }) => {
  return (
    <section className="w-full rounded-3xl bg-gradient-to-tr from-primary/90 to-sky-400/80 shadow-xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
      <div>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Out of <span className="text-yellow-200">{stats.totalLeads}</span> leads, <span className="text-yellow-300">{stats.hotLeads}</span> are likely to convert</h2>
        <p className="text-lg text-white/90 mb-4">Estimated pipeline value: <span className="font-semibold text-green-200">${stats.pipelineValue.toLocaleString()}</span></p>
        <div className="flex gap-4">
          <button onClick={onViewHotLeads} className="bg-white/90 text-primary font-semibold px-6 py-2 rounded-lg shadow hover:bg-white transition">View Hot Leads</button>
          <button onClick={onStartFollowUps} className="bg-primary/80 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-primary transition">Start Follow-Ups</button>
        </div>
      </div>
      {/* Subtle background gradient effect */}
      <div className="absolute right-0 bottom-0 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />
    </section>
  );
};

export default OpportunityBanner;
