import { createFileRoute } from "@tanstack/react-router";
import { FreelancerWorkspace } from "@/components/common/freelancer-workspace";
export const Route = createFileRoute("/_layout/freelancer-earnings")({
  component: () => <FreelancerWorkspace page="earnings" />,
  head: () => ({ meta: [{ title: "Earnings | Freelancer" }] }),
});
