import { Section, Text } from "@react-email/components"
import { LinkButton } from "../ui/Button"
import { Callout, Detail } from "../ui/Callout"
import { Heading } from "../ui/Heading"
import { Layout } from "../ui/Layout"
import { Link } from "../ui/Link"

type NewAccountProps = {
	project_name: string
	username: string
	password: string
	link: string
}

export default function NewAccount({
	project_name = "{{ project_name }}",
	username = "{{ username }}",
	password = "{{ password }}",
	link = "{{ link }}",
}: NewAccountProps) {
	return (
		<Layout
			title={`${project_name} - New account`}
			preview={`Your ${project_name} account is ready`}
			project_name={project_name}
		>
			<Heading>Welcome to {project_name}!</Heading>
			<Text className="m-0 mb-4 text-[15px] text-body leading-6">Hi,</Text>
			<Text className="m-0 mb-4 text-[15px] text-body leading-6">
				Your account has been successfully created and is ready to use. These are your credentials:
			</Text>
			<Callout>
				<Detail label="Username" value={username} />
				<Detail label="Password" value={password} />
			</Callout>
			<Text className="m-0 mb-4 text-[15px] text-body leading-6">Get started by signing in to your dashboard:</Text>
			<Section className="my-5">
				<LinkButton href={link}>Go to Dashboard</LinkButton>
			</Section>
			<Text className="m-0 mb-3 text-muted text-sm leading-6">
				Or copy and paste this link into your browser:
				<br />
				<Link href={link}>{link}</Link>
			</Text>
			<Text className="m-0 text-muted text-sm leading-6">
				For security reasons, change your password after your first sign in.
			</Text>
		</Layout>
	)
}
