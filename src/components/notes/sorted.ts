import { getExperiment, notes } from "@/lib/content";

/** Notes sorted by date, newest first. */
export const sortedNotes = [...notes].sort((a, b) => b.date.localeCompare(a.date));

/** Display code of the project a note belongs to, e.g. "AI-042". */
export const noteExperimentLabel = (experiment?: string) => (experiment ? getExperiment(experiment)?.label : undefined);
