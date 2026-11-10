import { Body, Container, Head, Hr, Html, Img, Preview, Section, Tailwind, Text } from "@react-email/components"
import type { PropsWithChildren } from "react"

type LayoutProps = PropsWithChildren & {
	title: string
	project_name: string
	preview?: string
	logo_url?: string
}

export const Layout = ({ project_name, title, preview, logo_url, children }: LayoutProps) => {
	return (
		<Tailwind
			config={{
				theme: {
					extend: {
						colors: {
							surface: "#1f2125",
							body: "#ffffff",
							muted: "#fffff9",
							rule: "#e2e8f0",
							primary: {
								DEFAULT: "#00ef0d",
								foreground: "#ffffff",
							},
							brand: {
								DEFAULT: "#229688",
								dark: "#00695c",
							},
						},
						fontFamily: {
							sans: [
								"-apple-system",
								"BlinkMacSystemFont",
								'"Segoe UI"',
								"Roboto",
								"Oxygen",
								"Ubuntu",
								"Cantarell",
								'"Fira Sans"',
								'"Droid Sans"',
								'"Helvetica Neue"',
								"sans-serif",
							],
						},
					},
				},
			}}
		>
			<Html lang="en" dir="ltr">
				<Head>
					<title>{title}</title>
					<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				</Head>
				{preview ? <Preview>{preview}</Preview> : null}
				<Body className="bg-black font-sans text-body">
					{/* Container enforces MSO Outlook conditional tables and centers content */}
					<Container className="mx-auto max-w-[560px] px-4 py-8 sm:px-6 sm:py-12">
						<Section className="mb-2 text-center">
							<Img
								src={logo_url || "https://res.cloudinary.com/vrreelhh/image/upload/v1792779326/s.png"}
								alt={project_name}
								width="48"
								height="48"
								align="center"
								className="inline-block rounded-xl"
							/>
						</Section>
						<Text className="m-0 mb-4 text-center font-semibold text-[13px] text-body uppercase tracking-[0.1em]">
							{project_name}
						</Text>
						<Section
							className="rounded-2xl border border-solid border-[#2e3238] bg-surface"
							// Ensures Outlook desktop renders the background color
							// @ts-expect-error - bgcolor is a valid HTML table attribute needed for Outlook
							bgcolor="#1f2125"
						>
							{/* Apply padding to an inner div or cell rather than the table */}
							<div className="p-6">{children}</div>
						</Section>
						<Hr className="my-6 border-rule border-t" />
						<Section className="text-center">
							<Text className="m-0 text-center text-muted text-xs leading-5">
								© {new Date().getFullYear()} {project_name}. All rights reserved.
							</Text>
						</Section>
					</Container>
				</Body>
			</Html>
		</Tailwind>
	)
}
