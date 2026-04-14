/**
 * @param {number} value
 * @returns {number}
 */
function toFiniteNumber(value) {
	return Number.isFinite(value) ? value : 0;
}

/**
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function clamp(value, min, max) {
	return Math.min(max, Math.max(min, value));
}

/**
 * 根据当前滚动位置计算页面浏览进度，返回 0 到 1 之间的比例。
 *
 * @param {{
 *   scrollTop: number;
 *   scrollHeight: number;
 *   clientHeight: number;
 * }} metrics
 * @returns {number}
 */
export function calculateScrollProgress(metrics) {
	const scrollTop = toFiniteNumber(metrics.scrollTop);
	const scrollHeight = toFiniteNumber(metrics.scrollHeight);
	const clientHeight = toFiniteNumber(metrics.clientHeight);
	const scrollableHeight = Math.max(scrollHeight - clientHeight, 0);

	if (scrollableHeight === 0) {
		return 0;
	}

	return clamp(scrollTop / scrollableHeight, 0, 1);
}

/**
 * 把滚动进度转换为顺时针圆锥渐变需要的角度。
 *
 * @param {{
 *   scrollTop: number;
 *   scrollHeight: number;
 *   clientHeight: number;
 * }} metrics
 * @returns {string}
 */
export function getScrollProgressAngle(metrics) {
	return `${Math.round(calculateScrollProgress(metrics) * 360)}deg`;
}
