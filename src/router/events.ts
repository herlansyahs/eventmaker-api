import { Hono } from "hono";
import { prisma } from "../utils/prisma.js";
import { zValidator } from "@hono/zod-validator";
import {
	createEventValidation,
	updateEventValidation,
} from "../validation/event-validation.js";

export const eventsRoute = new Hono()
	.get("/", async (c) => {
		try {
			const events = await prisma.event.findMany({
				include: {
					participants: true,
				},
			});
			return c.json({ data: events });
		} catch (error) {
			console.error("Failed to list events", error);
			return c.json({ message: "Failed to retrieve events" }, 500);
		}
	})
	.get("/:id", async (c) => {
		const id = c.req.param("id");

		try {
			const event = await prisma.event.findFirst({
				where: {
					id: id,
				},
				include: {
					participants: true,
				},
			});

			return c.json({ data: event });
		} catch (error) {
			console.error(`Failed to get event with id=${id}`, error);
			return c.json({ message: "Failed to retrieve event" }, 500);
		}
	})
	.post("/", zValidator("json", createEventValidation), async (c) => {
		const body = c.req.valid("json");

		try {
			const newEvent = await prisma.event.create({
				data: {
					name: body.name,
					description: body.description,
					dateTime: body.dateTime,
					location: body.location,
				},
			});
			return c.json({ data: newEvent, message: "Event created successfully" });
		} catch (error) {
			console.error("Failed to create event", error);
			return c.json({ message: "Failed to create event" }, 500);
		}
	})
	.patch("/:id", zValidator("json", updateEventValidation), async (c) => {
		const id = c.req.param("id");

		try {
			const body = c.req.valid("json");
			const updatedEvent = await prisma.event.update({
				where: {
					id: id,
				},
				data: {
					name: body.name,
					description: body.description,
					dateTime: body.dateTime,
					location: body.location,
				},
			});

			return c.json({
				data: updatedEvent,
				message: "Event updated successfully",
			});
		} catch (error) {
			console.error(`Failed to update event with id=${id}`, error);
			return c.json({ message: "Failed to update event" }, 500);
		}
	})
	.delete("/:id", async (c) => {
		const id = c.req.param("id");

		try {
			await prisma.event.delete({
				where: {
					id: id,
				},
			});
			return c.json({ message: "Event deleted successfully" });
		} catch (error) {
			console.error(`Failed to delete event with id=${id}`, error);
			return c.json({ message: "Failed to delete event" }, 500);
		}
	});