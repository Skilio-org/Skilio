import { createFileRoute } from "@tanstack/react-router"
import { FreelancerWorkspace } from "@/components/Common/FreelancerWorkspace"
export const Route = createFileRoute("/_layout/freelancer-earnings")({
  component: () => <FreelancerWorkspace page="earnings" />,
  head: () => ({ meta: [{ title: "Earnings | Freelancer" }] }),
})
