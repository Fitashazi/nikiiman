/** Prefix for pages nested under /work/. Set data-root on <html>. */
export const ROOT = document.documentElement.dataset.root || "./";

export function asset(src) {
  if (!src) return src;
  if (/^(https?:|data:|\/)/i.test(src)) return src;
  if (src.startsWith("../") || src.startsWith("./")) return src;
  return ROOT + src.replace(/^\//, "");
}

export function page(path) {
  return ROOT + String(path).replace(/^\//, "");
}
