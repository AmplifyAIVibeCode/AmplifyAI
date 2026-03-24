"use client";

import React, { useState } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
};

const AssistantModal: React.FC<Props> = ({ open, onClose }) => {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    numLeads: "",
    source: "",
    challenge: "",
  });

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: update OpportunityBanner dynamically
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
        <button className="absolute top-3 right-3 text-slate-400 hover:text-slate-600" onClick={onClose} aria-label="Close">✕</button>
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {step === 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">How many leads do you have?</label>
              <input
                type="number"
                name="numLeads"
                value={form.numLeads}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                min={0}
                required
              />
              <button type="button" className="mt-4 bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition" onClick={handleNext}>Next</button>
            </div>
          )}
          {step === 1 && (
            <div>
              <label className="block text-sm font-medium mb-2">What is your main lead source?</label>
              <select
                name="source"
                value={form.source}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select source</option>
                <option value="portal">Property Portal</option>
                <option value="referral">Referral</option>
                <option value="website">Website</option>
                <option value="social">Social Media</option>
                <option value="other">Other</option>
              </select>
              <div className="flex gap-2 mt-4">
                <button type="button" className="bg-slate-200 text-slate-700 px-4 py-2 rounded hover:bg-slate-300 transition" onClick={handleBack}>Back</button>
                <button type="button" className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition" onClick={handleNext}>Next</button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div>
              <label className="block text-sm font-medium mb-2">What's your biggest challenge?</label>
              <input
                type="text"
                name="challenge"
                value={form.challenge}
                onChange={handleChange}
                className="w-full border border-slate-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <div className="flex gap-2 mt-4">
                <button type="button" className="bg-slate-200 text-slate-700 px-4 py-2 rounded hover:bg-slate-300 transition" onClick={handleBack}>Back</button>
                <button type="submit" className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90 transition">Finish</button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AssistantModal;
