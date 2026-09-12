import { createFileRoute } from "@tanstack/react-router";
import { FreelancerWorkspace } from "@/components/Common/FreelancerWorkspace";
export const Route = createFileRoute("/_layout/freelancer-projects")({
  component: () => <FreelancerWorkspace page="projects" />,
  head: () => ({ meta: [{ title: "Projects | Freelancer" }] }),
});
