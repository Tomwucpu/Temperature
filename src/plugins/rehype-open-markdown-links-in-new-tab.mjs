import { visit } from "unist-util-visit";

const SKIPPED_PROTOCOLS = ["mailto:", "tel:", "javascript:"];

function normalizeRel(rel) {
	if (Array.isArray(rel)) {
		return [...rel];
	}

	if (typeof rel === "string") {
		return rel.split(/\s+/).filter(Boolean);
	}

	return [];
}

function shouldSkipHref(href) {
	if (typeof href !== "string" || href.length === 0) {
		return true;
	}

	if (href.startsWith("#")) {
		return true;
	}

	return SKIPPED_PROTOCOLS.some((protocol) => href.startsWith(protocol));
}

export function rehypeOpenMarkdownLinksInNewTab() {
	return (tree) => {
		visit(tree, "element", (node) => {
			if (node.tagName !== "a") {
				return;
			}

			const href = node.properties?.href;
			if (shouldSkipHref(href)) {
				return;
			}

			const rel = normalizeRel(node.properties?.rel);
			if (!rel.includes("noopener")) {
				rel.push("noopener");
			}
			if (!rel.includes("noreferrer")) {
				rel.push("noreferrer");
			}

			node.properties = {
				...node.properties,
				target: "_blank",
				rel,
			};
		});
	};
}
