import { createFileRoute } from "@tanstack/react-router";
import { FreelancerWorkspace } from "@/components/common/freelancer-workspace";
export const Route = createFileRoute("/_layout/freelancer-settings")({
  component: () => <FreelancerWorkspace page="settings" />,
  head: () => ({ meta: [{ title: "Settings | Freelancer" }] }),
});
