import {
	AlertOctagon,
	AlertTriangle,
	BriefcaseBusiness,
	CheckCircle2,
	Clock,
	Globe,
	HardDrive,
	MessageSquare,
	RefreshCw,
} from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { isAxiosError } from "axios"
import { useEffect, useState } from "react"

import { HealthService, type SystemHealth } from "@/client"
import { LandingFooter } from "@/components/landing/landing-footer"
import { LandingHeader } from "@/components/landing/landing-header"
import type { HealthState } from "@/types/status"
import ServiceCard from "@/components/status/service-card"

const REFRESH_INTERVAL_SECONDS = 10
const REFRESH_INTERVAL_MS = REFRESH_INTERVAL_SECONDS * 1000

const unavailableHealth: SystemHealth = {
	status: "unhealthy",
	timestamp: "",
	services: {
		database: { status: "unhealthy", latency_ms: null, message: "Database service unreachable" },
		cache: { status: "unhealthy", latency_ms: null, message: "Cache service unreachable" },
		storage: { status: "unhealthy", latency_ms: null, message: "Storage service unreachable" },
	},
}

function healthFromError(error: Error | null): SystemHealth | null {
	if (!isAxiosError<SystemHealth>(error)) return null
	const health = error.response?.data
	if (!health || !["healthy", "degraded", "unhealthy"].includes(health.status) || !health.services) return null
	return health
}

const StatusPage = () => {
	const [now, setNow] = useState(Date.now)
	const { data, error, isPending, isFetching, isError, dataUpdatedAt, errorUpdatedAt, refetch } = useQuery({
		queryKey: ["system-health"],
		queryFn: async ({ signal }) =>
			(
				await HealthService.getSystemHealth({
					baseURL: import.meta.env.VITE_API_URL || "http://localhost:8000",
					signal,
				})
			).data,
		refetchInterval: REFRESH_INTERVAL_MS,
		refetchIntervalInBackground: true,
		retry: false,
	})

	useEffect(() => {
		const timer = setInterval(() => setNow(Date.now()), 1000)
		return () => clearInterval(timer)
	}, [])

	const errorHealth = healthFromError(error)
	const health = isError ? (errorHealth ?? unavailableHealth) : data
	const isBackendReachable = !isError || Boolean(errorHealth)
	const lastCheckedAt = Math.max(dataUpdatedAt, errorUpdatedAt)
	const countdown = lastCheckedAt
		? Math.max(0, Math.ceil((lastCheckedAt + REFRESH_INTERVAL_MS - now) / 1000))
		: REFRESH_INTERVAL_SECONDS
	const overallStatus: HealthState = health?.status ?? "unhealthy"

	return (
		<div className="min-h-dvh bg-background text-foreground flex flex-col">
			<LandingHeader />

			<main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
				{/* Top Bar: Title & Controls */}
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border pb-6">
					<div>
						<div className="flex items-center gap-2.5">
							<h1 className="text-2xl sm:text-3xl font-bold tracking-tight">System Status</h1>
							{isPending ? (
								<span role="status" className="text-xs text-muted-foreground">
									Checking services…
								</span>
							) : isBackendReachable ? (
								<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
									<span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
									Live Telemetry
								</span>
							) : (
								<span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
									<span className="size-1.5 rounded-full bg-rose-500 animate-ping" />
									Connection Lost
								</span>
							)}
						</div>
						<p className="text-sm text-muted-foreground mt-1">Real-time service availability and platform status.</p>
					</div>

					<div className="flex items-center gap-3">
						<div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg border border-border">
							<Clock className="size-3.5" />
							<span>Auto-refresh in {countdown}s</span>
						</div>
						<button
							type="button"
							onClick={() => void refetch()}
							disabled={isFetching}
							className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-card hover:bg-muted/80 transition-colors disabled:opacity-50"
						>
							<RefreshCw className={`size-3.5 ${isFetching ? "animate-spin" : ""}`} />
							<span>Refresh</span>
						</button>
					</div>
				</div>

				{isPending && (
					<p role="status" className="rounded-xl border border-border bg-card p-6 text-muted-foreground">
						Checking system status…
					</p>
				)}
				{/* 1. Overall System Banner */}
				<div
					className={`p-6 rounded-2xl border transition-all ${isPending ? "hidden" : ""} ${
						overallStatus === "healthy"
							? "bg-emerald-500/5 border-emerald-500/30 text-emerald-950 dark:text-emerald-100"
							: overallStatus === "degraded"
								? "bg-amber-500/5 border-amber-500/30 text-amber-950 dark:text-amber-100"
								: "bg-rose-500/5 border-rose-500/30 text-rose-950 dark:text-rose-100"
					}`}
				>
					<div className="flex items-start sm:items-center gap-4">
						<div
							className={`p-3 rounded-xl shrink-0 ${
								overallStatus === "healthy"
									? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
									: overallStatus === "degraded"
										? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
										: "bg-rose-500/15 text-rose-600 dark:text-rose-400"
							}`}
						>
							{overallStatus === "healthy" && <CheckCircle2 className="size-8" />}
							{overallStatus === "degraded" && <AlertTriangle className="size-8" />}
							{overallStatus === "unhealthy" && <AlertOctagon className="size-8" />}
						</div>
						<div className="flex-1">
							<h2 className="text-xl font-bold">
								{overallStatus === "healthy" && "All Systems Operational"}
								{overallStatus === "degraded" && "Degraded Performance Detected"}
								{overallStatus === "unhealthy" && "Service Disruption Detected"}
							</h2>
							<p className="text-sm opacity-90 mt-0.5">
								{overallStatus === "healthy" &&
									"All platform services, messaging, and account systems are operating normally."}
								{overallStatus === "degraded" &&
									"A platform service is experiencing brief delays. Core features remain operational."}
								{overallStatus === "unhealthy" &&
									"One or more services are temporarily unavailable. Automated self-healing is active."}
							</p>
						</div>
					</div>
				</div>

				{/* 2. Platform Services Grid */}
				<div className={`space-y-4 ${isPending ? "hidden" : ""}`}>
					<h3 className="text-lg font-semibold tracking-tight">Platform Services</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{/* Database / Marketplace Card */}
						<ServiceCard
							icon={<BriefcaseBusiness className="size-5" />}
							name="Job Marketplace"
							description="Browsing listings, posting projects, and submitting proposals."
							status={health?.services?.database?.status || "unhealthy"}
						/>

						{/* Cache / Chat Card */}
						<ServiceCard
							icon={<MessageSquare className="size-5" />}
							name="Direct Messaging"
							description="Instant chat between clients and freelancers, plus live alerts."
							status={health?.services?.cache?.status || "unhealthy"}
						/>

						{/* Storage Card */}
						<ServiceCard
							icon={<HardDrive className="size-5" />}
							name="Files & Media Storage"
							description="Profile pictures, portfolio attachments, and platform storage."
							status={health?.services?.storage?.status || "unhealthy"}
						/>

						{/* Web Platform & Accounts Card */}
						<ServiceCard
							icon={<Globe className="size-5" />}
							name="Website & User Accounts"
							description="Platform access, secure sign-in, and member dashboards."
							status={!isBackendReachable ? "unhealthy" : "healthy"}
						/>
					</div>
				</div>
			</main>

			<LandingFooter />
		</div>
	)
}

export default StatusPage
