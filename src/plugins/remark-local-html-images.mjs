import { readFile, mkdir, readdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { visit } from "unist-util-visit";

// 这组工具负责把 Markdown 正文里的原生 HTML 本地图片接回站点资源链路。
// 目标不是接入 Astro 的图片优化，而是让现有 <img src="./xxx.assets/a.png"> 写法
// 在 dev 和 build 产物里都落到稳定的 /content-assets/* 访问路径上。
export const CONTENT_ASSET_BASE_PATH = "/content-assets";

const IMAGE_EXTENSIONS = new Set([
	".png",
	".jpg",
	".jpeg",
	".gif",
	".webp",
	".avif",
	".svg",
]);

const MIME_TYPES = {
	".png": "image/png",
	".jpg": "image/jpeg",
	".jpeg": "image/jpeg",
	".gif": "image/gif",
	".webp": "image/webp",
	".avif": "image/avif",
	".svg": "image/svg+xml",
};

function toPosixPath(value) {
	return value.replace(/\\/g, "/");
}

function trimQueryAndHash(value) {
	return value.split("#", 1)[0].split("?", 1)[0];
}

function shouldSkipSrc(src) {
	return (
		typeof src !== "string" ||
		src.length === 0 ||
		src.startsWith("/") ||
		src.startsWith("http://") ||
		src.startsWith("https://") ||
		src.startsWith("data:")
	);
}

function isImageAssetPath(filePath) {
	return IMAGE_EXTENSIONS.has(path.extname(trimQueryAndHash(filePath)).toLowerCase());
}

function isPathInsideRoot(filePath, rootPath) {
	const relativePath = path.relative(rootPath, filePath);
	return relativePath !== "" && !relativePath.startsWith("..") && !path.isAbsolute(relativePath);
}

function getContentAssetRelativePath(filePath, contentRoot) {
	const relativePath = path.relative(contentRoot, filePath);
	if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
		return null;
	}

	return toPosixPath(relativePath);
}

export function resolveContentAssetPublicPath(
	src,
	{
		contentRoot = fileURLToPath(new URL("../content/", import.meta.url)),
		markdownFilePath,
		basePath = CONTENT_ASSET_BASE_PATH,
	} = {},
) {
	// 只处理“相对当前 Markdown 文件”的本地图片，外链、public 资源和 data URL 保持原样。
	if (shouldSkipSrc(src) || !markdownFilePath) {
		return null;
	}

	// 先把相对路径解析成磁盘绝对路径，再校验它仍然位于 src/content 内，
	// 避免 HTML 直接引用到内容目录之外的任意文件。
	const resolvedPath = path.resolve(path.dirname(markdownFilePath), src);
	if (!isImageAssetPath(resolvedPath)) {
		return null;
	}

	const relativePath = getContentAssetRelativePath(resolvedPath, contentRoot);
	if (!relativePath) {
		return null;
	}

	return `${basePath}/${relativePath}`;
}

export function rewriteHtmlImageSources(
	html,
	{
		contentRoot = fileURLToPath(new URL("../content/", import.meta.url)),
		markdownFilePath,
		basePath = CONTENT_ASSET_BASE_PATH,
		onWarning,
	} = {},
) {
	if (typeof html !== "string" || !html.includes("<img")) {
		return html;
	}

	// 这里只改写 img 的 src，alt/style/class 等作者手写属性全部原样保留，
	// 这样可以兼容现有文章里的缩放样式和点击预览选择器。
	return html.replace(/<img\b[^>]*>/gi, (imgTag) => {
		const srcMatch = imgTag.match(
			/\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i,
		);
		if (!srcMatch) {
			return imgTag;
		}

		const originalSrc = srcMatch[1] ?? srcMatch[2] ?? srcMatch[3] ?? "";
		const rewrittenSrc = resolveContentAssetPublicPath(originalSrc, {
			contentRoot,
			markdownFilePath,
			basePath,
		});

		if (!rewrittenSrc) {
			if (
				!shouldSkipSrc(originalSrc) &&
				markdownFilePath &&
				isImageAssetPath(originalSrc)
			) {
				onWarning?.(
					`Skipped local HTML image outside src/content: ${originalSrc} (${markdownFilePath})`,
				);
			}
			return imgTag;
		}

		const quote = srcMatch[1] !== undefined ? '"' : srcMatch[2] !== undefined ? "'" : '"';
		return imgTag.replace(
			srcMatch[0],
			`src=${quote}${rewrittenSrc}${quote}`,
		);
	});
}

async function collectContentAssetFiles(contentRoot, currentDir = contentRoot) {
	const entries = await readdir(currentDir, { withFileTypes: true });
	const collected = [];

	for (const entry of entries) {
		const absolutePath = path.join(currentDir, entry.name);
		if (entry.isDirectory()) {
			collected.push(...(await collectContentAssetFiles(contentRoot, absolutePath)));
			continue;
		}

		if (!entry.isFile() || !isImageAssetPath(absolutePath)) {
			continue;
		}

		const relativePath = getContentAssetRelativePath(absolutePath, contentRoot);
		if (!relativePath) {
			continue;
		}

		collected.push({
			absolutePath,
			relativePath,
		});
	}

	return collected;
}

export async function copyContentAssetFiles({
	contentRoot = fileURLToPath(new URL("../content/", import.meta.url)),
	outputRoot,
} = {}) {
	if (!outputRoot) {
		throw new Error("outputRoot is required");
	}

	// build 阶段不去按“引用图”做精确裁剪，而是复制 src/content 下所有图片文件。
	// 这样能同时覆盖 *.assets 和其他内容资源目录，避免作者改文章结构后漏图。
	const entries = await collectContentAssetFiles(contentRoot);

	for (const entry of entries) {
		const destinationPath = path.join(outputRoot, entry.relativePath);
		await mkdir(path.dirname(destinationPath), { recursive: true });
		await copyFile(entry.absolutePath, destinationPath);
	}

	return entries.map((entry) => entry.relativePath);
}

export function remarkLocalHtmlImages({
	contentRoot = fileURLToPath(new URL("../content/", import.meta.url)),
	basePath = CONTENT_ASSET_BASE_PATH,
} = {}) {
	return (tree, file) => {
		// Astro 在这里会把当前 Markdown 文件路径挂到 vfile 上，
		// 后续所有相对 src 都基于这篇文章自身所在目录解析。
		const markdownFilePath = file?.path ?? file?.history?.[0];

		visit(tree, "html", (node) => {
			node.value = rewriteHtmlImageSources(node.value, {
				contentRoot,
				markdownFilePath,
				basePath,
				onWarning: (message) => console.warn(`[remark-local-html-images] ${message}`),
			});
		});
	};
}

export function createDevContentAssetMiddleware({
	contentRoot = fileURLToPath(new URL("../content/", import.meta.url)),
	basePath = CONTENT_ASSET_BASE_PATH,
}) {
	return async (req, res, next) => {
		// dev 环境直接把 /content-assets/* 映射回 src/content，
		// 这样文章无需等待 build，也能预览原生 HTML 图片。
		const requestUrl = req.url?.split("?", 1)[0] ?? "";
		if (!requestUrl.startsWith(basePath)) {
			return next();
		}

		const relativeRequestPath = decodeURIComponent(
			requestUrl.slice(basePath.length).replace(/^\/+/, ""),
		);
		if (!relativeRequestPath) {
			return next();
		}

		const resolvedPath = path.resolve(contentRoot, relativeRequestPath);
		if (
			!isPathInsideRoot(resolvedPath, contentRoot) ||
			!isImageAssetPath(resolvedPath)
		) {
			return next();
		}

		try {
			const fileContent = await readFile(resolvedPath);
			res.statusCode = 200;
			res.setHeader(
				"Content-Type",
				MIME_TYPES[path.extname(resolvedPath).toLowerCase()] ??
					"application/octet-stream",
			);
			res.setHeader("Cache-Control", "no-cache");
			res.end(fileContent);
		} catch {
			next();
		}
	};
}

export function contentAssetsIntegration({
	contentRoot = fileURLToPath(new URL("../content/", import.meta.url)),
	basePath = CONTENT_ASSET_BASE_PATH,
} = {}) {
	return {
		name: "content-assets",
		hooks: {
			"astro:server:setup": ({ server }) => {
				// 开发服务器接入静态映射，保证 /content-assets 在本地可直接访问。
				server.middlewares.use(
					createDevContentAssetMiddleware({ contentRoot, basePath }),
				);
			},
			"astro:build:done": async ({ dir, logger }) => {
				// 构建完成后再复制图片，能拿到最终 dist 目录，且不会干扰 Astro 自己的资源产出。
				const outputRoot = fileURLToPath(
					new URL(`./${basePath.replace(/^\/+/, "")}/`, dir),
				);
				const copied = await copyContentAssetFiles({
					contentRoot,
					outputRoot,
				});
				logger.info(`Copied ${copied.length} content image assets to ${basePath}`);
			},
		},
	};
}
