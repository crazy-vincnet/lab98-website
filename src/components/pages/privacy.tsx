import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/components/seo/metadata";
import { ORG_ID, breadcrumb, graph, webPage } from "@/lib/structured-data";
import Link from "next/link";
import { site } from "@/lib/content";
import { getContent } from "@/lib/get-content";
import { localePath, type Locale } from "@/lib/i18n";
import { COOKIES_PATH, PRAISE_TOOL_PATH, PRIVACY_REQUEST_PATH, UNSUBSCRIBE_PATH } from "@/components/experiments/paths";
import { LegalDoc, LegalTable, type LegalSection } from "@/components/legal/legal-doc";
import { ButtonLink } from "@/components/ui";

/**
 * 개인정보처리방침 (개인정보 보호법 제30조 · 개인정보위 작성지침 기준).
 * If a form collects new fields, a processor is added, or browser storage changes, update §2/§3/§6/§9,
 * the effective date, and add a history entry.
 */
const PATH = "/privacy";



const EFFECTIVE_DATE = "2026년 11월 1일";
const EFFECTIVE_DATE_EN = "November 1, 2026";
const OWNER_EN = "JJdream (제이제이드림, brand name Lab98)";
const enBiz = getContent("en").site.business;
/** Keep in sync with site.business.name. */
const OWNER = "제이제이드림(JJdream, 브랜드명 Lab98)";
const biz = site.business;
const host = site.url.replace(/^https?:\/\//, "");
const mail = <a href={`mailto:${site.email}`}>{site.email}</a>;
const ext = (href: string, label: string) => (
  <a href={href} target="_blank" rel="noopener noreferrer">
    {label}
  </a>
);

const buildSectionsKo = (L: Locale): LegalSection[] => [
  {
    id: "purpose",
    title: "개인정보의 처리 목적",
    body: (
      <>
        <p>회사는 아래 목적으로만 개인정보를 처리해요. 목적이 바뀌면 미리 알리고, 필요한 경우 별도 동의를 받아요.</p>
        <ul>
          <li>문의 양식: 문의 확인과 답변, 견적·상담 진행, 스팸·반복 전송 방지</li>
          <li>
            <Link href={localePath(L, PRAISE_TOOL_PATH)}>Praise Tool</Link> 출시 알림 신청: 2026년 11월 11일 출시 안내 메일 1회 발송, 스팸·반복 신청 방지
          </li>
          <li>개인정보 요청: 열람·정정·삭제·처리정지 요청의 처리와 본인 확인, 처리 결과 기록</li>
          <li>수신거부: 수신을 거부한 분께 다시 메일을 보내지 않도록 관리</li>
        </ul>
        <p>마케팅이나 광고 목적으로는 개인정보를 쓰지 않아요.</p>
      </>
    ),
  },
  {
    id: "items",
    title: "처리하는 개인정보 항목",
    body: (
      <>
        <p>개인정보는 이용자가 웹사이트 양식에 직접 입력해 보낸 경우에만 수집해요. 회원가입은 없어요.</p>
        <LegalTable
          caption="양식별 처리 항목"
          columns={["구분", "필수 항목", "선택 항목", "자동 수집"]}
          rows={[
            ["문의 양식", "이메일, 문의 내용, 문의 분야", "이름 또는 회사명", "IP 해시(복원 불가), 접수 시각"],
            ["Praise Tool 출시 알림 신청", "이메일", "교회·단체명", "IP 해시(복원 불가), 신청 시각"],
            ["개인정보 요청", "이메일, 요청 유형, 요청 내용", "없음", "접수 시각"],
            ["수신거부", "이메일", "없음", "등록 시각"],
          ]}
        />
        <p>IP 해시는 접속 IP를 원래 값으로 되돌릴 수 없게 변환한 값으로, 스팸과 반복 전송을 막는 데에만 써요. IP 주소 원문은 저장하지 않아요.</p>
      </>
    ),
  },
  {
    id: "retention",
    title: "개인정보의 보유 및 이용 기간",
    body: (
      <>
        <LegalTable
          caption="보유 및 이용 기간"
          columns={["구분", "보유 기간", "파기 시점"]}
          rows={[
            ["문의 양식", "문의 종료 후 1년", "기간이 끝나면 자동 삭제"],
            ["Praise Tool 출시 알림 신청", "출시 안내 메일 발송 시까지", "발송 후 지체 없이, 늦어도 출시일로부터 30일 이내 자동 삭제"],
            ["개인정보 요청", "처리 결과 기록은 처리 완료 후 3년 보관(분쟁 대비)", "기간이 끝나면 삭제"],
            ["수신거부", "본인이 목록에서 삭제를 요청할 때까지", "요청 시 지체 없이 삭제"],
          ]}
        />
        <p>다른 법령이 일정 기간 보관을 요구하면 그 기간 동안 분리해 보관해요. 문의가 계약으로 이어지면 계약 관련 정보는 해당 계약과 관련 법령에 따라 따로 관리해요.</p>
      </>
    ),
  },
  {
    id: "destruction",
    title: "개인정보의 파기 절차 및 방법",
    body: (
      <ul>
        <li>파기 절차: 보유 기간이 지나거나 처리 목적을 이룬 정보는 정기적으로 실행되는 자동 삭제 작업으로 파기해요. 자동 삭제 대상이 아닌 정보는 확인한 뒤 지체 없이 직접 파기해요.</li>
        <li>파기 방법: 전자 정보는 데이터베이스에서 복구할 수 없는 방법으로 삭제해요. 종이 출력물이 있다면 분쇄하거나 소각해요.</li>
      </ul>
    ),
  },
  {
    id: "third-party",
    title: "개인정보의 제3자 제공",
    body: <p>회사는 개인정보를 제3자에게 제공하지 않아요. 다만 이용자가 따로 동의했거나 법령에 특별한 규정이 있는 경우(수사기관의 적법한 요청 등)는 예외예요.</p>,
  },
  {
    id: "outsourcing",
    title: "개인정보 처리 위탁 및 국외 이전",
    body: (
      <>
        <p>서비스 운영을 위해 아래 수탁자에게 개인정보 처리를 맡기고 있어요. 이 과정에서 개인정보가 국외에 저장·처리돼요.</p>
        <LegalTable
          caption="처리 위탁 및 국외 이전"
          columns={["수탁자", "위탁 업무", "이전 위치", "이전 항목"]}
          rows={[
            ["InsForge", "데이터베이스 보관, 서버 운영", "아시아·태평양(ap-southeast) 리전 클라우드 서버", "2항의 모든 항목"],
            ["Amazon Web Services(SES, InsForge를 통해 이용)", "접수 알림 메일, 출시 안내 메일 발송", "Amazon Web Services 클라우드 서버", "이메일, 메일 본문에 담긴 문의·신청 내용"],
          ]}
        />
        <ul>
          <li>이전 시점과 방법: 양식을 제출하는 즉시 암호화된 통신(HTTPS)으로 전송돼요.</li>
          <li>보유 및 이용 기간: 3항의 기간과 같아요.</li>
          <li>거부 방법: 국외 이전을 원하지 않으시면 양식 대신 {mail}로 직접 메일을 보내 주세요.</li>
        </ul>
        <p>수탁자나 위탁 업무가 바뀌면 이 방침에서 알려 드려요.</p>
      </>
    ),
  },
  {
    id: "rights",
    title: "정보주체의 권리와 행사 방법",
    body: (
      <>
        <p>이용자는 언제든 본인 개인정보의 열람, 정정, 삭제, 처리정지, 동의 철회를 요청할 수 있어요.</p>
        <ul>
          <li>
            요청 방법: <Link href={localePath(L, PRIVACY_REQUEST_PATH)}>개인정보 요청 양식</Link>을 쓰거나 {mail}로 메일을 보내 주세요.
          </li>
          <li>본인 확인: 기록된 이메일 주소에서 회신을 받아 본인인지 확인해요.</li>
          <li>처리 기간: 요청을 받은 날로부터 10일 이내에 처리하고 결과를 알려 드려요. 법령에 따라 요청을 제한하거나 거절할 때는 그 이유도 함께 알려 드려요.</li>
          <li>법정대리인이나 위임받은 사람을 통해서도 요청할 수 있어요. 이때는 위임 사실을 확인할 수 있는 자료가 필요해요.</li>
        </ul>
        <div>
          <ButtonLink href={localePath(L, PRIVACY_REQUEST_PATH)} variant="secondary" size="sm" className="min-h-11 no-underline! hover:text-paper!">
            개인정보 요청하기
          </ButtonLink>
        </div>
      </>
    ),
  },
  {
    id: "children",
    title: "만 14세 미만 아동의 개인정보",
    body: <p>회사는 만 14세 미만 아동의 개인정보를 받지 않아요. 만 14세 미만 아동의 정보가 접수된 것을 알게 되면 지체 없이 파기해요.</p>,
  },
  {
    id: "cookies",
    title: "개인정보 자동 수집 장치의 설치·운영 및 거부",
    body: (
      <>
        <p>
          이 웹사이트는 지금 쿠키를 설정하지 않고, 분석·광고용 외부 스크립트도 쓰지 않아요. 브라우저에 저장하는 것은 방문자가 고른 쿠키 동의 선택(<code className="font-mono text-code">lab98-consent</code>) 하나뿐이에요.
        </p>
        <p>
          방문 통계 도구를 도입하면 이 방침을 먼저 고친 뒤, 동의한 경우에만 작동하게 할게요. 자세한 내용은 <Link href={localePath(L, COOKIES_PATH)}>쿠키 정책</Link>에서 확인해 주세요.
        </p>
      </>
    ),
  },
  {
    id: "marketing",
    title: "광고성 정보 전송과 수신거부",
    body: (
      <>
        <p>회사는 지금 광고성 정보(마케팅 메일)를 보내지 않아요. 앞으로 보내게 되면 「정보통신망법」 제50조에 따라 미리 별도 동의를 받고, 제목에 “(광고)”를 표시하고, 모든 메일에 수신거부 방법을 넣을게요.</p>
        <p>
          메일을 받고 싶지 않으시면 <Link href={localePath(L, UNSUBSCRIBE_PATH)}>수신거부</Link> 페이지에서 언제든 신청할 수 있어요.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "개인정보의 안전성 확보 조치",
    body: (
      <ul>
        <li>전송 구간 암호화: 모든 통신은 HTTPS로 암호화돼요.</li>
        <li>접근 권한 최소화: 데이터베이스는 서버의 관리자 키로만 접근할 수 있고, 공개 키로는 접근할 수 없도록 행 단위 보안 정책(RLS)으로 막아 두었어요.</li>
        <li>최소 수집: IP 주소는 복원할 수 없는 해시 값으로만 저장해요.</li>
        <li>비밀 키 분리 보관: 접근 키는 소스 코드와 분리해 서버 환경에만 보관해요.</li>
      </ul>
    ),
  },
  {
    id: "officer",
    title: "개인정보 보호책임자",
    body: (
      <>
        <p>개인정보 처리에 관한 문의, 불만, 피해 구제는 아래 책임자에게 연락해 주세요. 지체 없이 답변하고 처리해 드려요.</p>
        <ul>
          <li>개인정보 보호책임자: {biz.representative} 대표</li>
          <li>연락처: {mail}</li>
        </ul>
      </>
    ),
  },
  {
    id: "remedy",
    title: "권익침해 구제 방법",
    body: (
      <>
        <p>개인정보 침해 신고나 상담이 필요하면 아래 기관에 문의할 수 있어요.</p>
        <LegalTable
          caption="권익침해 구제 기관"
          columns={["기관", "전화", "웹사이트"]}
          rows={[
            ["개인정보분쟁조정위원회", "1833-6972", ext("https://www.kopico.go.kr", "www.kopico.go.kr")],
            ["개인정보침해신고센터(한국인터넷진흥원)", "118", ext("https://privacy.kisa.or.kr", "privacy.kisa.or.kr")],
            ["대검찰청", "1301", ext("https://www.spo.go.kr", "www.spo.go.kr")],
            ["경찰청", "182", ext("https://ecrm.police.go.kr", "ecrm.police.go.kr")],
          ]}
        />
      </>
    ),
  },
  {
    id: "changes",
    title: "개인정보처리방침의 변경",
    body: (
      <p>이 방침은 {EFFECTIVE_DATE}부터 적용돼요. 내용이 바뀌면 시행 7일 전부터 이 페이지에 알리고, 이용자 권리에 중요한 변경은 시행 30일 전부터 알려 드려요. 지난 변경 내용은 아래 변경 이력에서 확인할 수 있어요.</p>
    ),
  },
];

const buildSectionsEn = (L: Locale): LegalSection[] => [
  {
    id: "purpose",
    title: "Purposes of processing",
    body: (
      <>
        <p>The Company processes personal information only for the purposes below. If a purpose changes, we will tell you in advance and, where required, ask for your separate consent.</p>
        <ul>
          <li>Inquiry form: confirming and answering your inquiry, handling quotes and consultations, and preventing spam and repeated submissions</li>
          <li>
            <Link href={localePath(L, PRAISE_TOOL_PATH)}>Praise Tool</Link> launch notification sign-up: sending one email announcing the November 11, 2026 launch, and preventing spam and repeated sign-ups
          </li>
          <li>Privacy requests: handling requests to access, correct, delete or suspend processing, verifying identity, and recording the result</li>
          <li>Unsubscribe: keeping track of people who have opted out so that we do not email them again</li>
        </ul>
        <p>We do not use personal information for marketing or advertising.</p>
      </>
    ),
  },
  {
    id: "items",
    title: "Personal information we process",
    body: (
      <>
        <p>We collect personal information only when you type it into a form on this website and submit it. There is no account registration.</p>
        <LegalTable
          caption="Items processed by form"
          columns={["Form", "Required", "Optional", "Collected automatically"]}
          rows={[
            ["Inquiry form", "Email, inquiry content, inquiry category", "Name or company name", "IP hash (cannot be reversed), time received"],
            ["Praise Tool launch notification sign-up", "Email", "Church or organization name", "IP hash (cannot be reversed), time of sign-up"],
            ["Privacy request", "Email, request type, request details", "None", "Time received"],
            ["Unsubscribe", "Email", "None", "Time registered"],
          ]}
        />
        <p>An IP hash is a value made from your IP address in a way that cannot be turned back into the original. We use it only to prevent spam and repeated submissions. We do not store the IP address itself.</p>
      </>
    ),
  },
  {
    id: "retention",
    title: "Retention and use period",
    body: (
      <>
        <LegalTable
          caption="Retention and use period"
          columns={["Form", "Retention period", "When it is destroyed"]}
          rows={[
            ["Inquiry form", "1 year after the inquiry is closed", "Deleted automatically when the period ends"],
            ["Praise Tool launch notification sign-up", "Until the launch announcement email is sent", "Deleted automatically without delay after sending, and no later than 30 days after the launch date"],
            ["Privacy request", "The record of the result is kept for 3 years after the request is completed (in case of disputes)", "Deleted when the period ends"],
            ["Unsubscribe", "Until you ask to be removed from the list", "Deleted without delay on request"],
          ]}
        />
        <p>If another law requires information to be kept for a certain period, we keep it separately for that period. If an inquiry leads to a contract, information related to the contract is managed separately under that contract and the applicable laws.</p>
      </>
    ),
  },
  {
    id: "destruction",
    title: "Destruction procedure and method",
    body: (
      <ul>
        <li>Procedure: information whose retention period has ended or whose purpose has been fulfilled is destroyed by an automatic deletion job that runs regularly. Information that is not covered by automatic deletion is destroyed manually without delay once we have confirmed it.</li>
        <li>Method: electronic information is deleted from the database in a way that cannot be recovered. Any paper printouts are shredded or incinerated.</li>
      </ul>
    ),
  },
  {
    id: "third-party",
    title: "Provision to third parties",
    body: <p>The Company does not provide personal information to third parties. The exceptions are where you have separately consented, or where the law specifically provides otherwise (for example, a lawful request from an investigative authority).</p>,
  },
  {
    id: "outsourcing",
    title: "Outsourced processing and overseas transfer",
    body: (
      <>
        <p>To run the service, we entrust the processing of personal information to the processors below. As a result, personal information is stored and processed outside Korea.</p>
        <LegalTable
          caption="Outsourced processing and overseas transfer"
          columns={["Processor", "Entrusted task", "Transfer location", "Items transferred"]}
          rows={[
            ["InsForge", "Database storage and server operation", "Cloud servers in the Asia-Pacific (ap-southeast) region", "All items in Section 2"],
            ["Amazon Web Services (SES, used through InsForge)", "Sending receipt notification emails and launch announcement emails", "Amazon Web Services cloud servers", "Email address, and the inquiry or sign-up content included in the email body"],
          ]}
        />
        <ul>
          <li>When and how it is transferred: transferred over encrypted communication (HTTPS) as soon as you submit a form.</li>
          <li>Retention and use period: the same as in Section 3.</li>
          <li>How to refuse: if you do not want your information transferred overseas, please email {mail} directly instead of using the form.</li>
        </ul>
        <p>If a processor or the entrusted task changes, we will say so in this policy.</p>
      </>
    ),
  },
  {
    id: "rights",
    title: "Your rights and how to exercise them",
    body: (
      <>
        <p>You can ask at any time to access, correct or delete your personal information, to suspend its processing, or to withdraw your consent.</p>
        <ul>
          <li>
            How to ask: use the <Link href={localePath(L, PRIVACY_REQUEST_PATH)}>privacy request form</Link> or email {mail}.
          </li>
          <li>Identity check: we confirm it is you by getting a reply from the email address on record.</li>
          <li>Time to respond: we handle the request and tell you the result within 10 days of receiving it. If we limit or refuse a request as the law allows, we will also tell you why.</li>
          <li>You can also make a request through a legal representative or an authorized agent. In that case, we need documents that confirm the authorization.</li>
        </ul>
        <div>
          <ButtonLink href={localePath(L, PRIVACY_REQUEST_PATH)} variant="secondary" size="sm" className="min-h-11 no-underline! hover:text-paper!">
            Make a privacy request
          </ButtonLink>
        </div>
      </>
    ),
  },
  {
    id: "children",
    title: "Children under 14",
    body: <p>The Company does not accept personal information from children under 14. If we learn that information from a child under 14 has been submitted, we will destroy it without delay.</p>,
  },
  {
    id: "cookies",
    title: "Automatic collection tools: installation, operation and refusal",
    body: (
      <>
        <p>
          This website does not currently set cookies, and it does not use external analytics or advertising scripts. The only thing it stores in your browser is your cookie consent choice (<code className="font-mono text-code">lab98-consent</code>).
        </p>
        <p>
          If we add a visitor statistics tool, we will update this policy first and make the tool run only if you consent. For details, see the <Link href={localePath(L, COOKIES_PATH)}>Cookie Policy</Link>.
        </p>
      </>
    ),
  },
  {
    id: "marketing",
    title: "Promotional messages and opting out",
    body: (
      <>
        <p>The Company does not currently send promotional messages (marketing emails). If we do in the future, we will get your separate consent in advance as required by Article 50 of the Act on Promotion of Information and Communications Network Utilization and Information Protection, mark the subject line with “(advertisement)”, and include opt-out instructions in every email.</p>
        <p>
          If you do not want to receive email, you can opt out at any time on the <Link href={localePath(L, UNSUBSCRIBE_PATH)}>unsubscribe</Link> page.
        </p>
      </>
    ),
  },
  {
    id: "security",
    title: "Security measures",
    body: (
      <ul>
        <li>Encryption in transit: all communication is encrypted with HTTPS.</li>
        <li>Least access: the database can be reached only with the server&apos;s administrator key. Row-level security (RLS) policies block access with the public key.</li>
        <li>Data minimization: IP addresses are stored only as hashes that cannot be reversed.</li>
        <li>Separate storage of secret keys: access keys are kept in the server environment, apart from the source code.</li>
      </ul>
    ),
  },
  {
    id: "officer",
    title: "Privacy officer",
    body: (
      <>
        <p>For questions, complaints or remedies about the handling of personal information, please contact the officer below. We will reply and act without delay.</p>
        <ul>
          <li>Privacy officer: {enBiz.representative}, Representative</li>
          <li>Contact: {mail}</li>
        </ul>
      </>
    ),
  },
  {
    id: "remedy",
    title: "Remedies for infringement of your rights",
    body: (
      <>
        <p>If you need to report a privacy violation or get advice, you can contact the agencies below.</p>
        <LegalTable
          caption="Agencies for remedies"
          columns={["Agency", "Phone", "Website"]}
          rows={[
            ["Personal Information Dispute Mediation Committee", "1833-6972", ext("https://www.kopico.go.kr", "www.kopico.go.kr")],
            ["Personal Information Infringement Report Center (Korea Internet & Security Agency)", "118", ext("https://privacy.kisa.or.kr", "privacy.kisa.or.kr")],
            ["Supreme Prosecutors' Office", "1301", ext("https://www.spo.go.kr", "www.spo.go.kr")],
            ["Korean National Police Agency", "182", ext("https://ecrm.police.go.kr", "ecrm.police.go.kr")],
          ]}
        />
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: (
      <p>This policy applies from {EFFECTIVE_DATE_EN}. If it changes, we will post a notice on this page starting 7 days before the change takes effect, and starting 30 days before for significant changes to your rights. You can see past changes in the revision history below.</p>
    ),
  },
];

const buildSections = (L: Locale): LegalSection[] => (L === "en" ? buildSectionsEn(L) : buildSectionsKo(L));

const history = {
  ko: [{ date: "2026. 11. 01", note: "제정" }],
  en: [{ date: "2026. 11. 01", note: "Established" }],
} as const;

const docMeta: Record<Locale, { title: string; description: string }> = {
  ko: { title: "개인정보처리방침", description: `${site.name}(${site.business.name})이 문의, 출시 알림 신청, 개인정보 요청, 수신거부를 처리하며 개인정보를 어떻게 수집·이용·보관·파기하는지 안내해요.` },
  en: {
    title: 'Privacy Policy',
    description: 'How Lab98 (JJdream) collects, uses, keeps and deletes personal information when handling inquiries, Praise Tool launch notification sign-ups, privacy requests and unsubscribe requests.',
  },
};

export const privacyMetadata = (locale: Locale): Metadata => pageMetadata({ ...docMeta[locale], path: PATH, locale });

export function PrivacyPage({ locale }: { locale: Locale }) {
  const { title, description } = docMeta[locale];
  const path = localePath(locale, PATH);
  const crumbs = [{ name: title, path }];
  const jsonLd = graph(webPage({ path, name: title, description, crumbs, extra: { publisher: { "@id": ORG_ID } }, locale }), breadcrumb(path, crumbs, locale));
  return (
    <>
      <JsonLd data={jsonLd} />
      <LegalDoc
        locale={locale}
        label="Privacy"
        title={title}
        intro={
          locale === "en" ? (
            <>
              <p>
                {OWNER_EN} (the “Company”) takes your personal information seriously and complies with the Personal Information Protection Act of Korea. This policy applies to the inquiry form, Praise Tool launch notification sign-up, privacy requests and unsubscribe requests on the {host} website.
              </p>
              <p className="mt-3 text-body-sm">This is an English translation for convenience; the Korean version prevails.</p>
            </>
          ) : (
            <p>
              {OWNER}(이하 “회사”)은 이용자의 개인정보를 중요하게 생각하고 「개인정보 보호법」을 지켜요. 이 방침은 {host} 웹사이트의 문의 양식, Praise Tool 출시 알림 신청, 개인정보 요청, 수신거부에 적용돼요.
            </p>
          )
        }
        effectiveDate={locale === "en" ? EFFECTIVE_DATE_EN : EFFECTIVE_DATE}
        sections={buildSections(locale)}
        history={[...history[locale]]}
      />
    </>
  );
}
