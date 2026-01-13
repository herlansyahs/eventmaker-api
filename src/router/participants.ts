import { Hono } from "hono";
import { prisma } from "../utils/prisma.js";
import { zValidator } from "@hono/zod-validator";
import {
	participantBodySchema,
	updateParticipantValidation,
	getParticipantsQueryValidation,
	participantParamValidation,
} from "../validation/participant-validation.js";

export const participantsRoute = new Hono()
	.get(
		"/",
		zValidator("query", getParticipantsQueryValidation),
		async (c) => {
			try {
				const { eventId } = c.req.valid("query");
				const participants = await prisma.participant.findMany({
					where: {
						eventId,
					},
				});

				return c.json({ data: participants });
			} catch (error) {
				console.error("Failed to list participants", error);
				return c.json({ message: "Failed to retrieve participants" }, 500);
			}
		},
	)
	.post("/", zValidator("json", participantBodySchema), async (c) => {
		try {
			const body = c.req.valid("json");

			const event = await prisma.event.findUnique({
				where: {
					id: body.eventId,
				},
			});

			if (!event) {
				return c.json({ message: "Event not found" }, 404);
			}

			const newParticipant = await prisma.participant.create({
				data: {
					name: body.name,
					email: body.email,
					eventId: body.eventId,
				},
			});

			return c.json({
				data: newParticipant,
				message: "Participant created successfully",
			});
		} catch (error) {
			console.error("Failed to create participant", error);
			return c.json({ message: "Failed to create participant" }, 500);
		}
	})
	.patch(
		"/:id",
		zValidator("param", participantParamValidation),
		zValidator("json", updateParticipantValidation),
		async (c) => {
			const { id } = c.req.valid("param");

			try {
				const body = c.req.valid("json");

				const existingParticipant = await prisma.participant.findUnique({
					where: {
						id,
					},
				});

				if (!existingParticipant) {
					return c.json({ message: "Participant not found" }, 404);
				}

				const event = await prisma.event.findUnique({
					where: {
						id: body.eventId,
					},
				});

				if (!event) {
					return c.json({ message: "Event not found" }, 404);
				}

				const updatedParticipant = await prisma.participant.update({
					where: {
						id,
					},
					data: {
						name: body.name,
						email: body.email,
						eventId: body.eventId,
					},
				});

				return c.json({
					data: updatedParticipant,
					message: "Participant updated successfully",
				});
			} catch (error) {
				console.error(`Failed to update participant with id=${id}`, error);
				return c.json({ message: "Failed to update participant" }, 500);
			}
		},
	)
	.delete(
		"/:id",
		zValidator("param", participantParamValidation),
		async (c) => {
			const { id } = c.req.valid("param");

			try {
				const existingParticipant = await prisma.participant.findUnique({
					where: {
						id,
					},
				});

				if (!existingParticipant) {
					return c.json({ message: "Participant not found" }, 404);
				}

				await prisma.participant.delete({
					where: {
						id,
					},
				});

				return c.json({ message: "Participant deleted successfully" });
			} catch (error) {
				console.error(`Failed to delete participant with id=${id}`, error);
				return c.json({ message: "Failed to delete participant" }, 500);
			}
		},
	);