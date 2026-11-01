import type { Metadata } from "next";
import { site } from "@/lib/content";

/**
 * 개인정보처리방침 (draft). Covers the website contact form only.
 * TODO(content): fill 사업자 정보 / 개인정보 보호책임자 and have the final text reviewed before launch.
 * If the form collects new fields or a new processor is added, update §1 and §4 and the effective date.
 */
export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: `${site.name} 웹사이트의 개인정보 수집·이용과 보관, 파기 기준을 안내해요.`,
  alternates: { canonical: "/privacy" },
};

const EFFECTIVE_DATE = "2026년 11월 1일";
const OWNER = site.name; // TODO(content): 상호(법인명)로 교체

const sections: { title: string; body: React.ReactNode }[] = [
  {
    title: "1. 수집하는 개인정보 항목",
    body: (
      <>
        <p>웹사이트 문의 양식을 통해 아래 정보를 받아요.</p>
        <ul>
          <li>필수: 답장받을 이메일, 문의 내용, 문의 분야</li>
          <li>선택: 이름 또는 회사명</li>
          <li>자동 수집: 접속 IP를 복원할 수 없게 변환한 값(해시), 브라우저 정보(User-Agent), 접수 시각. 스팸과 반복 전송을 막는 용도로만 써요.</li>
        </ul>
      </>
    ),
  },
  {
    title: "2. 수집·이용 목적",
    body: <p>문의 확인과 답변, 견적·상담 진행, 스팸 및 부정 이용 방지에만 이용해요. 마케팅이나 광고 목적으로는 쓰지 않아요.</p>,
  },
  {
    title: "3. 보유 및 이용 기간",
    body: (
      <p>
        문의가 종료된 날로부터 <strong>1년</strong> 동안 보관한 뒤 지체 없이 파기해요. 계약으로 이어진 경우에는 관련 법령(전자상거래법 등)이 정한 기간 동안 보관할 수 있어요.
      </p>
    ),
  },
  {
    title: "4. 처리 위탁 및 국외 이전",
    body: (
      <>
        <p>원활한 서비스 운영을 위해 아래 업체에 처리를 맡기고 있어요. 정보는 암호화된 통신(HTTPS)으로 전송돼요.</p>
        <ul>
          <li>InsForge: 문의 내용 저장(데이터베이스). 저장 위치는 아시아·태평양(ap-southeast) 리전 클라우드 서버예요.</li>
          <li>InsForge 이메일 발송(Amazon Web Services SES): 문의 접수 알림 메일 발송</li>
        </ul>
        <p>이전 시점은 문의를 보내는 즉시이고, 보유 기간은 위 3항과 같아요. 국외 이전을 원하지 않으시면 문의 양식 대신 이메일로 직접 연락해 주세요.</p>
      </>
    ),
  },
  {
    title: "5. 제3자 제공",
    body: <p>법령에 근거한 요청이 있는 경우를 제외하고, 이용자의 개인정보를 제3자에게 제공하지 않아요.</p>,
  },
  {
    title: "6. 파기 절차와 방법",
    body: <p>보유 기간이 지난 정보는 데이터베이스에서 복구할 수 없는 방법으로 삭제해요. 출력물이 있다면 분쇄하거나 소각해요.</p>,
  },
  {
    title: "7. 이용자의 권리",
    body: (
      <p>
        언제든 본인 정보의 열람, 정정, 삭제, 처리 정지를 요청할 수 있어요. <a href={`mailto:${site.email}`}>{site.email}</a>로 요청하시면 지체 없이 처리해 드려요.
      </p>
    ),
  },
  {
    title: "8. 개인정보 보호책임자",
    body: (
      <ul>
        {/* TODO(content): 실제 책임자 이름/직책으로 교체 */}
        <li>책임자: {OWNER} 대표</li>
        <li>
          연락처: <a href={`mailto:${site.email}`}>{site.email}</a>
        </li>
      </ul>
    ),
  },
  {
    title: "9. 쿠키",
    body: <p>이 웹사이트는 로그인이나 광고를 위한 쿠키를 쓰지 않아요.</p>,
  },
  {
    title: "10. 고지 의무",
    body: <p>이 방침의 내용이 바뀌면 시행 7일 전부터 이 페이지를 통해 알려 드려요.</p>,
  },
];

export default function PrivacyPage() {
  return (
    <section className="wrap py-16 md:py-24">
      <p className="label text-gray">Privacy</p>
      <h1 className="mt-6 text-h1 text-balance">개인정보처리방침</h1>
      <p className="mt-5 max-w-[680px] text-lead text-gray text-pretty">
        {OWNER}는 이용자의 개인정보를 중요하게 생각하고, 「개인정보 보호법」을 지켜요. 이 방침은 웹사이트 문의 양식에 적용돼요.
      </p>
      <p className="mt-4 font-mono text-meta text-gray">시행일 {EFFECTIVE_DATE}</p>

      <div className="mt-12 max-w-[760px] border-t-2 border-ink">
        {sections.map((s) => (
          <article key={s.title} className="border-b-2 border-ink py-8">
            <h2 className="text-title">{s.title}</h2>
            <div className="mt-4 flex flex-col gap-3 text-body text-pretty [&_a]:font-bold [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-red-text [&_li]:relative [&_li]:pl-5 [&_li]:before:absolute [&_li]:before:left-0 [&_li]:before:content-['–'] [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2">
              {s.body}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
