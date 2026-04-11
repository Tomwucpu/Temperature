/**
 * @typedef {{ x: number; y: number }} Point
 */

export const REDUCED_PREVIEW_SCALE = 0.5;

/**
 * 统一定义“缩小到 50%”的目标尺寸，避免按钮、滚轮和禁用态各自使用不同阈值。
 *
 * @param {number} initialZoomLevel
 * @param {number} [reducedScale]
 * @returns {number}
 */
export function getReducedZoomLevel(
	initialZoomLevel,
	reducedScale = REDUCED_PREVIEW_SCALE,
) {
	return initialZoomLevel * reducedScale;
}

/**
 * 复用默认放大按钮的倍率，保证自定义缩小按钮按相同倍率反向步进。
 *
 * @param {{ initial: number; secondary: number }} zoomLevels
 * @returns {number}
 */
export function getZoomStepMultiplier(zoomLevels) {
	if (!zoomLevels.initial) {
		return 1;
	}

	return Math.max(1, zoomLevels.secondary / zoomLevels.initial);
}

/**
 * 复用 PhotoSwipe 自带的缩放动画时长，让放大、缩小和重置的过渡保持一致。
 *
 * @param {{ zoomAnimationDuration: number | false }} options
 * @returns {number | false}
 */
export function getZoomAnimationDuration(options) {
	return options.zoomAnimationDuration;
}

/**
 * 滚轮缩放也要能到达和缩小按钮相同的 50% 下限，否则两套交互会出现终点不一致。
 *
 * @param {{ initial: number }} zoomLevels
 * @param {number} [reducedScale]
 * @returns {number}
 */
export function getReducedZoomMinLevel(
	zoomLevels,
	reducedScale = REDUCED_PREVIEW_SCALE,
) {
	return getReducedZoomLevel(zoomLevels.initial, reducedScale);
}

/**
 * 缩小按钮不是一次跳到 50%，而是按放大按钮的反向倍率逐步缩小，
 * 只有触达 50% 下限时才停止。
 *
 * @param {number} currentZoomLevel
 * @param {{ initial: number; secondary: number }} zoomLevels
 * @returns {number}
 */
export function getNextReducedZoomLevel(currentZoomLevel, zoomLevels) {
	const stepMultiplier = getZoomStepMultiplier(zoomLevels);
	const minZoomLevel = getReducedZoomMinLevel(zoomLevels);

	return Math.max(minZoomLevel, currentZoomLevel / stepMultiplier);
}

/**
 * 重新计算缩小态的拖拽边界。
 * PhotoSwipe 默认会把“小于视口”的图片锁在中心点，这里改成允许它在可视区域内拖动。
 *
 * @param {{
 *   panAreaSize: Point;
 *   elementSize: Point;
 *   padding: Point;
 * }} options
 * @returns {{
 *   center: Point;
 *   max: Point;
 *   min: Point;
 * }}
 */
export function getZoomedOutPanBounds({ panAreaSize, elementSize, padding }) {
	const center = {
		x: Math.round((panAreaSize.x - elementSize.x) / 2) + padding.x,
		y: Math.round((panAreaSize.y - elementSize.y) / 2) + padding.y,
	};

	const max = {
		x:
			elementSize.x > panAreaSize.x
				? Math.round(panAreaSize.x - elementSize.x) + padding.x
				: padding.x,
		y:
			elementSize.y > panAreaSize.y
				? Math.round(panAreaSize.y - elementSize.y) + padding.y
				: padding.y,
	};

	const min = {
		x:
			elementSize.x > panAreaSize.x
				? padding.x
				: Math.round(panAreaSize.x - elementSize.x) + padding.x,
		y:
			elementSize.y > panAreaSize.y
				? padding.y
				: Math.round(panAreaSize.y - elementSize.y) + padding.y,
	};

	return {
		center,
		max,
		min,
	};
}
