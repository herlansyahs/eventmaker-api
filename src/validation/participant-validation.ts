import z from "zod";

export const createParticipantValidation = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.email(),
  eventId: z.string().min(1, "Event ID is required"),
});

export const updateParticipantValidation = z.object({
  name: z.string().min(1).optional(),
  email: z.email().optional(),
  eventId: z.string().min(1).optional(),
});
