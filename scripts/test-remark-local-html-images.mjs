import assert from "node:assert/strict";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import {
	CONTENT_ASSET_BASE_PATH,
	copyContentAssetFiles,
	createDevContentAssetMiddleware,
	resolveContentAssetPublicPath,
	rewriteHtmlImageSources,
} from "../src/plugins/remark-local-html-images.mjs";

async function run(name, fn) {
	try {
		await fn();
		console.log(`PASS ${name}`);
	} catch (error) {
		console.error(`FAIL ${name}`);
		throw error;
	}
}

await run("rewriteHtmlImageSources rewrites local HTML image src under src/content", async () => {
	const contentRoot = "C:/repo/src/content";
	const markdownFilePath = "C:/repo/src/content/posts/example.md";
	const html =
		'<p><img src="./example.assets/shot.png" alt="shot" style="zoom:50%;" /></p>';

	const rewritten = rewriteHtmlImageSources(html, {
		contentRoot,
		markdownFilePath,
	});

	assert.match(
		rewritten,
		new RegExp(
			`${CONTENT_ASSET_BASE_PATH}/posts/example\\.assets/shot\\.png`,
		),
	);
	assert.match(rewritten, /style="zoom:50%;"/);
	assert.match(rewritten, /alt="shot"/);
});

await run("rewriteHtmlImageSources leaves external, public, and data URLs untouched", async () => {
	const contentRoot = "C:/repo/src/content";
	const markdownFilePath = "C:/repo/src/content/posts/example.md";
	const html = [
		'<img src="https://example.com/a.png" alt="external" />',
		'<img src="/images/a.png" alt="public" />',
		'<img src="data:image/png;base64,abc" alt="inline" />',
	].join("");

	const rewritten = rewriteHtmlImageSources(html, {
		contentRoot,
		markdownFilePath,
	});

	assert.equal(rewritten, html);
});

await run("resolveContentAssetPublicPath rejects paths outside src/content", async () => {
	const contentRoot = "C:/repo/src/content";
	const markdownFilePath = "C:/repo/src/content/posts/example.md";

	const rewritten = resolveContentAssetPublicPath("../../../outside.png", {
		contentRoot,
		markdownFilePath,
	});

	assert.equal(rewritten, null);
});

await run("copyContentAssetFiles copies only image files and preserves content-relative paths", async () => {
	const tempRoot = await mkdtemp(path.join(os.tmpdir(), "content-assets-"));
	const contentRoot = path.join(tempRoot, "src", "content");
	const outputRoot = path.join(tempRoot, "dist", "content-assets");

	try {
		mkdirSync(path.join(contentRoot, "posts", "example.assets"), {
			recursive: true,
		});
		mkdirSync(path.join(contentRoot, "posts", "notes"), {
			recursive: true,
		});

		writeFileSync(
			path.join(contentRoot, "posts", "example.assets", "shot.png"),
			"png",
		);
		writeFileSync(
			path.join(contentRoot, "posts", "example.assets", "cover.webp"),
			"webp",
		);
		writeFileSync(path.join(contentRoot, "posts", "notes", "draft.md"), "text");

		const copied = await copyContentAssetFiles({
			contentRoot,
			outputRoot,
		});

		assert.deepEqual(copied.sort(), [
			"posts/example.assets/cover.webp",
			"posts/example.assets/shot.png",
		]);
		assert.equal(
			existsSync(path.join(outputRoot, "posts", "example.assets", "shot.png")),
			true,
		);
		assert.equal(
			existsSync(path.join(outputRoot, "posts", "notes", "draft.md")),
			false,
		);
	} finally {
		await rm(tempRoot, { recursive: true, force: true });
	}
});

await run("createDevContentAssetMiddleware serves image bytes for content-assets requests", async () => {
	const tempRoot = await mkdtemp(path.join(os.tmpdir(), "content-assets-dev-"));
	const contentRoot = path.join(tempRoot, "src", "content");
	const imagePath = path.join(
		contentRoot,
		"posts",
		"example.assets",
		"shot.png",
	);

	try {
		mkdirSync(path.dirname(imagePath), { recursive: true });
		writeFileSync(imagePath, "png");

		const middleware = createDevContentAssetMiddleware({ contentRoot });
		const headers = {};
		let body = null;
		let nextCalled = false;

		await middleware(
			{ url: "/content-assets/posts/example.assets/shot.png?cache=0" },
			{
				statusCode: 0,
				setHeader(name, value) {
					headers[name] = value;
				},
				end(value) {
					body = value;
				},
			},
			() => {
				nextCalled = true;
			},
		);

		assert.equal(nextCalled, false);
		assert.equal(headers["Content-Type"], "image/png");
		assert.equal(body.toString(), "png");
	} finally {
		await rm(tempRoot, { recursive: true, force: true });
	}
});
