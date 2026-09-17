import { createFileRoute } from "@tanstack/react-router"
import { FreelancerWorkspace } from "@/components/common/freelancer-workspace"
export const Route = createFileRoute("/_layout/freelancer-proposals")({
  component: () => <FreelancerWorkspace page="proposals" />,
  head: () => ({ meta: [{ title: "Proposals | Freelancer" }] }),
})
