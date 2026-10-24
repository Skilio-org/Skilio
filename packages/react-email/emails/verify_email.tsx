import { Section, Text } from "@react-email/components"
import { LinkButton } from "../ui/Button"
import { Heading } from "../ui/Heading"
import { Layout } from "../ui/Layout"
import { Link } from "../ui/Link"

interface VerifyEmailProps {
	project_name?: string
	username?: string
	link?: string
	valid_hours?: string
}

export default function VerifyEmail({
	project_name = "{{ project_name }}",
	username = "{{ username }}",
	link = "{{ link }}",
	valid_hours = "{{ valid_hours }}",
}: VerifyEmailProps) {
	return (
		<Layout
			title={`${project_name} - Verify your email`}
			preview={`Verify your email address for ${project_name}`}
			project_name={project_name}
		>
			<Heading>Verify your email address</Heading>
			<Text className="m-0 mb-4 text-[15px] text-body leading-6">Hi {username},</Text>
			<Text className="m-0 mb-4 text-[15px] text-body leading-6">
				Thanks for signing up for {project_name}! Please confirm your email address by clicking the button below:
			</Text>
			<Section className="my-5">
				<LinkButton href={link}>Verify Email</LinkButton>
			</Section>
			<Text className="m-0 mb-3 text-muted text-sm leading-6">
				Or copy and paste this link into your browser:
				<br />
				<Link href={link}>{link}</Link>
			</Text>
			<Text className="m-0 text-muted text-sm leading-6">
				This link will expire in {valid_hours} hours. If you did not create an account, you can ignore this email.
			</Text>
		</Layout>
	)
}
