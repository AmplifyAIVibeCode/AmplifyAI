"use client";

import { Card } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { NewLeadForm } from "@/components/leads/new-lead-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { ImageCropModal } from "@/components/ui/image-crop-modal";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

const ONBOARDING_KEY = "amplifyAI.dashboardOnboardingFinished";
const BUSINESS_PROFILE_KEY = "amplifyAI.businessProfile";

type ProfileData = {
  businessName: string;
  website: string;
  email: string;
  phone: string;
  logo?: string;
};

function BusinessProfileForm({
  onSave,
}: {
  onSave?: () => void;
}) {
  const [profile, setProfile] = useState<ProfileData>({
    businessName: "",
    website: "",
    email: "",
    phone: "",
    logo: "",
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [cropImageSource, setCropImageSource] = useState<string | null>(null);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    if (typeof window === "undefined") return;

    try {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();

      if (data.user?.user_metadata) {
        const metadata = data.user.user_metadata as ProfileData;
        setProfile({
          businessName: metadata.businessName || "",
          website: metadata.website || "",
          email: metadata.email || "",
          phone: metadata.phone || "",
          logo: metadata.logo || "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      // Fallback to localStorage
      const stored = window.localStorage.getItem(BUSINESS_PROFILE_KEY);
      if (stored) {
        try {
          setProfile(JSON.parse(stored));
        } catch {
          // ignore
        }
      }
    }
  };

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setCropImageSource(result);
      setShowCropModal(true);
    };
    reader.readAsDataURL(file);
  };

  const handleCropComplete = (croppedImageUrl: string) => {
    setProfile((prev) => ({ ...prev, logo: croppedImageUrl }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setMessage("");

    try {
      const supabase = createSupabaseBrowserClient();

      // Save to Supabase user metadata
      const { error } = await supabase.auth.updateUser({
        data: {
          businessName: profile.businessName,
          website: profile.website,
          email: profile.email,
          phone: profile.phone,
          logo: profile.logo,
        } as any,
      });

      if (error) throw error;

      // Also save to localStorage for quick access
      window.localStorage.setItem(BUSINESS_PROFILE_KEY, JSON.stringify(profile));
      setMessage("Business info saved successfully.");

      if (onSave) {
        setTimeout(() => {
          onSave();
        }, 500);
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      setMessage("Error saving profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ImageCropModal
        isOpen={showCropModal}
        onClose={() => {
          setShowCropModal(false);
          setCropImageSource(null);
        }}
        imageSource={cropImageSource}
        onCropComplete={handleCropComplete}
      />

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-zinc-700">Business name</label>
          <Input
            value={profile.businessName}
            onChange={(event) =>
              setProfile({ ...profile, businessName: event.target.value })
            }
            placeholder="My Awesome Agency"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">Website</label>
          <Input
            value={profile.website}
            onChange={(event) =>
              setProfile({ ...profile, website: event.target.value })
            }
            placeholder="https://example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">Business email</label>
          <Input
            value={profile.email}
            onChange={(event) => setProfile({ ...profile, email: event.target.value })}
            placeholder="hello@example.com"
            type="email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-zinc-700">Phone</label>
          <Input
            value={profile.phone}
            onChange={(event) => setProfile({ ...profile, phone: event.target.value })}
            placeholder="(555) 123-4567"
            type="tel"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700">Business logo / avatar</label>
          <div className="flex items-center gap-3 mb-3">
            <input
              type="file"
              accept="image/*"
              className="text-sm text-zinc-500 flex-1"
              onChange={handleImageSelect}
            />
            <span className="text-xs text-zinc-500">Select to crop</span>
          </div>
          <Input
            value={profile.logo || ""}
            onChange={(event) => setProfile({ ...profile, logo: event.target.value })}
            placeholder="Image URL (or upload above)"
            type="url"
          />
          {profile.logo ? (
            <img
              src={profile.logo}
              alt="Business logo"
              className="mt-2 h-20 w-20 rounded-full object-cover border border-zinc-200"
            />
          ) : null}
        </div>

        {message ? (
          <div
            className={`rounded-md border px-3 py-2 text-sm ${
              message.includes("successfully")
                ? "bg-green-50 border-green-100 text-green-700"
                : "bg-red-50 border-red-100 text-red-700"
            }`}
          >
            {message}
          </div>
        ) : null}

        <div className="flex justify-end gap-3">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving…" : "Save business info"}
          </Button>
        </div>
      </form>
    </>
  );
}

function ProfileCompletionBadge({
  profile,
}: {
  profile: ProfileData | null;
}) {
  if (!profile) return null;

  const isComplete =
    profile.businessName &&
    profile.email &&
    profile.phone &&
    profile.logo;

  if (!isComplete) return null;

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-green-50 border border-green-200 px-3 py-1">
      <svg
        className="w-4 h-4 text-green-600"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      <span className="text-xs font-semibold text-green-700">Profile complete</span>
    </div>
  );
}
export function DashboardClient({
  hotLeads,
  estimatedDealValue,
  inactiveCount,
  needsFollowUpCount,
  statusCounts,
  totalLeads,
}: {
  hotLeads: any[];
  estimatedDealValue: number;
  inactiveCount: number;
  needsFollowUpCount: number;
  statusCounts: { hot: number; warm: number; cold: number };
  totalLeads: number;
}) {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAddLead, setShowAddLead] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [businessProfile, setBusinessProfile] = useState<ProfileData | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const loadBusinessProfile = async () => {
    if (typeof window === "undefined") return;

    setIsLoadingProfile(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase.auth.getUser();

      if (data.user?.user_metadata) {
        const metadata = data.user.user_metadata as ProfileData;
        setBusinessProfile({
          businessName: metadata.businessName || "",
          website: metadata.website || "",
          email: metadata.email || "",
          phone: metadata.phone || "",
          logo: metadata.logo || "",
        });
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      // Fallback to localStorage
      const stored = window.localStorage.getItem(BUSINESS_PROFILE_KEY);
      if (stored) {
        try {
          setBusinessProfile(JSON.parse(stored));
        } catch {
          setBusinessProfile(null);
        }
      }
    } finally {
      setIsLoadingProfile(false);
    }
  };

  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const hasOnboarded = window.localStorage.getItem(ONBOARDING_KEY) === "true";
    if (!hasOnboarded) {
      setShowOnboarding(true);
    }

    loadBusinessProfile();
  }, []);

  useEffect(() => {
    if (searchParams.get("profile") === "open") {
      setShowProfile(true);
      const params = new URLSearchParams(searchParams.toString());
      params.delete("profile");
      router.replace(`/app?${params.toString()}`);
    }
  }, [searchParams, router]);

  const completeOnboarding = () => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ONBOARDING_KEY, "true");
    }
    loadBusinessProfile();
    setShowOnboarding(false);
  };

  const isBackdropActive = showOnboarding || showAddLead || showProfile;

  return (
    <div className="relative">
      <Modal
        isOpen={showOnboarding}
        onClose={completeOnboarding}
        title="Complete your onboarding"
      >
        <p className="mb-4 text-sm text-zinc-600">
          Welcome to your dashboard! Start by setting up your business info so your leads workflow is personalized.
        </p>
        <BusinessProfileForm onSave={completeOnboarding} />
        <div className="mt-4 text-right">
          <Button variant="secondary" onClick={completeOnboarding}>
            Skip setup
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showProfile}
        onClose={() => setShowProfile(false)}
        title="Business profile settings"
      >
        <BusinessProfileForm
          onSave={() => {
            setShowProfile(false);
            loadBusinessProfile();
          }}
        />
      </Modal>

      <Modal
        isOpen={showAddLead}
        onClose={() => setShowAddLead(false)}
        title="Add lead"
      >
        <NewLeadForm onSuccess={() => setShowAddLead(false)} />
      </Modal>

      <div
        className={
          isBackdropActive
            ? "pointer-events-none filter blur-md brightness-90 transition-all duration-300"
            : "transition-all duration-300"
        }
      >
        <div className="flex w-full flex-col gap-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-semibold text-zinc-950">
                  Opportunity Dashboard
                </h1>
                <ProfileCompletionBadge profile={businessProfile} />
              </div>
              <p className="mt-1 text-sm text-zinc-600">
                View your key sales metrics and build momentum with leads.
              </p>
              {businessProfile && (businessProfile.businessName || businessProfile.email) ? (
                <div className="mt-3 flex items-center gap-3 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2">
                  {businessProfile.logo ? (
                    <img
                      src={businessProfile.logo}
                      alt="Business logo"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-zinc-300 flex items-center justify-center text-sm font-semibold text-white">
                      {businessProfile.businessName?.[0]?.toUpperCase() || "P"}
                    </div>
                  )}
                  <div>
                    <div className="text-sm font-semibold text-zinc-900">
                      {businessProfile.businessName || "Your business"}
                    </div>
                    <div className="text-xs text-zinc-600">{businessProfile.email}</div>
                  </div>
                </div>
              ) : null}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                onClick={() => setShowProfile(true)}
              >
                Profile
              </Button>
              <Button onClick={() => setShowAddLead(true)}>Add Lead</Button>
            </div>
          </div>

          {/* Primary insight cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card className="p-5">
              <div className="text-sm text-zinc-600">Total leads</div>
              <div className="mt-2 text-3xl font-semibold text-zinc-950">
                {totalLeads}
              </div>
            </Card>

            <Card className="p-5">
              <div className="text-sm text-zinc-600">Likely to convert</div>
              <div className="mt-2 text-3xl font-semibold text-zinc-950">
                {hotLeads?.length ?? 0}
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                Hot leads (score ≥ 70)
              </div>
            </Card>

            <Card className="p-5">
              <div className="text-sm text-zinc-600">Estimated deal value</div>
              <div className="mt-2 text-3xl font-semibold text-zinc-950">
                {estimatedDealValue > 0
                  ? `$${estimatedDealValue.toLocaleString()}`
                  : "—"}
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                Budget total from hot leads
              </div>
            </Card>

            <Card className="p-5">
              <div className="text-sm text-zinc-600">Need follow-up</div>
              <div className="mt-2 text-3xl font-semibold text-zinc-950">
                {needsFollowUpCount}
              </div>
              <div className="mt-1 text-xs text-zinc-500">
                Last message was from lead
              </div>
            </Card>
          </div>

          {/* Status breakdown */}
          <Card className="p-6">
            <div className="text-sm font-medium text-zinc-950">
              Lead distribution
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-zinc-200 p-4 text-center">
                <div className="text-2xl font-semibold text-zinc-950">
                  {statusCounts.hot}
                </div>
                <div className="mt-1 text-sm text-zinc-600">Hot</div>
              </div>
              <div className="rounded-xl border border-zinc-200 p-4 text-center">
                <div className="text-2xl font-semibold text-zinc-950">
                  {statusCounts.warm}
                </div>
                <div className="mt-1 text-sm text-zinc-600">Warm</div>
              </div>
              <div className="rounded-xl border border-zinc-200 p-4 text-center">
                <div className="text-2xl font-semibold text-zinc-950">
                  {statusCounts.cold}
                </div>
                <div className="mt-1 text-sm text-zinc-600">Cold</div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
