import { PRIVACY_REQUEST_DAYS, type PrivacyRequestFieldError, type RequestType } from "@/lib/privacy-request";

/** Copy for /privacy/request (해요체). */
export const privacyRequestCopy = {
  meta: {
    title: "개인정보 열람·정정·삭제 요청",
    description: "Lab98에 맡긴 개인정보의 열람, 정정·삭제, 처리정지, 동의 철회를 요청할 수 있어요. 본인 확인 후 10일 안에 처리해요.",
  },
  label: "Privacy request",
  title: "개인정보 열람·정정·삭제 요청",
  lead: "「개인정보 보호법」에 따라 Lab98에 맡긴 개인정보를 언제든 확인하고, 고치거나 지우고, 처리를 멈추거나 동의를 철회할 수 있어요.",
  rights: [
    { term: "열람", desc: "보관 중인 내 정보가 무엇인지 확인해요." },
    { term: "정정·삭제", desc: "잘못된 정보를 고치거나 정보를 지워요." },
    { term: "처리정지", desc: "내 정보의 처리(안내 메일 등)를 멈춰요." },
    { term: "동의 철회", desc: "출시 알림 신청 등 동의했던 항목을 철회해요." },
  ],
  howTitle: "처리 방법",
  how: [
    "아래 양식으로 요청해 주세요.",
    "요청하신 이메일 주소로 확인 메일을 드리고, 그 메일에 답장해 주시면 처리해요.",
    `답장을 받으면 요청일로부터 ${PRIVACY_REQUEST_DAYS}일 안에 처리하고 결과를 알려 드려요.`,
  ],
  safety: "본인 확인 전에는 아무것도 바꾸거나 지우지 않아요. 다른 사람이 내 주소로 요청해도 답장이 없으면 그대로예요.",
  altBefore: "양식 대신",
  altAfter: "로 직접 메일을 보내셔도 돼요.",

  form: {
    ariaLabel: "개인정보 요청 양식",
    emailLabel: "이메일",
    emailHint: "문의나 출시 알림 신청 때 쓰신 주소를 적어 주세요. 이 주소로 확인 메일을 보내요.",
    emailPlaceholder: "you@example.com",
    typeLegend: "요청 유형",
    types: [
      { value: "access", label: "열람" },
      { value: "correct", label: "정정" },
      { value: "delete", label: "삭제" },
      { value: "suspend", label: "처리정지" },
      { value: "withdraw", label: "동의 철회" },
    ] as const satisfies readonly { value: RequestType; label: string }[],
    detailsLabel: "내용",
    detailsOptional: "(선택)",
    detailsRequired: "(필수)",
    detailsPlaceholder: {
      access: "특별히 궁금한 정보가 있으면 적어 주세요.",
      correct: "어떤 정보를 어떻게 고칠지 적어 주세요. 예: 이름/회사명을 ○○로 바꿔 주세요.",
      delete: "지울 범위가 정해져 있으면 적어 주세요. 비워 두면 이 주소의 정보를 모두 지워요.",
      suspend: "멈출 처리가 정해져 있으면 적어 주세요. 예: 안내 메일 발송",
      withdraw: "철회할 동의가 정해져 있으면 적어 주세요. 예: Praise Tool 출시 알림",
    } satisfies Record<RequestType, string>,
    consentLabel: "요청 처리와 본인 확인을 위해 이메일과 요청 내용을 수집해요. 처리 결과 기록은 3년 보관해요. (필수)",
    ipNote: "반복 전송을 막기 위해 접속 IP를 복원할 수 없는 값(해시)으로 바꿔 함께 저장해요.",
    submit: "요청 보내기",
    submitting: "보내는 중…",
    errors: {
      emailRequired: "이메일을 입력해 주세요.",
      emailInvalid: "이메일 형식을 확인해 주세요. 예: you@example.com",
      typeRequired: "요청 유형을 골라 주세요.",
      detailsRequired: "정정 요청은 고칠 내용을 적어 주세요.",
      detailsTooLong: "내용은 2,000자 안으로 적어 주세요.",
      consentRequired: "요청을 처리하려면 수집·이용에 동의해 주세요.",
    } satisfies Record<PrivacyRequestFieldError, string>,
    failure: {
      rateLimited: "짧은 시간에 요청이 많이 들어와 잠시 막아 두었어요. 10분 뒤 다시 시도해 주시거나",
      server: "요청을 보내지 못했어요. 잠시 뒤 다시 시도해 주시거나",
      fallbackAfter: "로 메일을 보내 주세요.",
    },
    success: {
      eyebrow: "요청 접수",
      title: `요청을 받았어요. 입력하신 이메일로 확인 메일을 보냈어요. 답장해 주시면 ${PRIVACY_REQUEST_DAYS}일 안에 처리해요.`,
      fallbackBefore: "확인 메일이 오지 않으면 스팸함을 확인하거나",
      fallbackAfter: "로 알려 주세요.",
      reset: "다른 요청 보내기",
    },
  },
} as const;
