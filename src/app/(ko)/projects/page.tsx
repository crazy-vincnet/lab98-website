import { ProjectsPage, projectsMetadata } from "@/components/pages/projects";

export const ensureStatic = "navigation";

export const generateMetadata = () => projectsMetadata("ko");

export default function Page() {
  return <ProjectsPage locale="ko" />;
}
