"use client";

import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef, useState } from "react";
import { sanitizeUrl, type PostDoc } from "@/lib/post-doc";
import { MediaPicker } from "../media/media-picker";
import { cx } from "../cx";

/** Image node + the media id/size we store with it (so the media library can tell where an image is used). */
const ArticleImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      mediaId: { default: null, parseHTML: (el) => el.getAttribute("data-media-id"), renderHTML: (a) => (a.mediaId ? { "data-media-id": a.mediaId } : {}) },
    };
  },
});

const contentClass = cx(
  "min-h-[360px] px-4 py-3 text-[17px] leading-[1.8] outline-none",
  "[&_p]:my-3 [&_h2]:mb-3 [&_h2]:mt-8 [&_h2]:border-t-2 [&_h2]:border-ink [&_h2]:pt-4 [&_h2]:text-[26px] [&_h2]:font-bold [&_h2]:leading-snug",
  "[&_h3]:mb-2 [&_h3]:mt-6 [&_h3]:text-[21px] [&_h3]:font-bold",
  "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_li_p]:my-1",
  "[&_blockquote]:my-4 [&_blockquote]:border-l-4 [&_blockquote]:border-ink [&_blockquote]:pl-4 [&_blockquote]:text-[19px]",
  "[&_pre]:my-4 [&_pre]:overflow-x-auto [&_pre]:bg-concrete [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-[15px]",
  "[&_code]:bg-concrete [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.9em] [&_pre_code]:bg-transparent [&_pre_code]:p-0",
  "[&_a]:underline [&_a]:underline-offset-4 [&_hr]:my-6 [&_hr]:border-0 [&_hr]:border-t-2 [&_hr]:border-ink",
  "[&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_img.ProseMirror-selectednode]:outline [&_img.ProseMirror-selectednode]:outline-4 [&_img.ProseMirror-selectednode]:outline-[#2f55ff]",
  "[&_.is-editor-empty:first-child]:before:pointer-events-none [&_.is-editor-empty:first-child]:before:float-left [&_.is-editor-empty:first-child]:before:h-0 [&_.is-editor-empty:first-child]:before:text-placeholder [&_.is-editor-empty:first-child]:before:content-[attr(data-placeholder)]",
);

type Tool = { id: string; label: string; text: string; active: () => boolean; run: () => void; disabled?: boolean };

function useTools(editor: Editor | null, askLink: () => void): Tool[] {
  // Re-render the toolbar when the selection/format changes.
  useEditorState({
    editor,
    selector: (s) => (s.editor ? [s.editor.isActive("bold"), s.editor.isActive("italic"), s.editor.isActive("heading", { level: 2 }), s.editor.isActive("heading", { level: 3 }), s.editor.isActive("bulletList"), s.editor.isActive("orderedList"), s.editor.isActive("blockquote"), s.editor.isActive("link"), s.editor.isActive("codeBlock")].join() : ""),
  });
  if (!editor) return [];
  const c = () => editor.chain().focus();
  return [
    { id: "h2", label: "제목 2", text: "제목", active: () => editor.isActive("heading", { level: 2 }), run: () => c().toggleHeading({ level: 2 }).run() },
    { id: "h3", label: "제목 3", text: "소제목", active: () => editor.isActive("heading", { level: 3 }), run: () => c().toggleHeading({ level: 3 }).run() },
    { id: "bold", label: "굵게 (Ctrl+B)", text: "굵게", active: () => editor.isActive("bold"), run: () => c().toggleBold().run() },
    { id: "italic", label: "기울임 (Ctrl+I)", text: "기울임", active: () => editor.isActive("italic"), run: () => c().toggleItalic().run() },
    { id: "ul", label: "글머리 목록", text: "목록", active: () => editor.isActive("bulletList"), run: () => c().toggleBulletList().run() },
    { id: "ol", label: "번호 목록", text: "번호", active: () => editor.isActive("orderedList"), run: () => c().toggleOrderedList().run() },
    { id: "quote", label: "인용", text: "인용", active: () => editor.isActive("blockquote"), run: () => c().toggleBlockquote().run() },
    { id: "link", label: "링크 넣기·고치기", text: "링크", active: () => editor.isActive("link"), run: askLink },
    { id: "code", label: "코드 블록", text: "코드", active: () => editor.isActive("codeBlock"), run: () => c().toggleCodeBlock().run() },
    { id: "hr", label: "구분선", text: "구분선", active: () => false, run: () => c().setHorizontalRule().run() },
  ];
}

export type EditorHandle = { getDoc: () => PostDoc };

export function TiptapEditor({
  initialDoc,
  locale,
  onChange,
  invalid,
  describedBy,
}: {
  initialDoc: PostDoc;
  locale: "ko" | "en";
  onChange: (doc: PostDoc) => void;
  invalid?: boolean;
  describedBy?: string;
}) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkValue, setLinkValue] = useState("");
  const [linkError, setLinkError] = useState<string | null>(null);
  const linkInput = useRef<HTMLInputElement>(null);
  const toolbar = useRef<HTMLDivElement>(null);
  const [roving, setRoving] = useState(0);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        // Only what the public renderer can show. (Anything else would be silently dropped on save.)
        underline: false,
        strike: false,
        link: { openOnClick: false, autolink: false, isAllowedUri: (url) => !!sanitizeUrl(url), HTMLAttributes: { rel: "noopener noreferrer" } },
      }),
      ArticleImage.configure({ inline: false, allowBase64: false }),
      Placeholder.configure({ placeholder: "여기에 글을 써 보세요. 위 도구 모음으로 제목, 목록, 이미지 등을 넣을 수 있어요." }),
    ],
    content: initialDoc,
    onUpdate: ({ editor: e }) => onChange(e.getJSON() as PostDoc),
    editorProps: {
      attributes: {
        class: contentClass,
        role: "textbox",
        "aria-multiline": "true",
        "aria-label": "본문",
        ...(describedBy ? { "aria-describedby": describedBy } : {}),
        lang: locale,
      },
    },
  });

  const askLink = () => {
    if (!editor) return;
    setLinkValue((editor.getAttributes("link").href as string | undefined) ?? "");
    setLinkError(null);
    setLinkOpen(true);
  };
  useEffect(() => {
    if (linkOpen) linkInput.current?.focus();
  }, [linkOpen]);

  const applyLink = () => {
    if (!editor) return;
    const v = linkValue.trim();
    if (!v) {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
    } else {
      const href = sanitizeUrl(v);
      if (!href) return setLinkError("http://, https://, mailto: 또는 / 로 시작하는 주소만 쓸 수 있어요.");
      editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    }
    setLinkOpen(false);
  };

  const tools = useTools(editor, askLink);

  // Roving tabindex + arrow keys for the toolbar (one tab stop; Left/Right/Home/End move inside).
  const onToolbarKey = (e: React.KeyboardEvent) => {
    const buttons = Array.from(toolbar.current?.querySelectorAll<HTMLButtonElement>("button") ?? []);
    const i = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (i < 0) return;
    const move = (n: number) => {
      e.preventDefault();
      const next = (n + buttons.length) % buttons.length;
      setRoving(next);
      buttons[next]?.focus();
    };
    if (e.key === "ArrowRight") move(i + 1);
    else if (e.key === "ArrowLeft") move(i - 1);
    else if (e.key === "Home") move(0);
    else if (e.key === "End") move(buttons.length - 1);
  };

  const btn = "inline-flex min-h-11 min-w-11 items-center justify-center border px-3 text-[15px] font-bold leading-tight";

  return (
    <div className={cx("border bg-paper", invalid ? "border-[#b42318]" : "border-ink")}>
      <div ref={toolbar} role="toolbar" aria-label="글 서식 도구" aria-controls="post-body" onKeyDown={onToolbarKey} className="flex flex-wrap gap-1 border-b border-line bg-[#f6f6f4] p-1.5">
        {tools.map((t, i) => (
          <button
            key={t.id}
            type="button"
            title={t.label}
            aria-label={t.label}
            aria-pressed={t.id === "hr" ? undefined : t.active()}
            tabIndex={roving === i ? 0 : -1}
            onFocus={() => setRoving(i)}
            onClick={t.run}
            className={cx(btn, t.active() ? "border-ink bg-ink text-paper" : "border-transparent hover:bg-concrete")}
          >
            {t.text}
          </button>
        ))}
        <MediaPicker
          locale={locale}
          title="본문에 넣을 이미지"
          variant="ghost"
          onSelect={(m) => {
            const alt = (locale === "en" ? m.alt_en || m.alt_ko : m.alt_ko) || "";
            editor
              ?.chain()
              .focus()
              .setImage({ src: m.url, alt, width: m.width ?? undefined, height: m.height ?? undefined, ...({ mediaId: m.id } as object) })
              .run();
          }}
        >
          이미지
        </MediaPicker>
      </div>
      {linkOpen && (
        <div className="flex flex-wrap items-start gap-2 border-b border-line bg-[#eef1ff] p-2">
          <div className="grid min-w-[240px] flex-1 gap-1">
            <label htmlFor="link-url" className="text-[14px] font-bold">
              링크 주소 (비우면 링크를 지워요)
            </label>
            <input
              id="link-url"
              ref={linkInput}
              value={linkValue}
              onChange={(e) => setLinkValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyLink();
                } else if (e.key === "Escape") {
                  setLinkOpen(false);
                  editor?.commands.focus();
                }
              }}
              placeholder="https://"
              aria-invalid={linkError ? true : undefined}
              aria-describedby={linkError ? "link-url-err" : undefined}
              className="block min-h-11 w-full border border-ink bg-paper px-3 text-[16px]"
            />
            {linkError && (
              <p id="link-url-err" className="text-[14px] font-bold text-[#b42318]">
                {linkError}
              </p>
            )}
          </div>
          <button type="button" onClick={applyLink} className="mt-6 min-h-11 bg-ink px-4 text-[15px] font-bold text-paper">
            적용
          </button>
          <button
            type="button"
            onClick={() => {
              setLinkOpen(false);
              editor?.commands.focus();
            }}
            className="mt-6 min-h-11 px-3 text-[15px] underline underline-offset-4"
          >
            취소
          </button>
        </div>
      )}
      <div id="post-body">
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
