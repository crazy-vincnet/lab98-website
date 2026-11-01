import { notes } from "@/lib/content";

/** Notes sorted by date, newest first. */
export const sortedNotes = [...notes].sort((a, b) => b.date.localeCompare(a.date));
