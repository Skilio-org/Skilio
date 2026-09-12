import { createFileRoute } from "@tanstack/react-router"
import { FreelancerWorkspace } from "@/components/Common/FreelancerWorkspace"
export const Route = createFileRoute("/_layout/freelancer-settings")({
  component: () => <FreelancerWorkspace page="settings" />,
  head: () => ({ meta: [{ title: "Settings | Freelancer" }] }),
})
