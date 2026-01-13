import z from "zod";

export const getParticipantsQueryValidation = z.object({
	eventId: z.string().trim(),
});

export const participantParamValidation = z.object({
	id: z.string().trim(),
});

export const participantBodySchema = z.object({
	name: z.string().trim().min(1, "Name is required"),
	email: z.email().transform((val) => val.toLowerCase().trim()),
	eventId: z.string().trim(),
});

export const updateParticipantValidation = z.object({
	name: z.string().trim().optional(),
	email: z
		.email()
		.transform((val) => val.toLowerCase().trim())
		.optional(),
	eventId: z.string().trim().optional(),
});