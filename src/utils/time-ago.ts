export class TimeAgo extends HTMLElement {
	private interval: ReturnType<typeof setInterval> | null = null;

	connectedCallback() {
		this.update();
		this.interval = setInterval(() => this.update(), 60000);
	}

	disconnectedCallback() {
		if (this.interval) clearInterval(this.interval);
	}

	update() {
		const datetime = this.dataset.datetime;
		if (!datetime) return;
		const updated = new Date(datetime);
		const now = new Date();
		const diffSeconds = (updated.getTime() - now.getTime()) / 1000;
		const diffMinutes = diffSeconds / 60;
		const diffHours = diffMinutes / 60;
		const diffDays = diffHours / 24;
		const diffMonths = diffDays / 30;
		const diffYears = diffDays / 365;

		const lang = document.documentElement.lang;
		const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });

		let timeAgoStr = "";
		const absMinutes = Math.abs(diffMinutes);
		if (absMinutes < 1) {
			timeAgoStr = "刚刚";
		} else if (Math.abs(diffHours) < 1) {
			timeAgoStr = rtf.format(Math.round(diffMinutes), "minute");
		} else if (Math.abs(diffDays) < 1) {
			timeAgoStr = rtf.format(Math.round(diffHours), "hour");
		} else if (Math.abs(diffMonths) < 1) {
			timeAgoStr = rtf.format(Math.round(diffDays), "day");
		} else if (Math.abs(diffYears) < 1) {
			timeAgoStr = rtf.format(Math.round(diffMonths), "month");
		} else {
			timeAgoStr = rtf.format(Math.round(diffYears), "year");
		}
		this.textContent = timeAgoStr;
	}
}

if (!customElements.get("time-ago")) {
	customElements.define("time-ago", TimeAgo);
}
