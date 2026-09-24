
import {	
	type ClientProfileDetailPublic,
	type FreelancerProfilePublic,
} from "@/client"

export type ConversationProfile = ClientProfileDetailPublic | FreelancerProfilePublic

export function isClientProfile(profile: ConversationProfile): profile is ClientProfileDetailPublic {
	return "company" in profile
}

export function isFreelancerProfile(profile: ConversationProfile): profile is FreelancerProfilePublic {
	return !("company" in profile)
}