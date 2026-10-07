type DeviderProps = {
	text: string
}

export const Divider = ({ text }: DeviderProps) => {
	return (
		<div className="my-5 flex items-center gap-3">
			<div className="h-px flex-1 bg-border" />
			<span className="shrink-0 font-medium text-muted-foreground text-xs">{text}</span>
			<div className="h-px flex-1 bg-border" />
		</div>
	)
}

export default Divider
