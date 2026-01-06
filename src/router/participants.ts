import { Hono } from "hono";
import { prisma } from "../utils/prisma.js";
import { zValidator } from "@hono/zod-validator";
import { createParticipantValidation, updateParticipantValidation } from "../validation/participant-validation.js";

export const participantsRoute = new Hono()
  .get("/", async (c) => {
    const participants = await prisma.participant.findMany({
      include: {
        event: true,
      },
    });
    return c.json({ participants });
  })
  .get("/:id", async (c) => {
    const id = c.req.param("id");
    const participant = await prisma.participant.findFirst({
      where: {
        id: id,
      },
      include: {
        event: true,
      },
    });
    
    if (!participant) {
      return c.json({ error: "Participant not found" }, 404);
    }
    
    return c.json({ participant });
  })
  .post("/", zValidator("json", createParticipantValidation), async (c) => {
    const body = c.req.valid("json");
    
    const eventExists = await prisma.event.findFirst({
      where: { id: body.eventId },
    });
    
    if (!eventExists) {
      return c.json({ error: "Event not found" }, 404);
    }
    
    const newParticipant = await prisma.participant.create({
      data: {
        name: body.name,
        email: body.email,
        eventId: body.eventId,
      },
      include: {
        event: true,
      },
    });
    
    return c.json({ participant: newParticipant }, 201);
  })
  .patch("/:id", zValidator("json", updateParticipantValidation), async (c) => {
    const id = c.req.param("id");
    const body = c.req.valid("json");
    
    const participantExists = await prisma.participant.findFirst({
      where: { id: id },
    });
    
    if (!participantExists) {
      return c.json({ error: "Participant not found" }, 404);
    }
    
    if (body.eventId) {
      const eventExists = await prisma.event.findFirst({
        where: { id: body.eventId },
      });
      
      if (!eventExists) {
        return c.json({ error: "Event not found" }, 404);
      }
    }
    
    const updatedParticipant = await prisma.participant.update({
      where: {
        id: id,
      },
      data: {
        name: body.name,
        email: body.email,
        eventId: body.eventId,
      },
      include: {
        event: true,
      },
    });
    
    return c.json({ participant: updatedParticipant });
  })
  .delete("/:id", async (c) => {
    const id = c.req.param("id");
    
    const participantExists = await prisma.participant.findFirst({
      where: { id: id },
    });
    
    if (!participantExists) {
      return c.json({ error: "Participant not found" }, 404);
    }
    
    await prisma.participant.delete({
      where: {
        id: id,
      },
    });
    
    return c.json({ message: "Participant deleted successfully" });
  });
