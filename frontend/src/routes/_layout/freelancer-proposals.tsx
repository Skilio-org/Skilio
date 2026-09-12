import { createFileRoute } from "@tanstack/react-router"
import { FreelancerWorkspace } from "@/components/Common/FreelancerWorkspace"
export const Route = createFileRoute("/_layout/freelancer-proposals")({
  component: () => <FreelancerWorkspace page="proposals" />,
  head: () => ({ meta: [{ title: "Proposals | Freelancer" }] }),
})
