import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const builtPostPath = new URL(
	"../dist/posts/用minio搭建个人oss存储/index.html",
	import.meta.url,
);

const html = await readFile(builtPostPath, "utf8");

assert.match(
	html,
	/\/content-assets\/posts\/用MinIO搭建个人oss存储\.assets\/image-20260412192423878\.png/,
);
assert.doesNotMatch(
	html,
	/\.\/用MinIO搭建个人oss存储\.assets\/image-20260412192423878\.png/,
);
