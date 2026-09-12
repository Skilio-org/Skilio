import { createFileRoute } from "@tanstack/react-router";
import { FreelancerWorkspace } from "@/components/Common/FreelancerWorkspace";
export const Route = createFileRoute("/_layout/freelancer-dashboard")({
  component: () => <FreelancerWorkspace page="dashboard" />,
  head: () => ({ meta: [{ title: "Dashboard | Freelancer" }] }),
});
