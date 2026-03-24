import React from "react";

const actions = [
  {
    icon: (
      <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z" /></svg>
    ),
    title: "Analyze Leads",
    desc: "Let AI find your best opportunities.",
    onClick: () => alert("Analyze Leads")
  },
  {
    icon: (
      <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 8V6a5 5 0 00-10 0v2M5 8h14v10a2 2 0 01-2 2H7a2 2 0 01-2-2V8z" /></svg>
    ),
    title: "Auto Follow-Up",
    desc: "Automate personalized follow-ups.",
    onClick: () => alert("Auto Follow-Up")
  },
  {
    icon: (
      <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 12H4" /><path d="M12 20l-8-8 8-8" /></svg>
    ),
    title: "Re-Engage Cold Leads",
    desc: "Win back leads that went cold.",
    onClick: () => alert("Re-Engage Cold Leads")
  },
  {
    icon: (
      <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4" /></svg>
    ),
    title: "Import Leads",
    desc: "Bring in leads from your CRM.",
    onClick: () => alert("Import Leads")
  },
];

const ActionsGrid: React.FC = () => {
  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {actions.map((a, i) => (
        <button
          key={a.title}
          className="bg-white rounded-2xl shadow p-6 flex flex-col items-center justify-center min-h-[140px] transition-transform hover:scale-105 hover:shadow-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary"
          onClick={a.onClick}
        >
          <div className="mb-3">{a.icon}</div>
          <div className="font-semibold text-base mb-1 text-slate-800">{a.title}</div>
          <div className="text-xs text-slate-500 text-center">{a.desc}</div>
        </button>
      ))}
    </section>
  );
};

export default ActionsGrid;
