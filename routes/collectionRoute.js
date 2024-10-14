import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import authenticateToken from "../utils/auth.js";

const router = Router();
const prisma = new PrismaClient();

// get a user's collections
router.get("/user", authenticateToken, async (req, res) => {
  console.log(req);
  const userId = parseInt(req.user.userId);
  try {
    const collections = await prisma.collection.findMany({
      where: { userId: userId },
      include: { tasks: { where: { status: false } } },
    });
    res.json(collections);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// get a collection by id
router.get("/:id", authenticateToken, async (req, res) => {
  const userId = parseInt(req.user.userId);
  try {
    const { id } = req.params;
    const collection = await prisma.collection.findUnique({
      where: { id: parseInt(id), userId: userId },
      include: { tasks: { where: { status: false } } },
    });
    if (collection) {
      res.json(collection);
    } else {
      res.status(404).json({ error: "Collection not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// create a new collection
router.post("/", authenticateToken, async (req, res) => {
  const userId = parseInt(req.user.userId);
  try {
    const { title } = req.body;
    // check if the collection with the same title already exists
    const existingCollection = await prisma.collection.findFirst({
      where: { title, userId },
    });
    if (existingCollection) {
      res.status(400).json({ error: "Collection already exists" });
      return;
    }
    const newCollection = await prisma.collection.create({
      data: { title, userId },
      include: { tasks: true },
    });
    req.io.emit("new-collection", newCollection);
    res.json(newCollection);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// update a collection
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const updatedCollection = await prisma.collection.update({
      where: { id },
      data: { title },
    });
    res.json(updatedCollection);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// delete a collection
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCollection = await prisma.collection.delete({
      where: { id },
    });
    // when a collection is deleted, send all remaining collections to the client
    const remainingCollections = await prisma.collection.findMany({
      where: { userId: deletedCollection.userId },
    });
    req.io.emit("deleted-collections", remainingCollections);
    res.json(deletedCollection);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
