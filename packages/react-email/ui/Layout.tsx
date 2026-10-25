import { Body, Head, Hr, Html, Img, Preview, Section, Tailwind, Text } from "@react-email/components"

type LayoutProps = React.PropsWithChildren & {
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
								DEFAULT: "#00ef0d", // Your frontend --primary color
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
				<Body className="my-0 max-w-140 bg-black px-4 py-8 font-sans text-body sm:px-6 sm:py-12">
					<Section className="mb-2 w-full rounded-2xl text-center">
						<Img
							src={logo_url || "https://res.cloudinary.com/vrreelhh/image/upload/v1792779326/s.png"}
							alt={project_name}
							width="48"
							height="48"
							align="center"
							className="inline-block rounded-xl bg-black/10 p-3 align-middle"
						/>
					</Section>
					<Text className="m-0 mb-4 text-center font-semibold text-[13px] text-body uppercase tracking-[0.1em]">
						{project_name}
					</Text>
					<Section className="max-w-3xl rounded-2xl bg-surface p-6 shadow-md">{children}</Section>
					<Hr className="mt-10 mb-5 border-0 border-rule border-t border-solid" />
					<Section className="text-center">
						<Text className="m-0 text-center text-muted text-xs leading-5">
							© {new Date().getFullYear()} {project_name}. All rights reserved.
						</Text>
					</Section>
				</Body>
			</Html>
		</Tailwind>
	)
}
