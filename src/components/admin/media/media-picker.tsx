"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "../alert";
import { Button } from "../button";
import { TextInput } from "../field";
import { UploadForm, type UploadedMedia } from "./upload-form";

export type PickedMedia = UploadedMedia;

/**
 * Pick an image from the media library (or upload a new one) in a modal dialog.
 * Uses a native <dialog>: focus is trapped, Esc closes, the page behind is inert.
 *
 *   <MediaPicker locale="ko" onSelect={(m) => ...}>이미지 고르기</MediaPicker>
 *
 * `locale` only drives the warning for images that have no English alt text yet (the image can still be chosen).
 */
export function MediaPicker({
  onSelect,
  children,
  locale = "ko",
  variant = "secondary",
  title = "이미지 고르기",
}: {
  onSelect: (m: PickedMedia) => void;
  children: React.ReactNode;
  locale?: "ko" | "en";
  variant?: "primary" | "secondary" | "ghost";
  title?: string;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [items, setItems] = useState<PickedMedia[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"library" | "upload">("library");

  const load = useCallback(async () => {
    setError(null);
    try {
      const res = await fetch("/admin/api/media", { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      setItems(((await res.json()) as { items: PickedMedia[] }).items);
    } catch {
      setError("이미지 목록을 불러오지 못했어요. 다시 열어 주세요.");
    }
  }, []);

  const open = () => {
    setTab("library");
    setQ("");
    dialog.current?.showModal();
    void load();
  };
  const close = () => dialog.current?.close();

  // Close on a click on the backdrop.
  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    const onClick = (e: MouseEvent) => e.target === d && d.close();
    d.addEventListener("click", onClick);
    return () => d.removeEventListener("click", onClick);
  }, []);

  const pick = (m: PickedMedia) => {
    onSelect(m);
    close();
  };
  const shown = (items ?? []).filter((m) => !q.trim() || `${m.alt_ko} ${m.alt_en}`.toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <>
      <Button variant={variant} onClick={open}>
        {children}
      </Button>
      <dialog ref={dialog} aria-label={title} className="m-auto w-[min(960px,calc(100vw-32px))] max-w-none border-2 border-ink bg-paper p-0 text-ink backdrop:bg-black/50">
        <div className="flex max-h-[85svh] flex-col">
          <header className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
            <h2 className="text-[18px] font-bold">{title}</h2>
            <Button variant="ghost" onClick={close}>
              닫기
            </Button>
          </header>
          <div role="tablist" aria-label="이미지 출처" className="flex gap-1 border-b border-line px-4 pt-2">
            {(["library", "upload"] as const).map((t) => (
              <button
                key={t}
                role="tab"
                type="button"
                aria-selected={tab === t}
                onClick={() => setTab(t)}
                className={`min-h-11 px-4 text-[15px] font-bold ${tab === t ? "border-b-4 border-ink" : "text-gray"}`}
              >
                {t === "library" ? "라이브러리" : "새로 올리기"}
              </button>
            ))}
          </div>
          <div className="overflow-y-auto p-4">
            {tab === "upload" ? (
              <UploadForm compact onDone={(m) => pick(m)} />
            ) : (
              <div className="grid gap-4">
                <label className="grid gap-1.5 text-[15px] font-bold">
                  설명으로 찾기
                  <TextInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="대체 텍스트로 검색" />
                </label>
                {error && <Alert kind="error">{error}</Alert>}
                {!error && items === null && <p className="text-gray">불러오는 중…</p>}
                {items && shown.length === 0 && <p className="py-6 text-center text-gray">{items.length === 0 ? "아직 올린 이미지가 없어요. \"새로 올리기\"를 눌러 주세요." : "찾는 이미지가 없어요."}</p>}
                <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
                  {shown.map((m) => {
                    const missingEn = locale === "en" && !m.alt_en;
                    return (
                      <li key={m.id}>
                        <button type="button" onClick={() => pick(m)} className="flex h-full w-full flex-col border border-line text-left hover:border-ink focus-visible:outline-2">
                          <span className="flex h-28 items-center justify-center bg-concrete">
                            {/* eslint-disable-next-line @next/next/no-img-element -- storage URL */}
                            <img src={m.url} alt="" loading="lazy" className="max-h-full max-w-full object-contain" />
                          </span>
                          <span className="grid gap-1 p-2 text-[14px] leading-snug">
                            <span>{m.alt_ko}</span>
                            {missingEn && <span className="font-bold text-[#7a5500]">영어 대체 텍스트가 없어요 (한국어로 대신 써요)</span>}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
        </div>
      </dialog>
    </>
  );
}
