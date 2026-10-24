import { Section, Text } from "@react-email/components"
import { LinkButton } from "../ui/Button"
import { Heading } from "../ui/Heading"
import { Layout } from "../ui/Layout"
import { Link } from "../ui/Link"

type ResetPasswordProps = {
	project_name: string
	username: string
	link: string
	valid_hours: string
}

export default function ResetPassword({
	project_name = "{{ project_name }}",
	username = "{{ username }}",
	link = "{{ link }}",
	valid_hours = "{{ valid_hours }}",
}: ResetPasswordProps) {
	return (
		<Layout
			title={`${project_name} - Password recovery`}
			preview={`Reset your ${project_name} password`}
			project_name={project_name}
		>
			<Heading>Reset your password</Heading>
			<Text className="m-0 mb-4 text-[15px] text-body leading-6">Hi {username},</Text>
			<Text className="m-0 mb-4 text-[15px] text-body leading-6">
				We've received a request to reset the password for your {project_name} account. Choose a new one by clicking the
				button below:
			</Text>
			<Section className="my-5">
				<LinkButton href={link}>Reset password</LinkButton>
			</Section>
			<Text className="m-0 mb-3 text-muted text-sm leading-6">
				Or copy and paste this link into your browser:
				<br />
				<Link href={link}>{link}</Link>
			</Text>
			<Text className="m-0 mb-3 text-muted text-sm leading-6">This link will expire in {valid_hours} hours.</Text>
			<Text className="m-0 text-muted text-sm leading-6">
				If you didn't request a password recovery, you can safely ignore this email.
			</Text>
		</Layout>
	)
}
