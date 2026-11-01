"use client";

import { launchFooterHtml, renderMail } from "@/lib/admin/requests/pure";

/** Sandboxed preview of exactly the HTML we send (body is escaped plain text; footer is ours). */
export function MailPreview({ body, sampleUnsubscribeUrl }: { body: string; sampleUnsubscribeUrl: string }) {
  return (
    <iframe
      title="메일 미리보기"
      sandbox=""
      srcDoc={`<!doctype html><meta charset="utf-8"><base target="_blank">${renderMail(body || " ", launchFooterHtml(sampleUnsubscribeUrl))}`}
      className="h-[360px] w-full border border-line bg-white"
    />
  );
}
