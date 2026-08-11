// src/lib/utils.js
/**
 * Utility to combine Tailwind class names conditionally.
 * Similar to classnames library but minimal.
 */
export function cn(...args) {
  return args
    .flatMap((arg) => {
      if (!arg) return [];
      if (typeof arg === "string") return arg.split(/\s+/);
      if (Array.isArray(arg)) return cn(...arg);
      if (typeof arg === "object") {
        return Object.entries(arg)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => key);
      }
      return [];
    })
    .join(" ");
}
