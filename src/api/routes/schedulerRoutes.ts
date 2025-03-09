import { Router } from "express";
import {
  backupDatabase,
  compressBackup,
  ensureDirectoryExists,
  getDatabaseSize,
  sendEmail,
} from "../utils/scheduler";

const router = Router();

router.post("/directory", (req, res) => {
  const { directory } = req.body;
  ensureDirectoryExists(directory);

  res.status(204).end();
});

// router.get("/database", async (req, res) => {
//   const { server, user, password, database } = req.body;

//   if (!server || !database || !user || !password) {
//     return res.status(400).json({
//       message: "Server, database, password, and user parameters are required.",
//     });
//   }

//   const databaseSize = await getDatabaseSize(server, database, user, password);
//   res.json({ size: databaseSize });
// });

router.post("/backup", async (req, res) => {
  const { server, user, password, database, backupDir } = req.body;

  if (!server || !user || !password || !database || !backupDir) {
    return res.status(400).json({
      message:
        "Server, database, backup directory, user, and password parameters are required.",
    });
  }

  const response = await backupDatabase(
    server,
    database,
    backupDir,
    user,
    password
  ).catch((error) => {
    console.error("❌ Error backing up database:", error);
    res.status(500).json({ message: `Error backing up database: ${error}` });
  });
  const databaseSize = await getDatabaseSize(server, database, user, password);
  res.json({ ...response, origDatabaseSize: databaseSize });
});

router.post("/compress", async (req, res) => {
  try {
    const { backupFileDir, zipPassword, originalDBSize, dbDir } = req.body;

    console.log(req.body);

    if (!zipPassword || !backupFileDir || !originalDBSize) {
      return res.status(400).json({
        message: "backupDir, original db size parameters are required.",
      });
    }

    const compressedBackup = await compressBackup(
      backupFileDir,
      zipPassword,
      dbDir,
      originalDBSize
    );

    // ✅ Send response back once compression is done
    return res.status(200).json(compressedBackup);
  } catch (error) {
    console.error("❌ Compression failed:", error);
    return res.status(500).json({ message: "Compression failed", error });
  }
});

router.post("/email", async (req, res) => {
  const {
    backupFile,
    completedAt,
    originalDBSize,
    compressedSize,
    remainingStorage,
  } = req.body;

  if (!backupFile || !completedAt || !originalDBSize || !compressedSize) {
    return res.status(400).json({
      message:
        "backupFile, completedAt, originalDBSize, and compressedSize parameters are required.",
    });
  }
  // const formattedOriginalDBSize = Number(originalDBSize).toLocaleString(
  //   undefined,
  //   {
  //     minimumFractionDigits: 2,
  //     maximumFractionDigits: 2,
  //   }
  // );

  await sendEmail({
    backupLocation: backupFile,
    dateCompleted: completedAt,
    dbSize: `${originalDBSize}`,
    compressedSize,
    diskSpace: remainingStorage,
  });

  res.json({ message: "Email sent successfully." });
});

export default router;
