"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const menuItems = [
  {
    label: "Edit Profile",
    icon: (
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 113 3L7 19.5 3 21l1.5-4L16.5 3.5z" /></svg>
    ),
  },
  {
    label: "Preferences",
    icon: (
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.65 1.65 0 001.82.33h.09a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51h.09a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.09a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" /></svg>
    ),
  },
  {
    label: "Theme",
    icon: (
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    ),
  },
  {
    label: "Notifications",
    icon: (
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8a6 6 0 00-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 01-3.46 0" /></svg>
    ),
  },
  {
    label: "Sign out",
    icon: (
      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17 16l4-4m0 0l-4-4m4 4H7" /><path d="M7 8v8" /></svg>
    ),
  },
];

export function SettingsMenu({ onSignOut }: { onSignOut?: () => void }) {
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState<string | null>(null);
  return (
    <div className="relative">
      <Button
        type="button"
        variant="ghost"
        className="rounded-full w-9 h-9 flex items-center justify-center"
        aria-label="Open settings"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="sr-only">Open settings</span>
        <svg className="w-5 h-5 text-zinc-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4l3 3" /></svg>
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-60 rounded-xl bg-white shadow-lg border border-zinc-100 z-50 p-4 animate-fade-in">
          <h3 className="font-semibold text-zinc-900 mb-2">Profile & Settings</h3>
          <div className="flex flex-col gap-2">
            {menuItems.map((item) => (
              <Button
                key={item.label}
                variant="secondary"
                className="w-full flex items-center justify-start"
                onClick={() => {
                  if (item.label === "Sign out") {
                    onSignOut?.();
                    setOpen(false);
                    return;
                  }
                  setModal(item.label);
                }}
              >
                {item.icon}
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      )}
      {/* Placeholder modals for each settings item */}
      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fade-in">
            <button className="absolute top-3 right-3 text-zinc-400 hover:text-zinc-600 text-xl" onClick={() => setModal(null)} aria-label="Close">×</button>
            <h2 className="text-xl font-bold mb-4 text-zinc-900">{modal}</h2>
            <div className="text-zinc-600">Coming soon: {modal} customization.</div>
          </div>
        </div>
      )}
    </div>
  );
}
