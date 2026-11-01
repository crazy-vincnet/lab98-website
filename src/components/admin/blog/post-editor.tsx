"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createTranslation, deletePost, restoreVersion, savePost, type SaveInput, type SaveResult } from "@/app/(admin)/admin/(panel)/blog/actions";
import type { MediaItem } from "@/lib/admin/media";
import type { VersionRow } from "@/lib/admin/posts";
import { formatKst } from "@/lib/admin/format";
import { fromKstLocalInput, toKstLocalInput } from "@/lib/kst";
import { slugify, type PostDoc } from "@/lib/post-doc";
import { Alert } from "../alert";
import { Badge } from "../badge";
import { Button, LinkButton } from "../button";
import { Card } from "../card";
import { ConfirmButton } from "../confirm-button";
import { Field, SelectInput, TextArea, TextInput } from "../field";
import { MediaPicker } from "../media/media-picker";
import { SubmitButton } from "../submit-button";
import { TiptapEditor } from "./tiptap-editor";

type Status = "draft" | "scheduled" | "published";
type Division = "master" | "dev" | "ai" | "faith";
type Img = Pick<MediaItem, "id" | "url" | "alt_ko" | "alt_en" | "width" | "height">;

export type EditorPost = {
  id: string;
  locale: "ko" | "en";
  slug: string;
  status: Status;
  title: string;
  excerpt: string;
  doc: PostDoc;
  cover: Img | null;
  seo: { meta_title: string; meta_description: string };
  og: Img | null;
  publishedAt: string | null;
  updatedAt: string;
  division: Division;
  author: string;
};
export type Sibling = { id: string; title: string; locale: "ko" | "en"; status: Status } | null;

type FieldErrors = Extract<SaveResult, { ok: false }>["fieldErrors"];
const AUTOSAVE_MS = 10_000;
const STATUS_LABEL: Record<Status, string> = { draft: "초안", scheduled: "예약", published: "발행" };
const DIVISION_LABEL: Record<Division, string> = { master: "Lab98 전체", dev: "Dev", ai: "AI", faith: "Faith" };

function Counter({ value, soft, hard }: { value: string; soft: number; hard: number }) {
  const n = [...value].length;
  const tone = n > hard ? "text-[#b42318] font-bold" : n > soft ? "text-[#7a5500] font-bold" : "text-gray";
  return (
    <span className={tone} aria-live="off">
      {n}/{soft}자{n > hard ? " (너무 길어요)" : n > soft ? " (검색 결과에서 잘릴 수 있어요)" : ""}
    </span>
  );
}

const altOf = (m: Img, locale: "ko" | "en") => (locale === "en" ? m.alt_en || m.alt_ko : m.alt_ko);

function ImagePick({ label, hint, value, locale, onPick, onClear, error }: { label: string; hint?: string; value: Img | null; locale: "ko" | "en"; onPick: (m: Img) => void; onClear: () => void; error?: string }) {
  return (
    <div className="grid gap-2">
      <p className="text-[15px] font-bold">{label}</p>
      {hint && <p className="text-[14px] text-gray">{hint}</p>}
      {value ? (
        <div className="flex flex-wrap items-start gap-3 border border-line p-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- storage URL */}
          <img src={value.url} alt="" className="h-24 w-auto max-w-[180px] border border-line object-contain" />
          <div className="grid min-w-[200px] flex-1 gap-1 text-[14px]">
            <p>
              <span className="font-bold">대체 텍스트: </span>
              {altOf(value, locale)}
            </p>
            {locale === "en" && !value.alt_en && <p className="font-bold text-[#7a5500]">영어 대체 텍스트가 없어서 한국어로 대신 나가요. 미디어에서 채워 주세요.</p>}
          </div>
        </div>
      ) : (
        <p className="text-[14px] text-gray">고른 이미지가 없어요.</p>
      )}
      <div className="flex flex-wrap gap-2">
        <MediaPicker locale={locale} title={label} onSelect={(m) => onPick(m)}>
          {value ? "다른 이미지 고르기" : "이미지 고르기"}
        </MediaPicker>
        {value && (
          <Button variant="ghost" onClick={onClear}>
            빼기
          </Button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-[14px] font-bold text-[#b42318]">
          {error}
        </p>
      )}
    </div>
  );
}

export function PostEditor({ post }: { post: EditorPost }) {
  const L = post.locale;
  const [title, setTitle] = useState(post.title);
  const [slug, setSlug] = useState(post.slug);
  const [slugTouched, setSlugTouched] = useState(post.status !== "draft");
  const [excerpt, setExcerpt] = useState(post.excerpt);
  const [doc, setDoc] = useState<PostDoc>(post.doc);
  const [cover, setCover] = useState<Img | null>(post.cover);
  const [og, setOg] = useState<Img | null>(post.og);
  const [metaTitle, setMetaTitle] = useState(post.seo.meta_title);
  const [metaDesc, setMetaDesc] = useState(post.seo.meta_description);
  const [status, setStatus] = useState<Status>(post.status);
  const [publishedLocal, setPublishedLocal] = useState(toKstLocalInput(post.publishedAt));
  const [division, setDivision] = useState<Division>(post.division);
  const [author, setAuthor] = useState(post.author);

  const [savedStatus, setSavedStatus] = useState<Status>(post.status);
  const [savedSlug, setSavedSlug] = useState(post.slug);
  const [updatedAt, setUpdatedAt] = useState(post.updatedAt);
  const [rev, setRev] = useState(0);
  const [savedRev, setSavedRev] = useState(0);
  const [saving, setSaving] = useState(false);
  const [note, setNote] = useState<{ kind: "ok" | "error" | "info"; text: string } | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [conflict, setConflict] = useState(false);

  const dirty = rev !== savedRev;
  const touch = useCallback(() => setRev((r) => r + 1), []);

  // Latest values for the autosave timer (avoids stale closures).
  const latest = useRef<SaveInput>(null as unknown as SaveInput);
  const current: SaveInput = {
    id: post.id,
    expectedUpdatedAt: updatedAt,
    mode: "save",
    title,
    slug,
    excerpt,
    coverMediaId: cover?.id ?? null,
    doc,
    seo: { meta_title: metaTitle, meta_description: metaDesc, og_media_id: og?.id ?? null },
    status,
    publishedAt: fromKstLocalInput(publishedLocal) ?? "",
    division,
    author,
  };
  const live = useRef({ saving, rev, savedStatus, conflict, savedRev });
  // Refs are updated after every render (not during it) so the timer and `run` always see the newest values.
  useEffect(() => {
    latest.current = current;
    live.current = { saving, rev, savedStatus, conflict, savedRev };
  });

  const run = useCallback(
    async (mode: "autosave" | "save") => {
      if (live.current.saving) return;
      setSaving(true);
      const startedAt = live.current.rev;
      setNote(mode === "save" ? { kind: "info", text: "저장하는 중…" } : null);
      let res: SaveResult;
      try {
        res = await savePost({ ...latest.current, mode });
      } catch {
        res = { ok: false, error: "네트워크 문제로 저장하지 못했어요. 다시 시도해 주세요." };
      }
      setSaving(false);
      if (res.ok) {
        setUpdatedAt(res.updatedAt);
        setSavedStatus(res.status);
        setSavedSlug(res.slug);
        setSavedRev(startedAt); // edits made while saving stay "unsaved"
        setErrors({});
        setConflict(false);
        setWarnings(res.warnings);
        if (res.status !== "draft" || mode === "save") setPublishedLocal(toKstLocalInput(res.publishedAt));
        const at = new Date(res.savedAt).toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", timeZone: "Asia/Seoul" });
        setNote({ kind: "ok", text: mode === "autosave" ? `자동 저장했어요 (${at})` : `${STATUS_LABEL[res.status]}으로 저장했어요 (${at})${res.versioned ? " · 버전 기록에 남겼어요" : ""}` });
      } else {
        setErrors(res.fieldErrors ?? {});
        if (res.conflict) setConflict(true);
        setNote({ kind: "error", text: res.error });
      }
    },
    [],
  );

  useEffect(() => {
    const t = setInterval(() => {
      const s = live.current;
      if (s.savedStatus === "draft" && latest.current.status === "draft" && s.rev !== s.savedRev && !s.saving && !s.conflict) void run("autosave");
    }, AUTOSAVE_MS);
    return () => clearInterval(t);
  }, [run]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const submitLabel = status === "published" ? (savedStatus === "published" ? "수정 내용 발행" : "지금 발행") : status === "scheduled" ? "예약하기" : "초안 저장";
  const publicPath = `${L === "en" ? "/en" : ""}/insights/${savedSlug}`;
  const isLive = savedStatus === "published";

  const statusHint = useMemo(
    () =>
      status === "draft"
        ? "초안은 공개되지 않아요. 10초마다 자동으로 저장돼요."
        : status === "scheduled"
          ? "정한 시각(한국 시간)이 되면 홈페이지에 자동으로 나와요. 1~2분 정도 늦을 수 있어요."
          : "저장하면 바로 홈페이지에 나와요.",
    [status],
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void run("save");
      }}
      className="grid gap-6"
      noValidate
    >
      <div className="sticky top-0 z-10 flex flex-wrap items-center gap-3 border border-line bg-paper px-4 py-3">
        <Badge tone={savedStatus === "published" ? "ok" : savedStatus === "scheduled" ? "warn" : "neutral"}>{STATUS_LABEL[savedStatus]}</Badge>
        <Badge tone="info">{L === "ko" ? "한국어" : "English"}</Badge>
        <p role="status" aria-live="polite" className="min-w-0 flex-1 text-[14px]">
          {dirty && !saving ? <span className="font-bold text-[#7a5500]">저장하지 않은 변경 사항이 있어요.</span> : null}{" "}
          {note && <span className={note.kind === "error" ? "font-bold text-[#b42318]" : "text-gray"}>{note.text}</span>}
        </p>
        <Button type="submit" disabled={saving || conflict}>
          {saving ? "저장 중…" : submitLabel}
        </Button>
      </div>

      {conflict && <Alert kind="error">다른 곳에서 이 글이 바뀌었어요. 이 화면에서 저장하면 덮어쓸 수 있어서 막아 뒀어요. 쓰던 내용을 복사해 둔 뒤 새로고침해 주세요.</Alert>}
      {warnings.map((w) => (
        <Alert key={w}>{w}</Alert>
      ))}
      {savedStatus !== "draft" && status === "draft" && <Alert>초안으로 바꾸고 저장하면 홈페이지에서 내려가요.</Alert>}

      <Card title="글 정보">
        <div className="grid gap-4">
          <Field id="title" label="제목" error={errors?.title}>
            {(p) => (
              <TextInput
                {...p}
                value={title}
                lang={L}
                maxLength={200}
                onChange={(e) => {
                  const v = e.target.value;
                  setTitle(v);
                  if (!slugTouched) {
                    const s = slugify(v);
                    if (s) setSlug(s);
                  }
                  touch();
                }}
              />
            )}
          </Field>
          <Field
            id="slug"
            label="주소(슬러그)"
            hint={
              <>
                글 주소는 <code className="font-mono">{L === "en" ? "/en" : ""}/insights/{slug || "…"}</code> 이 돼요. 영어 소문자, 숫자, 하이픈만 쓸 수 있고, 같은 언어 안에서 겹치면 안 돼요.
                {isLive && " 공개된 글의 주소를 바꾸면 이전 링크가 끊겨요."}
              </>
            }
            error={errors?.slug}
          >
            {(p) => (
              <div className="flex flex-wrap gap-2">
                <TextInput
                  {...p}
                  value={slug}
                  className="min-w-[220px] flex-1 font-mono"
                  autoComplete="off"
                  spellCheck={false}
                  maxLength={80}
                  onChange={(e) => {
                    setSlug(e.target.value.toLowerCase());
                    setSlugTouched(true);
                    touch();
                  }}
                />
                <Button
                  variant="secondary"
                  onClick={() => {
                    const s = slugify(title);
                    if (s) {
                      setSlug(s);
                      setSlugTouched(true);
                      touch();
                    } else setNote({ kind: "info", text: "제목에 영어나 숫자가 없어서 자동으로 만들 수 없어요. 직접 적어 주세요." });
                  }}
                >
                  제목으로 만들기
                </Button>
              </div>
            )}
          </Field>
          <Field
            id="excerpt"
            label="요약"
            hint={
              <>
                글 목록과 검색 결과에 보이는 한두 문장이에요. <Counter value={excerpt} soft={160} hard={300} />
              </>
            }
            error={errors?.excerpt}
          >
            {(p) => (
              <TextArea
                {...p}
                value={excerpt}
                lang={L}
                rows={3}
                onChange={(e) => {
                  setExcerpt(e.target.value);
                  touch();
                }}
              />
            )}
          </Field>
        </div>
      </Card>

      <Card title="본문">
        <div className="grid gap-2">
          <TiptapEditor
            initialDoc={post.doc}
            locale={L}
            invalid={!!errors?.content}
            describedBy={errors?.content ? "content-error" : undefined}
            onChange={(d) => {
              setDoc(d);
              touch();
            }}
          />
          {errors?.content && (
            <p id="content-error" role="alert" className="text-[14px] font-bold text-[#b42318]">
              {errors.content}
            </p>
          )}
          <p className="text-[14px] text-gray">도구 모음은 방향키(←→)로 옮기고 Enter로 눌러요. 굵게는 Ctrl+B, 기울임은 Ctrl+I예요.</p>
        </div>
      </Card>

      <Card title="대표 이미지">
        <ImagePick
          label="글 맨 위에 보여줄 이미지"
          hint="대체 텍스트는 미디어 라이브러리에 적어 둔 설명을 그대로 써요. (미디어 메뉴에서 고칠 수 있어요.)"
          value={cover}
          locale={L}
          onPick={(m) => {
            setCover(m);
            touch();
          }}
          onClear={() => {
            setCover(null);
            touch();
          }}
          error={errors?.cover}
        />
      </Card>

      <Card title="공개 설정">
        <div className="grid gap-4 md:grid-cols-2">
          <Field id="status" label="상태" hint={statusHint}>
            {(p) => (
              <SelectInput
                {...p}
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value as Status);
                  touch();
                }}
              >
                <option value="draft">초안 (공개 안 함)</option>
                <option value="scheduled">예약 (정한 시각에 공개)</option>
                <option value="published">발행 (바로 공개)</option>
              </SelectInput>
            )}
          </Field>
          {status !== "draft" && (
            <Field id="published_at" label={status === "scheduled" ? "공개할 시각 (한국 시간)" : "발행 시각 (한국 시간)"} hint={status === "published" ? "비워 두면 저장하는 지금 시각으로 발행돼요." : "미래 시각이어야 해요."} error={errors?.published_at}>
              {(p) => (
                <TextInput
                  {...p}
                  type="datetime-local"
                  value={publishedLocal}
                  onChange={(e) => {
                    setPublishedLocal(e.target.value);
                    touch();
                  }}
                />
              )}
            </Field>
          )}
          <Field id="division" label="분류" hint="글 목록에 점으로 표시돼요.">
            {(p) => (
              <SelectInput
                {...p}
                value={division}
                onChange={(e) => {
                  setDivision(e.target.value as Division);
                  touch();
                }}
              >
                {(Object.keys(DIVISION_LABEL) as Division[]).map((d) => (
                  <option key={d} value={d}>
                    {DIVISION_LABEL[d]}
                  </option>
                ))}
              </SelectInput>
            )}
          </Field>
          <Field id="author" label="글쓴이" hint="비워 두면 기본 글쓴이(전영재)로 나가요.">
            {(p) => (
              <TextInput
                {...p}
                value={author}
                maxLength={80}
                onChange={(e) => {
                  setAuthor(e.target.value);
                  touch();
                }}
              />
            )}
          </Field>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <LinkButton href={`/admin/blog/${post.id}/preview`} target="_blank" rel="noopener">
            미리보기 (새 창)
          </LinkButton>
          {isLive && (
            <LinkButton href={publicPath} target="_blank" rel="noopener">
              공개된 글 보기
            </LinkButton>
          )}
        </div>
        <p className="mt-2 text-[14px] text-gray">미리보기는 마지막으로 저장한 내용을 보여줘요.{dirty ? " 지금 편집한 내용은 아직 저장 전이에요." : ""}</p>
      </Card>

      <Card title="검색·공유 (SEO)">
        <div className="grid gap-4">
          <Field id="meta_title" label="검색 제목" hint={<>비워 두면 글 제목을 써요. <Counter value={metaTitle} soft={60} hard={70} /></>} error={errors?.meta_title}>
            {(p) => (
              <TextInput
                {...p}
                value={metaTitle}
                lang={L}
                onChange={(e) => {
                  setMetaTitle(e.target.value);
                  touch();
                }}
              />
            )}
          </Field>
          <Field id="meta_description" label="검색 설명" hint={<>비워 두면 요약을 써요. <Counter value={metaDesc} soft={155} hard={200} /></>} error={errors?.meta_description}>
            {(p) => (
              <TextArea
                {...p}
                value={metaDesc}
                lang={L}
                rows={2}
                onChange={(e) => {
                  setMetaDesc(e.target.value);
                  touch();
                }}
              />
            )}
          </Field>
          <ImagePick
            label="공유 이미지 (선택)"
            hint="카카오톡·SNS에 링크를 올릴 때 보이는 이미지예요. 비워 두면 제목으로 자동 만든 카드가 나가요 (영어 글은 기본 카드)."
            value={og}
            locale={L}
            onPick={(m) => {
              setOg(m);
              touch();
            }}
            onClear={() => {
              setOg(null);
              touch();
            }}
            error={errors?.og}
          />
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={saving || conflict}>
          {saving ? "저장 중…" : submitLabel}
        </Button>
        <Link href="/admin/blog" className="min-h-11 px-3 py-2.5 text-[15px] underline underline-offset-4">
          목록으로
        </Link>
      </div>
    </form>
  );
}

/** Translation, version history and delete: plain server-action forms, rendered next to (not inside) the editor form. */
export function PostSidePanels({ postId, locale, sibling, versions, status }: { postId: string; locale: "ko" | "en"; sibling: Sibling; versions: VersionRow[]; status: Status }) {
  const other = locale === "ko" ? "영어" : "한국어";
  return (
    <div className="grid gap-6">
      <Card title="번역">
        {sibling ? (
          <div className="grid gap-3">
            <p className="text-[15px]">
              {other} 버전이 있어요: <b>{sibling.title || "(제목 없음)"}</b> <Badge>{STATUS_LABEL[sibling.status]}</Badge>
            </p>
            <div>
              <LinkButton href={`/admin/blog/${sibling.id}`}>{other} 버전 편집</LinkButton>
            </div>
          </div>
        ) : (
          <form action={createTranslation} className="grid gap-3">
            <input type="hidden" name="id" value={postId} />
            <p className="text-[15px]">같은 글의 {other} 버전을 새 초안으로 만들어요. 제목과 본문이 복사되니 번역해서 고쳐 주세요. 두 글은 서로 연결돼요.</p>
            <div>
              <SubmitButton variant="secondary" pendingLabel="만드는 중…">
                {other} 버전 만들기
              </SubmitButton>
            </div>
          </form>
        )}
      </Card>

      <Card title={`버전 기록 (${versions.length})`}>
        {versions.length === 0 ? (
          <p className="text-[15px] text-gray">아직 기록이 없어요. &quot;저장&quot;, &quot;예약&quot;, &quot;발행&quot;을 누를 때마다 한 버전씩 남겨요. (자동 저장은 남기지 않아요.)</p>
        ) : (
          <ul className="divide-y divide-line">
            {versions.map((v) => (
              <li key={v.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0 text-[15px]">
                  <p className="font-bold">
                    v{v.version} <span className="font-normal text-gray">· {v.note ?? "저장"}</span>
                  </p>
                  <p className="truncate text-[14px] text-gray">
                    {formatKst(v.created_at)} · {v.created_by ?? "-"} · {v.title || "(제목 없음)"}
                  </p>
                </div>
                <form action={restoreVersion}>
                  <input type="hidden" name="postId" value={postId} />
                  <input type="hidden" name="versionId" value={v.id} />
                  <ConfirmButton variant="secondary" question={`v${v.version}으로 되돌릴까요? 지금 내용은 기록에 남겨요.`} confirmLabel="되돌리기">
                    복원
                  </ConfirmButton>
                </form>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card title="글 지우기">
        <form action={deletePost} className="grid gap-3">
          <input type="hidden" name="id" value={postId} />
          <p className="text-[15px]">{status === "draft" ? "이 초안을 지워요." : "공개된 글이면 홈페이지에서도 바로 사라져요."} 지우면 버전 기록도 함께 없어지고 되돌릴 수 없어요.</p>
          <div>
            <ConfirmButton question="정말 이 글을 지울까요?" confirmLabel="네, 지워요">
              글 지우기
            </ConfirmButton>
          </div>
        </form>
      </Card>
    </div>
  );
}
