import { createFileRoute } from "@tanstack/react-router"
import { FreelancerWorkspace } from "@/components/common/freelancer-workspace"

export const Route = createFileRoute("/_layout/freelancer-saved-jobs")({
  component: () => <FreelancerWorkspace page="savedJobs" />,
  head: () => ({ meta: [{ title: "Saved jobs | Freelancer" }] }),
})
