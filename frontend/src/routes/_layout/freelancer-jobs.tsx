import { createFileRoute } from "@tanstack/react-router";
import { FreelancerWorkspace } from "@/components/common/freelancer-workspace";
export const Route = createFileRoute("/_layout/freelancer-jobs")({
  component: () => <FreelancerWorkspace page="jobs" />,
  head: () => ({ meta: [{ title: "Jobs | Freelancer" }] }),
});
