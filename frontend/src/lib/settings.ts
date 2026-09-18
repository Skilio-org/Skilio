import { z } from "zod"

export const settingsSectionSchema = z.enum([
	"profile",
	"password",
	"notifications",
	"privacy",
	"appearance",
	"danger-zone",
])

export type SettingsSection = z.infer<typeof settingsSectionSchema>
