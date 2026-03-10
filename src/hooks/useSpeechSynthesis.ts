"use client";

import { useCallback } from "react";

export function useSpeechSynthesis() {
  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window) || !text.trim()) {
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = 1;
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return { speak, stop };
}
