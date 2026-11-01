"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button, buttonClass, type ButtonVariant } from "./button";

/**
 * Two-step button for risky actions inside a <form action={...}>. First click asks "정말 …?", second click submits.
 *   <ConfirmButton question="이 글을 삭제할까요?">삭제</ConfirmButton>
 */
export function ConfirmButton({
  children,
  question = "정말 진행할까요?",
  confirmLabel = "네, 진행해요",
  variant = "danger",
}: {
  children: React.ReactNode;
  question?: string;
  confirmLabel?: string;
  variant?: ButtonVariant;
}) {
  const [asking, setAsking] = useState(false);
  const { pending } = useFormStatus();
  if (!asking) {
    return (
      <Button variant={variant === "danger" ? "secondary" : variant} onClick={() => setAsking(true)}>
        {children}
      </Button>
    );
  }
  return (
    <span role="group" aria-label={question} className="inline-flex flex-wrap items-center gap-2">
      <span className="text-[15px] font-bold">{question}</span>
      <button type="submit" disabled={pending} className={buttonClass(variant)}>
        {pending ? "처리 중…" : confirmLabel}
      </button>
      <Button variant="ghost" onClick={() => setAsking(false)}>
        취소
      </Button>
    </span>
  );
}
