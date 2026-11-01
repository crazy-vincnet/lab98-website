/**
 * /llms.txt and /llms-full.txt bodies (https://llmstxt.org), generated from content.ts / praise-tool.ts so the
 * AI-facing summary never drifts from the site. Pure functions of static data → both routes prerender at build.
 */
import { aboutCopy } from "@/components/about/copy";
import { CONTACT_HREF, COOKIES_PATH, INSIGHTS_PATH, PRAISE_TOOL_PATH, PRIVACY_PATH, PROJECTS_PATH, TERMS_PATH, divisionHref, insightHref, projectHref } from "@/components/experiments/paths";
import { projectsCopy } from "@/components/experiments/copy";
import { notesCopy } from "@/components/notes/copy";
import { divisions, faqs, formatDate, notes, projects, site, type Faq, type FaqKey } from "@/lib/content";
import { praiseTool as P } from "@/lib/praise-tool";
import { abs } from "@/lib/structured-data";

const link = (label: string, path: string, desc?: string) => `- [${label}](${abs(path)})${desc ? `: ${desc}` : ""}`;
const sortedNotes = [...notes].sort((a, b) => b.date.localeCompare(a.date));
const biz = site.business;
const bizLine = `${biz.name} · 대표 ${biz.representative} · 사업자등록번호 ${biz.registrationNumber}`;

const summary = `${site.description} 슬로건은 “${site.slogan}”(${site.sloganEn})예요. ${site.name}은 ${biz.name}의 브랜드이고, 파운더는 ${site.founder.display}이에요.`;

const faqTitles: Record<FaqKey, string> = { home: "Lab98", dev: "Lab98 Dev", ai: "Lab98 AI", faith: "Lab98 Faith", praiseTool: "Praise Tool" };
const faqPaths: Record<FaqKey, string> = { home: "/", dev: divisionHref("dev"), ai: divisionHref("ai"), faith: divisionHref("faith"), praiseTool: PRAISE_TOOL_PATH };

const join = (lines: (string | false | undefined)[]) => lines.filter((l) => l !== false && l !== undefined).join("\n") + "\n";

export function llmsTxt() {
  return join([
    `# ${site.name}`,
    "",
    `> ${summary}`,
    "",
    "한국어로 운영하는 사이트예요. 아래 링크는 모두 한국어 페이지이고, 사실 정보를 한 파일로 모은 버전은 /llms-full.txt에 있어요.",
    "",
    "## 회사",
    "",
    link("홈", "/", "세 사업부(Dev·AI·Faith), 프로젝트, 일하는 방식, 자주 묻는 질문, 문의 양식"),
    link(aboutCopy.meta.title, "/about", aboutCopy.meta.description),
    "",
    "## 서비스",
    "",
    ...divisions.map((d) => link(`${d.name} — ${d.role}`, divisionHref(d.slug), d.summary)),
    "",
    "## Praise Tool",
    "",
    link(`${P.hero.title} — ${P.hero.sub}`, PRAISE_TOOL_PATH, P.meta.description),
    "",
    "## 프로젝트",
    "",
    link(projectsCopy.meta.title, PROJECTS_PATH, projectsCopy.meta.description),
    ...projects.map((p) => link(p.title, projectHref(p.slug), p.summary)),
    "",
    "## 인사이트",
    "",
    link(notesCopy.meta.title, INSIGHTS_PATH, notesCopy.meta.description),
    ...sortedNotes.map((n) => link(n.title, insightHref(n.slug), n.excerpt)),
    "",
    "## 문의",
    "",
    link("문의하기", CONTACT_HREF, `문의 양식 또는 ${site.email}. ${site.replyTime}.`),
    "",
    "## 법적 고지",
    "",
    link("개인정보처리방침", PRIVACY_PATH),
    link("이용약관", TERMS_PATH),
    link("쿠키 정책", COOKIES_PATH),
    "",
    "## Optional",
    "",
    link("llms-full.txt", "/llms-full.txt", "회사 정보, 서비스, 가격, Praise Tool 기능, 프로젝트, 자주 묻는 질문 전체"),
  ]);
}

const faqBlock = (items: readonly Faq[]) => items.flatMap((f) => [`**Q. ${f.q}**`, `A. ${f.a}`, ""]);

export function llmsFullTxt() {
  return join([
    `# ${site.name}`,
    "",
    `> ${summary}`,
    "",
    "## 회사 정보",
    "",
    `- 이름: ${site.name}`,
    `- 웹사이트: ${abs("/")}`,
    `- 슬로건: ${site.slogan} (${site.sloganEn})`,
    `- 파운더의 말: “${site.sloganOriginal}”`,
    `- 이름의 뜻: ${site.nameMeaning}`,
    `- 파운더: ${site.founder.display}, ${site.founder.role}`,
    `- 사업자: ${bizLine}`,
    `- 이메일: ${site.email} (${site.replyTime})`,
    `- 회사 소개: ${abs("/about")}`,
    "",
    "## 서비스",
    "",
    ...divisions.flatMap((d) => [
      `### ${d.name} — ${d.role}`,
      "",
      `URL: ${abs(divisionHref(d.slug))}`,
      "",
      d.summary,
      "",
      d.description,
      "",
      "제공 서비스:",
      ...d.services.map((s) => `- ${s.title}: ${s.body}`),
      "",
      "진행 방식:",
      ...d.process.map((s, i) => `${i + 1}. ${s.title}: ${s.body}`),
      "",
      "주요 정보:",
      ...d.facts.map((f) => `- ${f.label}: ${f.value}`),
      ...(d.status ? [`- 상태: ${d.status.label} — ${d.status.body}`] : []),
      "",
    ]),
    "가격: Dev 제작은 200만 원부터 시작하고 범위에 따라 견적을 드려요. AI 교육은 공개된 가격표가 없고 대상·인원·주제에 따라 안내해요.",
    "",
    `## ${P.hero.title} — ${P.hero.sub}`,
    "",
    `URL: ${abs(PRAISE_TOOL_PATH)}`,
    "",
    P.hero.lead,
    "",
    `- 만든 곳: Lab98 Faith (${site.name})`,
    `- ${P.hero.priceLabel}: ${P.pricing.price}, ${P.pricing.plan} (${P.hero.licenseNote})`,
    `- ${P.hero.launchLabel}: ${P.hero.launch}`,
    `- 지원: ${P.hero.badges.join(" / ")}`,
    "",
    `### ${P.glance.title}`,
    "",
    ...P.glance.items.map((i) => `- ${i.title}: ${i.body}`),
    "",
    `### ${P.features.title}`,
    "",
    ...P.features.groups.flatMap((g) => [`#### ${g.title}`, "", ...g.items.map((i) => `- ${i.title}: ${i.body}`), ""]),
    `### ${P.safety.title}`,
    "",
    ...P.safety.items.map((i) => `- ${i.title}: ${i.body}`),
    "",
    `### ${P.requirements.title}`,
    "",
    ...P.requirements.rows.map((r) => `- ${r.label}: ${r.value}`),
    `- 참고: ${P.requirements.note}`,
    "",
    "## 프로젝트",
    "",
    projectsCopy.meta.description,
    "",
    ...projects.flatMap((p) => [
      `### ${p.title}`,
      "",
      `- 기관: ${p.client}${p.clientEn ? ` (${p.clientEn})` : ""}`,
      `- 사이트: ${p.url}`,
      `- 사례 페이지: ${abs(projectHref(p.slug))}`,
      `- 소개: ${p.summary}`,
      `- 범위: ${p.scope} · 유형: ${p.type}${p.languages ? ` · 언어: ${p.languages.join(", ")}` : ""}`,
      "- 주요 기능:",
      ...p.highlights.map((h) => `  - ${h.title}: ${h.body}`),
      "",
    ]),
    "## 인사이트",
    "",
    ...sortedNotes.map((n) => `- [${n.title}](${abs(insightHref(n.slug))}) — ${formatDate(n.date)}, ${n.author}. ${n.excerpt}`),
    "",
    "## 자주 묻는 질문",
    "",
    ...(Object.keys(faqs) as FaqKey[]).flatMap((k) => [`### ${faqTitles[k]} (${abs(faqPaths[k])})`, "", ...faqBlock(faqs[k])]),
    "## 문의",
    "",
    `- 이메일: ${site.email}`,
    `- 문의 양식: ${abs(CONTACT_HREF)}`,
    `- 답장: ${site.replyTime}`,
    "",
    "## 법적 고지",
    "",
    `- 사업자: ${bizLine}`,
    link("개인정보처리방침", PRIVACY_PATH),
    link("이용약관", TERMS_PATH),
    link("쿠키 정책", COOKIES_PATH),
  ]);
}
