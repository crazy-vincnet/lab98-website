import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { pageMetadata } from "@/components/seo/metadata";
import { ORG_ID, breadcrumb, graph, webPage } from "@/lib/structured-data";
import Link from "next/link";
import { site } from "@/lib/content";
import { CONTACT_HREF, PRAISE_TOOL_PATH, PRIVACY_PATH } from "@/components/experiments/paths";
import { LegalDoc, type LegalSection } from "@/components/legal/legal-doc";

/** 이용약관 — covers the lab98.io website only. Paid services (Dev 제작, AI 교육, Praise Tool 구매) have separate contracts/terms. */
const TITLE = "이용약관";
const DESCRIPTION = `${site.name} 웹사이트(${site.url.replace(/^https?:\/\//, "")}) 이용 조건과 회사·이용자의 권리와 의무, 문의·견적의 성격, 지식재산권, 면책과 분쟁 해결 기준을 안내해요.`;

export const metadata: Metadata = pageMetadata({ title: TITLE, description: DESCRIPTION, path: "/terms" });

const crumbs = [{ name: TITLE, path: "/terms" }];
const jsonLd = graph(webPage({ path: "/terms", name: TITLE, description: DESCRIPTION, crumbs, extra: { publisher: { "@id": ORG_ID } } }), breadcrumb("/terms", crumbs));

const EFFECTIVE_DATE = "2026년 11월 1일";
/** Keep in sync with site.business.name. */
const OWNER = "제이제이드림(JJdream, 브랜드명 Lab98)";
const host = site.url.replace(/^https?:\/\//, "");
const mail = <a href={`mailto:${site.email}`}>{site.email}</a>;

const sections: LegalSection[] = [
  {
    id: "purpose",
    title: "목적",
    body: <p>이 약관은 {OWNER}(이하 “회사”)이 운영하는 웹사이트 {host}(이하 “사이트”)의 이용 조건과 절차, 회사와 이용자의 권리·의무를 정하는 것을 목적으로 해요.</p>,
  },
  {
    id: "definitions",
    title: "정의",
    body: (
      <ul>
        <li>“사이트”: 회사가 {host} 도메인으로 운영하는 웹사이트와 그 하위 페이지</li>
        <li>“이용자”: 이 약관에 따라 사이트에 접속해 서비스를 이용하는 모든 사람</li>
        <li>“서비스”: 회사가 사이트에서 무료로 제공하는 정보와 기능(4조에 적은 내용)</li>
      </ul>
    ),
  },
  {
    id: "notice",
    title: "약관의 게시와 변경",
    body: (
      <ul>
        <li>회사는 이 약관을 이용자가 쉽게 볼 수 있도록 사이트에 게시해요.</li>
        <li>회사는 관련 법령을 위반하지 않는 범위에서 약관을 바꿀 수 있어요.</li>
        <li>약관을 바꿀 때는 시행일과 변경 이유를 밝혀 시행 7일 전부터 사이트에 알려요. 이용자에게 불리한 변경은 시행 30일 전부터 알려요.</li>
        <li>바뀐 약관에 동의하지 않으면 사이트 이용을 멈출 수 있어요.</li>
      </ul>
    ),
  },
  {
    id: "service",
    title: "서비스의 내용",
    body: (
      <>
        <p>회사는 사이트에서 아래 서비스를 제공해요.</p>
        <ul>
          <li>회사와 서비스(Dev·AI·Faith) 소개, 프로젝트 사례 소개</li>
          <li>
            <Link href={CONTACT_HREF}>문의</Link> 접수
          </li>
          <li>
            <Link href={PRAISE_TOOL_PATH}>Praise Tool</Link> 출시 알림 신청
          </li>
          <li>인사이트 글 등 정보 제공</li>
        </ul>
      </>
    ),
  },
  {
    id: "obligations",
    title: "이용자의 의무",
    body: (
      <>
        <p>이용자는 아래 행위를 해서는 안 돼요.</p>
        <ul>
          <li>허위 정보를 입력하거나 다른 사람의 이메일 등 정보를 도용하는 행위</li>
          <li>프로그램 등 자동화 수단으로 양식을 대량 전송하는 행위</li>
          <li>사이트의 운영을 방해하거나 보안을 해치는 행위(무단 접근, 악성 코드 전송, 과도한 요청 등)</li>
          <li>회사나 다른 사람의 권리를 침해하거나 법령에 어긋나는 행위</li>
        </ul>
        <p>회사는 위 행위가 확인되면 해당 문의·신청을 처리하지 않거나 접속을 제한할 수 있어요.</p>
      </>
    ),
  },
  {
    id: "inquiries",
    title: "문의·견적의 성격",
    body: (
      <ul>
        <li>사이트로 문의를 접수하거나 견적·상담 안내를 받는 것만으로는 계약이 성립하지 않아요.</li>
        <li>Dev 제작 계약, AI 교육, Praise Tool 구매는 각각 별도 계약서나 약관에 따르고, 개별 계약서의 내용이 이 약관보다 우선해요.</li>
        <li>Praise Tool 구매와 환불 조건은 판매를 시작하기 전에 따로 게시해요. 지금 사이트에서는 온라인 판매를 하지 않아요.</li>
      </ul>
    ),
  },
  {
    id: "ip",
    title: "지식재산권",
    body: (
      <ul>
        <li>사이트의 글, 이미지, 로고, 디자인 등 콘텐츠의 권리는 회사에 있어요. 회사의 허락 없이 복제·배포·변경해 상업적으로 이용할 수 없어요.</li>
        <li>프로젝트 사례에 나오는 고객 사이트의 화면과 명칭은 각 기관의 권리이며, 회사는 해당 기관의 동의를 받아 게시해요.</li>
      </ul>
    ),
  },
  {
    id: "links",
    title: "외부 링크",
    body: <p>사이트에는 고객 사이트 등 외부 사이트로 가는 링크가 있을 수 있어요. 외부 사이트는 회사가 운영하지 않으므로, 그 내용과 개인정보 처리에 대해 회사는 책임지지 않아요.</p>,
  },
  {
    id: "changes-service",
    title: "서비스의 변경과 중단",
    body: (
      <ul>
        <li>회사는 운영상·기술상 필요에 따라 서비스의 전부나 일부를 바꾸거나 중단할 수 있어요.</li>
        <li>설비 점검, 장애, 천재지변 등으로 서비스가 일시 중단될 수 있고, 미리 알릴 수 있으면 사이트에 알려요.</li>
      </ul>
    ),
  },
  {
    id: "disclaimer",
    title: "면책",
    body: (
      <ul>
        <li>사이트의 정보는 무료로 제공되는 일반 정보이며, 특정 목적에 맞는다고 보증하지 않아요. 구체적인 판단이 필요하면 문의해 주세요.</li>
        <li>회사는 이용자의 잘못으로 생긴 손해, 무료로 제공되는 정보의 이용으로 생긴 손해에 대해 책임지지 않아요. 다만 회사의 고의나 중대한 과실로 생긴 손해는 예외예요.</li>
      </ul>
    ),
  },
  {
    id: "privacy",
    title: "개인정보 보호",
    body: (
      <p>
        회사는 관련 법령에 따라 이용자의 개인정보를 보호해요. 자세한 내용은 <Link href={PRIVACY_PATH}>개인정보처리방침</Link>을 확인해 주세요.
      </p>
    ),
  },
  {
    id: "disputes",
    title: "분쟁 해결",
    body: (
      <ul>
        <li>이 약관과 사이트 이용에는 대한민국 법이 적용돼요.</li>
        <li>분쟁이 생기면 먼저 {mail}로 연락해 주세요. 원만히 해결되지 않으면 「민사소송법」에 따른 관할 법원에서 해결해요.</li>
      </ul>
    ),
  },
  {
    id: "addendum",
    title: "부칙",
    body: <p>이 약관은 {EFFECTIVE_DATE}부터 시행해요.</p>,
  },
];

export default function TermsPage() {
  return (
    <>
      <JsonLd data={jsonLd} />
      <LegalDoc
        label="Terms"
        title="이용약관"
        intro={<p>{host} 웹사이트를 이용할 때 지켜야 할 조건과 회사·이용자의 권리와 의무를 안내해요. 사이트를 이용하면 이 약관에 동의한 것으로 봐요.</p>}
        effectiveDate={EFFECTIVE_DATE}
        sections={sections}
        history={[{ date: "2026. 11. 01", note: "제정" }]}
      />
    </>
  );
}
