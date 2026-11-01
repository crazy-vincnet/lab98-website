/** Tiny class joiner for the admin primitives. */
export const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ");
