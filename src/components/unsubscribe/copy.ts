import type { UnsubscribeFieldError } from "@/lib/unsubscribe";

/** Copy for /unsubscribe (해요체). */
export const unsubscribeCopy = {
  meta: {
    title: "이메일 수신거부",
    description: "Lab98의 출시 알림·소식 등 안내 메일을 더 받지 않도록 수신거부할 수 있어요.",
  },
  label: "Unsubscribe",
  title: "이메일 수신거부",
  lead: "Lab98은 광고 메일을 보내지 않아요. 출시 알림은 신청하신 분께 한 번만 보내요. 그래도 앞으로 안내 메일(출시 알림, 소식 등)을 받고 싶지 않다면 여기서 바로 멈출 수 있어요.",
  points: [
    "수신거부한 주소로는 출시 알림, 소식 등 꼭 필요하지 않은 메일을 보내지 않아요.",
    "직접 보내신 문의나 개인정보 요청에는 수신거부와 관계없이 답장을 보내 드려요.",
  ],
  // Sentence around the "개인정보 요청" and "개인정보처리방침" links under the points.
  inline: { before: "보관 중인 정보를 확인하거나 지우고 싶다면", request: "개인정보 요청", middle: "을 이용해 주세요. 자세한 내용은", policy: "개인정보처리방침", after: "에서 확인할 수 있어요." },
  form: {
    ariaLabel: "이메일 수신거부 양식",
    emailLabel: "이메일",
    emailPlaceholder: "you@example.com",
    cancelLaunchLabel: "출시 알림 신청도 함께 취소해요",
    cancelLaunchHint: "신청 기록을 바로 지워요.",
    notice: "수신거부 처리를 위해 이메일을 수신거부 목록에 보관해요.",
    submit: "수신거부하기",
    submitting: "처리하는 중…",
    errors: {
      emailRequired: "수신거부할 이메일을 입력해 주세요.",
      emailInvalid: "이메일 형식을 확인해 주세요. 예: you@example.com",
    } satisfies Record<UnsubscribeFieldError, string>,
    failure: {
      rateLimited: "짧은 시간에 요청이 많이 들어와 잠시 막아 두었어요. 10분 뒤 다시 시도해 주시거나",
      server: "처리하지 못했어요. 잠시 뒤 다시 시도해 주시거나",
      fallbackAfter: "로 수신거부를 요청해 주세요.",
    },
    success: {
      eyebrow: "수신거부 완료",
      title: "수신거부 처리됐어요. 앞으로 안내 메일을 보내지 않을게요.",
      fallbackBefore: "다시 받고 싶어지시면",
      fallbackAfter: "로 알려 주세요.",
    },
  },
} as const;
