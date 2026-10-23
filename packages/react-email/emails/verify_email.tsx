import { Text } from "@react-email/components"
import { LinkButton } from "../ui/Button"
import { Heading } from "../ui/Heading"
import { Layout } from "../ui/Layout"
import { Link } from "../ui/Link"

type VerifyEmailProps = {
    project_name: string
    username: string
    link: string
    valid_hours: string
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
            <Text className="text-[15px] leading-7 text-body">Hi {username},</Text>
            <Text className="text-[15px] leading-7 text-body">
                Thanks for signing up for {project_name}! Please confirm your email address by clicking the button below:
            </Text>
            <LinkButton href={link}>Verify Email</LinkButton>
            <Text className="text-sm leading-6 text-muted">
                Or copy and paste this link into your browser:
                <br />
                <Link href={link}>{link}</Link>
            </Text>
            <Text className="text-sm leading-6 text-muted">
                This link will expire in {valid_hours} hours. If you did not create an account, you can ignore this email.
            </Text>
        </Layout>
    )
}
