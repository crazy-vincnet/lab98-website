"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { cx } from "./cx";

type Message = { kind: "ok" | "error"; text: string };

/** Floating message. Auto-hides after 6 s (errors stay until closed). */
export function Toast({ message, onClose }: { message: Message; onClose: () => void }) {
  useEffect(() => {
    if (message.kind !== "ok") return;
    const t = setTimeout(onClose, 6000);
    return () => clearTimeout(t);
  }, [message, onClose]);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4">
      <div
        role={message.kind === "error" ? "alert" : "status"}
        className={cx(
          "pointer-events-auto flex max-w-[560px] items-start gap-3 border px-4 py-3 text-[15px] shadow-lg",
          message.kind === "ok" ? "border-[#0c8560] bg-[#e8f8f1]" : "border-[#b42318] bg-[#fff1ef]",
        )}
      >
        <span className="font-bold">{message.text}</span>
        <button type="button" onClick={onClose} className="-my-1 -mr-2 min-h-8 min-w-8 text-[18px] leading-none" aria-label="닫기">
          ×
        </button>
      </div>
    </div>
  );
}

/** Reads ?flash=ok:text|error:text (set by redirectWithFlash), shows it once and cleans the URL. Render inside <Suspense>. */
export function FlashFromUrl() {
  const params = useSearchParams();
  const raw = params.get("flash");
  const [message, setMessage] = useState<Message | null>(null);

  useEffect(() => {
    if (!raw) return;
    const i = raw.indexOf(":");
    const kind = raw.slice(0, i) === "error" ? "error" : "ok";
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-shot read of the URL flash
    setMessage({ kind, text: raw.slice(i + 1) });
    const u = new URL(window.location.href);
    u.searchParams.delete("flash");
    window.history.replaceState(null, "", u.pathname + u.search + u.hash);
  }, [raw]);

  return message ? <Toast message={message} onClose={() => setMessage(null)} /> : null;
}
