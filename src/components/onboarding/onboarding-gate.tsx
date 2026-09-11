"use client";

import { useEffect, useState } from "react";
import { OnboardingWizard } from "./onboarding-wizard";

export function OnboardingGate({ userId }: { userId: string }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const done = localStorage.getItem(`focustrack-onboarded-${userId}`);
      if (!done) setShow(true);
    } catch {
      /* ignore */
    }
  }, [userId]);

  if (!show) return null;
  return (
    <OnboardingWizard userId={userId} onComplete={() => setShow(false)} />
  );
}
