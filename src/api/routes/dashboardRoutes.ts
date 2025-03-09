import { Router } from "express";
import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = Router();

router.get("/drive", async (req, res) => {
  try {
    // Resolve the path correctly
    const filePath = path.join(__dirname, "..", "storage", "drive.txt");
    const drive = await fs.readFile(filePath, "utf-8");
    res.json({ drive: drive.trim() });
  } catch (error) {
    console.error("Error reading file:", error);
    res.status(500).json({ error: "Failed to read drive file" });
  }
});

export default router;
