"use client";

import { useState } from "react";
import { Button } from "./button";

/** Copies `value` to the clipboard and says so. */
export function CopyButton({ value, label = "복사" }: { value: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      variant="secondary"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
          setDone(true);
          setTimeout(() => setDone(false), 2000);
        } catch {
          window.prompt("복사해 주세요 (Ctrl+C)", value);
        }
      }}
    >
      <span aria-live="polite">{done ? "복사했어요" : label}</span>
    </Button>
  );
}
