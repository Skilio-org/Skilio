import { Text } from "@react-email/components"
import { Callout, Detail } from "../ui/Callout"
import { Heading } from "../ui/Heading"
import { Layout } from "../ui/Layout"

type TestEmailProps = {
	project_name: string
	email: string
}

export default function TestEmail({ project_name = "{{ project_name }}", email = "{{ email }}" }: TestEmailProps) {
	return (
		<Layout
			title={`${project_name} - Test email`}
			preview={`${project_name} email delivery is working`}
			project_name={project_name}
		>
			<Heading>Test email</Heading>
			<Text className="m-0 mb-4 text-[15px] text-body leading-6">Hi,</Text>
			<Text className="m-0 mb-4 text-[15px] text-body leading-6">
				This is a test email from {project_name}. If you're reading it, email delivery is configured correctly.
			</Text>
			<Callout>
				<Detail label="Sent to" value={email} />
			</Callout>
			<Text className="m-0 text-muted text-sm leading-6">
				If you weren't expecting this email, you can safely ignore it.
			</Text>
		</Layout>
	)
}
