// The app uses Moroccan dirhams everywhere. Change the label here to change it on every screen.
export const CURRENCY_LABEL = "DH"

// 15000 -> "15,000 DH"
export function formatMoney(amount: number | string) {
	return `${Number(amount).toLocaleString("en-US")} ${CURRENCY_LABEL}`
}

// 250 -> "250 DH/hr"
export function formatRate(amount: number | string) {
	return `${formatMoney(amount)}/hr`
}

// The hourly-rate filter sliders run from 0 to this value. The top end means "no upper limit".
export const RATE_FILTER_MAX = 5000
export const RATE_FILTER_STEP = 50

// (0, 5000) -> "0–5,000+ DH/hr". At or above RATE_FILTER_MAX the range is open-ended.
export function formatRateRange(min: number, max: number) {
	const top = max >= RATE_FILTER_MAX ? `${RATE_FILTER_MAX.toLocaleString("en-US")}+` : max.toLocaleString("en-US")
	return `${min.toLocaleString("en-US")}–${top} ${CURRENCY_LABEL}/hr`
}
