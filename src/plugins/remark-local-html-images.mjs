import { readFile, mkdir, readdir, copyFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { visit } from "unist-util-visit";

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
	if (shouldSkipSrc(src) || !markdownFilePath) {
		return null;
	}

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
				server.middlewares.use(
					createDevContentAssetMiddleware({ contentRoot, basePath }),
				);
			},
			"astro:build:done": async ({ dir, logger }) => {
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
