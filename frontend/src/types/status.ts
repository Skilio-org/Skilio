export type HealthState = "healthy" | "degraded" | "unhealthy"

export interface ComponentHealth {
	status: HealthState
	latency_ms: number | null
	message: string
}

export interface SystemHealth {
	status: HealthState
	timestamp: string
	services: {
		database?: ComponentHealth
		cache?: ComponentHealth
		storage?: ComponentHealth
		[key: string]: ComponentHealth | undefined
	}
}
