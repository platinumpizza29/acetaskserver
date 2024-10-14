import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// GET all tasks for a collection
router.get("/:collectionId", async (req, res) => {
  try {
    const { collectionId } = req.params;
    const tasks = await prisma.task.findMany({
      where: {
        collectionId: parseInt(collectionId),
        status: false,
      },
    });
    res.json(tasks);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// POST a new task for a collection
router.post("/:collectionId", async (req, res) => {
  try {
    const { collectionId } = req.params;
    const { title, description, dueDate } = req.body;
    const task = await prisma.task.create({
      data: {
        title,
        description,
        dueDate,
        collectionId: parseInt(collectionId),
      },
    });
    // after the task is created send it via the socket to the client
    req.io.emit("created-task", task);
    res.json(task);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// PUT an existing task for a collection
router.put("/:collectionId/:id", async (req, res) => {
  try {
    const { collectionId, id } = req.params;
    const { title, description, dueDate, status } = req.body;
    const task = await prisma.task.update({
      where: {
        id: parseInt(id),
        collectionId: parseInt(collectionId),
      },
      data: {
        title,
        description,
        dueDate,
        status,
      },
    });
    res.json(task);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// DELETE an existing task for a collection
router.delete("/:collectionId/:id", async (req, res) => {
  try {
    const { collectionId, id } = req.params;
    const task = await prisma.task.delete({
      where: {
        id: parseInt(id),
        collectionId: parseInt(collectionId),
      },
    });
    // send the remaing tasks to the client after the task is deleted
    const remainingTasks = await prisma.task.findMany({
      where: {
        collectionId: parseInt(collectionId),
        status: false,
      },
    });
    req.io.emit("remaining-tasks", remainingTasks);
    res.json(task);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;
