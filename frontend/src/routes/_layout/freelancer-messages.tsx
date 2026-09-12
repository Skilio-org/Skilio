import { createFileRoute } from "@tanstack/react-router";
import { FreelancerWorkspace } from "@/components/Common/FreelancerWorkspace";
export const Route = createFileRoute("/_layout/freelancer-messages")({
  component: () => <FreelancerWorkspace page="messages" />,
  head: () => ({ meta: [{ title: "Messages | Freelancer" }] }),
});
