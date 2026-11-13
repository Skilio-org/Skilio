import { createContext, type ReactNode, useCallback, useContext, useLayoutEffect, useRef, useState } from "react"
import { flushSync } from "react-dom"

export type Theme = "dark" | "light" | "system"

type ThemeProviderProps = {
	children: ReactNode
	defaultTheme?: Theme
	storageKey?: string
}

type ThemeProviderState = {
	theme: Theme
	resolvedTheme: "dark" | "light"
	setTheme: (theme: Theme) => void
}

const initialState: ThemeProviderState = {
	theme: "system",
	resolvedTheme: "light",
	setTheme: () => null,
}

const ThemeProviderContext = createContext<ThemeProviderState>(initialState)

export function ThemeProvider({
	children,
	defaultTheme = "system",
	storageKey = "vite-ui-theme",
	...props
}: ThemeProviderProps) {
	const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem(storageKey) as Theme) || defaultTheme)

	const getResolvedTheme = useCallback((theme: Theme): "dark" | "light" => {
		if (theme === "system") {
			return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
		}
		return theme
	}, [])

	const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">(() => getResolvedTheme(theme))
	const activeTransition = useRef<ViewTransition | null>(null)

	const updateTheme = useCallback(
		(newTheme: Theme) => {
			const root = window.document.documentElement
			const nextTheme = getResolvedTheme(newTheme)
			// Never interpolate individual borders against already-switched surfaces.
			root.setAttribute("data-theme-transition", "")
			root.classList.remove("light", "dark")
			root.classList.add(nextTheme)
			setResolvedTheme(nextTheme)
			// Resolve the new palette with element transitions disabled before restoring hover effects.
			void getComputedStyle(root).backgroundColor
			root.removeAttribute("data-theme-transition")
		},
		[getResolvedTheme],
	)

	useLayoutEffect(() => {
		updateTheme(theme)

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")

		const handleChange = () => {
			if (theme === "system") {
				updateTheme("system")
			}
		}

		mediaQuery.addEventListener("change", handleChange)

		return () => {
			mediaQuery.removeEventListener("change", handleChange)
			window.document.documentElement.removeAttribute("data-theme-transition")
		}
	}, [theme, updateTheme, getResolvedTheme])

	const changeTheme = (nextTheme: Theme) => {
		if (activeTransition.current) return
		localStorage.setItem(storageKey, nextTheme)
		const commit = () => flushSync(() => setTheme(nextTheme))
		if (!document.startViewTransition || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			commit()
			return
		}

		document.documentElement.setAttribute("data-theme-crossfade", "")
		const transition = document.startViewTransition(commit)
		activeTransition.current = transition
		void transition.finished
			.catch(() => undefined)
			.finally(() => {
				activeTransition.current = null
				document.documentElement.removeAttribute("data-theme-crossfade")
			})
	}

	const value = { theme, resolvedTheme, setTheme: changeTheme }

	return (
		<ThemeProviderContext.Provider {...props} value={value}>
			{children}
		</ThemeProviderContext.Provider>
	)
}

export const useTheme = () => {
	const context = useContext(ThemeProviderContext)

	if (context === undefined) throw new Error("useTheme must be used within a ThemeProvider")

	return context
}
