"use client";

import React, { useState } from "react";
import OpportunityBanner from "./OpportunityBanner";
import MetricsGrid from "./MetricsGrid";
import ActionsGrid from "./ActionsGrid";
import LeadDistribution from "./LeadDistribution";
import AssistantModal from "./AssistantModal";

const Dashboard: React.FC = () => {
  const [assistantOpen, setAssistantOpen] = useState(false);
  // Placeholder data
  const stats = {
    totalLeads: 120,
    hotLeads: 18,
    pipelineValue: 540000,
    potentialRevenue: 320000,
    inactiveLeads: 42,
    needsFollowUp: 9,
  };
  const leadDistribution = {
    hot: 18,
    warm: 34,
    cold: 68,
  };
  return (
    <>
      <OpportunityBanner stats={stats} onViewHotLeads={() => {}} onStartFollowUps={() => {}} />
      <MetricsGrid stats={stats} />
      <ActionsGrid />
      <LeadDistribution distribution={leadDistribution} />
      {/* Floating AI Assistant */}
      <button
        className="fixed bottom-8 right-8 bg-primary text-white rounded-full shadow-lg w-16 h-16 flex items-center justify-center text-3xl hover:scale-110 transition-transform z-50"
        aria-label="Open AI Assistant"
        onClick={() => setAssistantOpen(true)}
      >
        <span>🤖</span>
      </button>
      <AssistantModal open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </>
  );
};

export default Dashboard;
