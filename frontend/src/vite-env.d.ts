/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_API_URL?: string
	readonly VITE_GOOGLE_OAUTH_URL?: string
	readonly VITE_LINKEDIN_OAUTH_URL?: string
}

interface ImportMeta {
	readonly env: ImportMetaEnv
}
