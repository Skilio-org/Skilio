import { createFileRoute } from "@tanstack/react-router";
import { FreelancerWorkspace } from "@/components/common/freelancer-workspace";
export const Route = createFileRoute("/_layout/freelancer-dashboard")({
  component: () => <FreelancerWorkspace page="dashboard" />,
  head: () => ({ meta: [{ title: "Dashboard | Freelancer" }] }),
});
