import { NotFoundView, notFoundMetadata } from "@/components/pages/not-found";

export const generateMetadata = () => notFoundMetadata("ko");

export default function NotFound() {
  return <NotFoundView locale="ko" />;
}
