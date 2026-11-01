import { ProjectsPage, projectsMetadata } from "@/components/pages/projects";

export const ensureStatic = "navigation";

export const generateMetadata = () => projectsMetadata("en");

export default function Page() {
  return <ProjectsPage locale="en" />;
}
