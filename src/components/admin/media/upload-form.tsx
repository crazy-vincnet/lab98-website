"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Alert } from "../alert";
import { Button } from "../button";
import { Field, TextInput } from "../field";

export const MAX_MB = 5;
const OK_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];

export type UploadedMedia = { id: string; url: string; alt_ko: string; alt_en: string; width: number | null; height: number | null };

/** Upload one image to the media library. Alt text (Korean) is required. `onDone` lets the picker use the new file at once. */
export function UploadForm({ onDone, compact = false }: { onDone?: (m: UploadedMedia) => void; compact?: boolean }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [warn, setWarn] = useState<string | null>(null);
  const [altKo, setAltKo] = useState("");
  const [altEn, setAltEn] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  const reset = () => {
    setAltKo("");
    setAltEn("");
    setPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setWarn(null);
    const file = fileRef.current?.files?.[0];
    if (!file) return setError("이미지 파일을 골라 주세요.");
    if (!OK_TYPES.includes(file.type)) return setError("PNG, JPG, WEBP, GIF만 올릴 수 있어요. (SVG는 받지 않아요.)");
    if (file.size > MAX_MB * 1024 * 1024) return setError(`파일이 너무 커요. ${MAX_MB}MB 이하로 올려 주세요.`);
    if (!altKo.trim()) return setError("한국어 대체 텍스트를 적어 주세요.");
    setBusy(true);
    try {
      const body = new FormData();
      body.set("file", file);
      body.set("alt_ko", altKo);
      body.set("alt_en", altEn);
      const res = await fetch("/admin/api/media", { method: "POST", body });
      let json: { item?: UploadedMedia; error?: string; warnings?: string[] } = {};
      try {
        json = await res.json();
      } catch {
        /* non-JSON answer (for example a 413 from the host) */
      }
      if (!res.ok || !json.item) {
        setError(json.error ?? (res.status === 413 ? "파일이 너무 커요. 더 작은 파일로 올려 주세요." : res.status === 401 ? "로그인이 끝났어요. 새로고침해서 다시 로그인해 주세요." : "올리지 못했어요. 다시 시도해 주세요."));
        return;
      }
      if (json.warnings?.length) setWarn(json.warnings[0]);
      reset();
      onDone?.(json.item);
      router.refresh();
    } catch {
      setError("네트워크 문제로 올리지 못했어요. 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4" noValidate>
      <div className={compact ? "grid gap-4" : "grid gap-4 md:grid-cols-[1fr_1fr]"}>
        <div className="grid content-start gap-4">
          <Field id={`${compact ? "p-" : ""}file`} label="이미지 파일" hint={`PNG, JPG, WEBP, GIF · ${MAX_MB}MB 이하`}>
            {(p) => (
              <input
                {...p}
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="block min-h-11 w-full border border-ink bg-paper px-3 py-2 text-[15px] file:mr-3 file:border-0 file:bg-ink file:px-3 file:py-1.5 file:text-paper"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  setPreview(f && OK_TYPES.includes(f.type) ? URL.createObjectURL(f) : null);
                }}
              />
            )}
          </Field>
          {preview && (
            // eslint-disable-next-line @next/next/no-img-element -- local blob preview
            <img src={preview} alt="고른 이미지 미리보기" className="max-h-40 w-auto max-w-full border border-line object-contain" />
          )}
        </div>
        <div className="grid content-start gap-4">
          <Field id={`${compact ? "p-" : ""}alt_ko`} label="대체 텍스트 (한국어, 필수)" hint="이미지를 볼 수 없는 분께 읽어 주는 설명이에요. 예: 노트북으로 홈페이지를 고치는 모습">
            {(p) => <TextInput {...p} value={altKo} onChange={(e) => setAltKo(e.target.value)} maxLength={300} required />}
          </Field>
          <Field id={`${compact ? "p-" : ""}alt_en`} label="대체 텍스트 (영어)" hint="영어 글에 쓸 이미지라면 꼭 채워 주세요.">
            {(p) => <TextInput {...p} value={altEn} onChange={(e) => setAltEn(e.target.value)} maxLength={300} lang="en" />}
          </Field>
        </div>
      </div>
      {error && <Alert kind="error">{error}</Alert>}
      {warn && <Alert kind="info">{warn}</Alert>}
      <div>
        <Button type="submit" disabled={busy}>
          {busy ? "올리는 중…" : "올리기"}
        </Button>
      </div>
    </form>
  );
}
