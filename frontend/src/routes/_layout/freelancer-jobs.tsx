import { createFileRoute } from "@tanstack/react-router"
import { FreelancerWorkspace } from "@/components/Common/FreelancerWorkspace"
export const Route = createFileRoute("/_layout/freelancer-jobs")({
  component: () => <FreelancerWorkspace page="jobs" />,
  head: () => ({ meta: [{ title: "Jobs | Freelancer" }] }),
})
