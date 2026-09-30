// Bs removed, all of it was just some state that can be managed elsewhere..
// The only that is left is selection. which will happen using global state and hooks!
// the selected user will be known throwout the whole app,
// same thing for the selected conversation....

import { ClientProfileDetailPublic, FreelancerProfilePublic } from "@/client"
type ConversationProfile = ClientProfileDetailPublic | FreelancerProfilePublic

// If not then at the chat component only
export function isClientProfile(profile: ConversationProfile): profile is ClientProfileDetailPublic {
	return "company" in profile
}
