import { createFileRoute } from "@tanstack/react-router";
import { FreelancerWorkspace } from "@/components/common/freelancer-workspace";
export const Route = createFileRoute("/_layout/freelancer-projects")({
  component: () => <FreelancerWorkspace page="projects" />,
  head: () => ({ meta: [{ title: "Projects | Freelancer" }] }),
});
