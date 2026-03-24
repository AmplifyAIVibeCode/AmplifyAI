"use client";

import { SignInModal } from "@/components/auth/sign-in-modal";
import { useAuthModal } from "@/contexts/auth-modal-context";

export function AuthModalWrapper() {
  const { isSignInModalOpen, closeSignInModal } = useAuthModal();

  return (
    <SignInModal
      isOpen={isSignInModalOpen}
      onClose={closeSignInModal}
      redirectTo="/app"
    />
  );
}