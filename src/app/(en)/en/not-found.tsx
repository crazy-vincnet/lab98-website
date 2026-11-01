import { NotFoundView, notFoundMetadata } from "@/components/pages/not-found";

export const generateMetadata = () => notFoundMetadata("en");

export default function NotFound() {
  return <NotFoundView locale="en" />;
}
