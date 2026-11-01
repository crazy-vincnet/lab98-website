import { notes } from "@/lib/content";
import type { Note } from "@/lib/content";

/** Notes sorted by date, newest first. */
export const sortNotes = (list: readonly Note[]) => [...list].sort((a, b) => b.date.localeCompare(a.date));

/** Korean notes, sorted. For other locales use sortNotes(getContent(locale).notes). */
export const sortedNotes = sortNotes(notes);
