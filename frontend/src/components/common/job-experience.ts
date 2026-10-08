export const experienceLevels = ["Entry level", "Intermediate", "Expert / Principal"] as const

export type ExperienceLevel = (typeof experienceLevels)[number]

const experiencePrefix = (level: ExperienceLevel) => `Experience level: ${level}\n\n`

export function jobDescriptionLimit(level: ExperienceLevel | "") {
	return 5000 - (level ? experiencePrefix(level).length : 0)
}

export function readJobExperience(description: string) {
	const level: ExperienceLevel | "" =
		experienceLevels.find((candidate) => description.startsWith(experiencePrefix(candidate))) ?? ""
	return {
		level,
		description: level ? description.slice(experiencePrefix(level).length) : description,
	}
}

export function writeJobExperience(description: string, level: ExperienceLevel | "") {
	return `${level ? experiencePrefix(level) : ""}${description.trim()}`
}
