import { type ComponentProps, useState } from "react"
import { cn } from "@/lib/utils"

// A normal <img> that shows a pulsing grey box until the picture has loaded.
export function LoadingImage({ className, onLoad, ...props }: ComponentProps<"img">) {
	const [loaded, setLoaded] = useState(false)

	return (
		// biome-ignore lint/a11y/useAltText: the alt text is passed in through props
		<img
			{...props}
			className={cn(!loaded && "animate-pulse bg-surface-container", className)}
			onLoad={(event) => {
				setLoaded(true)
				onLoad?.(event)
			}}
		/>
	)
}
