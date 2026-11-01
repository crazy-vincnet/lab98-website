"use client";

import { useRef, useState, useTransition } from "react";
import { sendCampaignChunk, type ChunkResult } from "@/app/(admin)/admin/(panel)/launch/actions";
import { Alert } from "../alert";
import { Button } from "../button";

type Props = {
  campaignId: string;
  status: string;
  /** exact number of people who would get the mail right now */
  eligible: number;
  skippedOptout: number;
  sentCount: number;
  failedCount: number;
};

/** Step 2: confirm dialog with the exact count, then call the server in small chunks until done (or paused). */
export function LaunchRunner({ campaignId, status, eligible, skippedOptout, sentCount, failedCount }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [pending, start] = useTransition();
  const [progress, setProgress] = useState<ChunkResult | null>(null);
  const resume = status === "sending";

  const run = () => {
    dialog.current?.close();
    start(async () => {
      let confirm: number | undefined = status === "draft" ? eligible : undefined;
      for (let guard = 0; guard < 2000; guard++) {
        let r: ChunkResult;
        try {
          r = await sendCampaignChunk(campaignId, confirm);
        } catch {
          setProgress({ ok: false, error: "서버와 연결이 끊겼어요. 새로고침한 뒤 '이어서 보내기'를 누르면 보낸 분은 건너뛰고 이어서 보내요." });
          return;
        }
        setProgress(r);
        confirm = undefined;
        if (!r.ok || r.state !== "sending") return;
      }
    });
  };

  const finished = progress?.ok && progress.state === "done";
  return (
    <div className="grid gap-3">
      {(status === "draft" || resume) && !finished && (
        <div className="flex flex-wrap items-center gap-3">
          <Button disabled={pending || eligible === 0} onClick={() => dialog.current?.showModal()}>
            {pending ? "보내는 중… (창을 닫지 마세요)" : resume ? "이어서 보내기" : "실제로 보내기"}
          </Button>
          {eligible === 0 && <span className="text-[15px] text-gray">보낼 사람이 없어요.</span>}
        </div>
      )}

      <dialog ref={dialog} className="m-auto max-w-[480px] border-2 border-ink bg-paper p-5 text-ink backdrop:bg-black/50" aria-labelledby="send-title">
        <h3 id="send-title" className="text-[18px] font-bold">
          정확히 {eligible.toLocaleString("ko-KR")}명에게 보낼까요?
        </h3>
        <ul className="mt-3 list-disc pl-5 text-[15px] leading-relaxed">
          <li>수신거부한 {skippedOptout.toLocaleString("ko-KR")}명은 자동으로 빼요.</li>
          {sentCount > 0 && <li>이미 보낸 {sentCount.toLocaleString("ko-KR")}명은 다시 보내지 않아요.</li>}
          <li>한 번 보낸 메일은 취소할 수 없어요.</li>
        </ul>
        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <Button variant="secondary" onClick={() => dialog.current?.close()}>
            취소
          </Button>
          <Button onClick={run}>네, {eligible.toLocaleString("ko-KR")}명에게 보내요</Button>
        </div>
      </dialog>

      {progress && (
        <div aria-live="polite" className="grid gap-2">
          {progress.error && <Alert kind={progress.ok ? "info" : "error"}>{progress.error}</Alert>}
          {progress.ok && (
            <Alert kind={finished ? "ok" : "info"}>
              {finished ? "발송을 마쳤어요. " : "보내는 중이에요. "}
              보냄 {progress.sentTotal ?? 0}명 · 실패 {progress.failedTotal ?? 0}명 · 남음 {progress.remaining ?? 0}명
            </Alert>
          )}
        </div>
      )}
      {failedCount > 0 && !progress && <p className="text-[14px] text-gray">실패 {failedCount}명은 아래 목록에서 확인하세요.</p>}
    </div>
  );
}
