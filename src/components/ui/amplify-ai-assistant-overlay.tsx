"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const QUESTIONS = [
  {
    id: "leads_count",
    label: "How many leads are waiting in your inbox or spreadsheets?",
    type: "text",
    placeholder: "e.g., 120 leads",
    required: true,
  },
  {
    id: "lead_sources",
    label: "Where do most of your leads come from?",
    type: "checkbox",
    options: ["WhatsApp", "FB Ads", "Portals", "Others"],
    required: true,
  },
  {
    id: "lead_challenge",
    label: "What’s your biggest challenge with leads?",
    type: "text",
    placeholder: "",
    required: true,
  },
  {
    id: "csv_upload",
    label: "Optional: Upload CSV to show instant AI demo",
    type: "file",
    required: false,
  },
];

const cardVariants = {
  hidden: { opacity: 0, y: -40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: 40, transition: { duration: 0.3 } },
};

const buttonMinimal =
  "bg-neutral-900 hover:bg-neutral-800 text-white transition-colors shadow-sm focus:ring-2 focus:ring-neutral-300 focus:outline-none";

export function AmplifyAIAssistantOverlay({ onClose }: { onClose?: () => void }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<{
    leads_count: string;
    lead_sources: string[];
    lead_challenge: string;
    csv_upload: File | null;
  }>({
    leads_count: "",
    lead_sources: [],
    lead_challenge: "",
    csv_upload: null,
  });
  const [showResult, setShowResult] = useState(false);

  // Simulate AI result
  const predictedDeals = form.leads_count
    ? Math.round(Number(form.leads_count) * 0.29)
    : 35;

  const handleInput = (id: string, value: any) => {
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleCheckbox = (option: string) => {
    setForm((prev) => {
      const sources = prev.lead_sources as string[];
      return {
        ...prev,
        lead_sources: sources.includes(option)
          ? sources.filter((s) => s !== option)
          : [...sources, option],
      };
    });
  };

  const handleFile = (file: File | null) => {
    setForm((prev) => ({ ...prev, csv_upload: file }));
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResult(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-gradient-to-br from-neutral-50 via-white to-neutral-100/80 backdrop-blur-xl">
      <AnimatePresence>
        {!showResult && (
          <motion.form
            key="form"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={cardVariants}
            onSubmit={handleSubmit}
            className="mt-20 w-full max-w-lg rounded-3xl bg-white/90 shadow-xl p-10 flex flex-col gap-8 border border-neutral-200"
            style={{ fontFamily: 'Inter, Poppins, sans-serif' }}
          >
            <div className="text-xs font-semibold text-neutral-600 mb-4 flex items-center gap-2 tracking-widest uppercase letter-spacing-2">
              <span className="inline-block w-8 h-8 bg-neutral-200 rounded-full" /> Amplify AI
            </div>
            <div className="text-2xl font-semibold mb-4 text-neutral-900 tracking-tight leading-snug">
              Let’s find your hidden deals <span className="ml-1">🕵️‍♂️</span>
            </div>
            {step === 1 && (
              <div className="flex flex-col gap-4">
                <label className="font-medium text-base text-neutral-800">
                  {QUESTIONS[0].label}
                  <input
                    type="text"
                    required
                    placeholder={QUESTIONS[0].placeholder}
                    value={form.leads_count}
                    onChange={(e) => handleInput("leads_count", e.target.value)}
                    className="mt-3 w-full rounded-xl border border-neutral-200 px-5 py-3 focus:ring-2 focus:ring-neutral-300 transition outline-none text-lg bg-neutral-50 placeholder-neutral-400"
                  />
                </label>
                <label className="font-medium text-sm text-neutral-800">
                  {QUESTIONS[1].label}
                  <div className="flex flex-wrap gap-3 mt-3">
                    {QUESTIONS[1].options!.map((opt) => (
                      <button
                        type="button"
                        key={opt}
                        onClick={() => handleCheckbox(opt)}
                        className={`px-4 py-2 rounded-full border text-base font-medium transition-all duration-150 shadow-sm ${
                          (form.lead_sources as string[]).includes(opt)
                            ? "bg-neutral-900 border-neutral-900 text-white"
                            : "bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-100"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </label>
                <button
                  type="button"
                  onClick={nextStep}
                  disabled={
                    !form.leads_count || (form.lead_sources as string[]).length === 0
                  }
                  className={`mt-2 w-full py-2 rounded-xl font-semibold text-base shadow-sm transition-all ${buttonMinimal} disabled:opacity-60`}
                >
                  Next
                </button>
              </div>
            )}
            {step === 2 && (
              <div className="flex flex-col gap-4">
                <label className="font-medium text-sm text-neutral-800">
                  {QUESTIONS[2].label}
                  <input
                    type="text"
                    required
                    value={form.lead_challenge}
                    onChange={(e) => handleInput("lead_challenge", e.target.value)}
                    className="mt-2 w-full rounded-lg border border-neutral-200 px-4 py-2 focus:ring-2 focus:ring-indigo-400 transition outline-none text-base bg-white"
                  />
                </label>
                <label className="font-medium text-sm text-neutral-800">
                  {QUESTIONS[3].label}
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => handleFile(e.target.files?.[0] || null)}
                    className="mt-2 block w-full text-sm text-neutral-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-neutral-100 file:text-neutral-700 hover:file:bg-neutral-200"
                  />
                  <span className="block text-xs text-neutral-400 mt-1">(Optional, skip if you don't have a CSV)</span>
                </label>
                <div className="flex gap-2 mt-2">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 py-2 rounded-xl font-semibold text-base bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 py-2 rounded-xl font-semibold text-base shadow-sm ${buttonMinimal}`}
                  >
                    {form.csv_upload ? "Show AI Demo" : "Finish"}
                  </button>
                </div>
              </div>
            )}
          </motion.form>
        )}
        {showResult && (
          <motion.div
            key="result"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={cardVariants}
            className="mt-20 w-full max-w-lg rounded-3xl bg-white/90 shadow-xl p-10 flex flex-col gap-8 border border-neutral-200 items-center text-center"
            style={{ fontFamily: 'Inter, Poppins, sans-serif' }}
          >
            <div className="flex items-center gap-2 text-neutral-700 text-lg font-semibold">
              <span className="inline-block w-6 h-6 bg-neutral-300 rounded-full" /> Amplify AI
            </div>
            <div className="text-2xl font-bold text-neutral-900">
              Based on your {form.leads_count || "120"} leads,
              <br />
              Amplify AI predicts
              <span className="text-neutral-700"> ~{predictedDeals} potential deals </span>
              you can revive automatically.
            </div>
            <div className="flex gap-4 mt-4 w-full justify-center">
              <button
                className={`flex-1 py-2 rounded-xl font-semibold text-base shadow-sm ${buttonMinimal} flex items-center justify-center gap-2`}
                onClick={() => window.location.href = "/app/leads"}
              >
                <span>View Leads</span>
                <span className="text-lg">✅</span>
              </button>
              <button
                className={`flex-1 py-2 rounded-xl font-semibold text-base shadow-sm ${buttonMinimal} flex items-center justify-center gap-2`}
                onClick={() => window.location.href = "/app/leads?followup=1"}
              >
                <span>Start Follow-Up</span>
                <span className="text-lg">🚀</span>
              </button>
            </div>
            <div className="flex gap-3 mt-8 w-full justify-center">
              <button
                className="flex-1 py-3 rounded-xl font-semibold text-lg bg-neutral-100 text-neutral-700 hover:bg-neutral-200 transition"
                onClick={() => {
                  setShowResult(false);
                  setStep(2);
                }}
              >
                Back
              </button>
              <button
                className="flex-1 py-3 rounded-xl font-semibold text-lg text-neutral-400 underline hover:text-neutral-600 transition"
                onClick={() => {
                  setShowResult(false);
                  setStep(1);
                  setForm({
                    leads_count: "",
                    lead_sources: [],
                    lead_challenge: "",
                    csv_upload: null,
                  });
                }}
              >
                Start Over
              </button>
              {onClose && (
                <button
                  className="flex-1 py-3 rounded-xl font-semibold text-lg text-neutral-500 underline hover:text-neutral-700 transition"
                  onClick={onClose}
                >
                  Close
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
