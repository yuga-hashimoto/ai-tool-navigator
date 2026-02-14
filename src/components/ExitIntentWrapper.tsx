"use client";

import { useExitIntentABTest } from "@/lib/ab-testing";
import ExitIntentModalEnhanced from "@/components/ExitIntentModalEnhanced";

export default function ExitIntentWrapper() {
  const { variant, isLoading } = useExitIntentABTest();

  if (isLoading) {
    return null;
  }

  return <ExitIntentModalEnhanced variant={variant} enabled={true} />;
}
