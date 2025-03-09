import path from "path";
import { exec } from "child_process";
import nodemailer from "nodemailer";
import fs from "fs";
import * as diskusage from "diskusage";
import { randomUUID } from "crypto";

// Function to check if the database exists
// const databaseExists = (server: string, database: string) => {
//   return new Promise<boolean>((resolve, reject) => {
//     const sqlCommand = `SELECT name FROM sys.databases WHERE name = '${database}';`;
//     const command = `sqlcmd -S ${server} -E -Q "${sqlCommand}"`;

//     exec(command, (error, stdout, stderr) => {
//       if (error) {
//         console.error(
//           "❌ Error checking database existence:",
//           stderr || error.message
//         );
//         return reject(error);
//       }
//       resolve(stdout.includes(database));
//     });
//   });
// };

// 🔴 Function to Remove Database
// const removeDatabase = async (server: string, database: string) => {
//   const exists = await databaseExists(server, database);
//   if (!exists) {
//     console.log(`⚠️ Database '${database}' does not exist.`);
//     return;
//   }

//   return new Promise<void>((resolve, reject) => {
//     const dropDbCommand = `sqlcmd -S ${server} -E -Q "DROP DATABASE ${database};"`;

//     exec(dropDbCommand, (error, stdout, stderr) => {
//       if (error) {
//         console.error("❌ Error removing database:", stderr || error.message);
//         return reject(error);
//       }
//       console.log("✅ Database removed successfully.");
//       resolve();
//     });
//   });
// };

export const sendEmail = async ({
  backupLocation,
  dateCompleted,
  dbSize,
  compressedSize,
  diskSpace,
}) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: { user: "jonathanjamer2004@gmail.com", pass: "gxkq blru mvwd eigc" },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates
    },
  });

  let mailOptions = {
    from: "jonathanjamer2004@gmail.com",
    to: "jonathanjamer123@gmail.com",
    subject: "Database Backup Completed",
    html: `
     <div
      style="
        max-width: 600px;
        margin: auto;
        font-family: 'Inter', sans-serif;
        background: #ffffff;
        border-radius: 12px;
        box-shadow: 0 6px 18px rgba(0, 0, 0, 0.1);
        overflow: hidden;
        border: 1px solid #e5e7eb;
      "
    >
      <!-- Header with Background & Gradient -->
      <div
        style="
          background: linear-gradient(135deg, #1e293b, #334155);
          color: #ffffff;
          text-align: center;
          padding: 20px;
          font-size: 20px;
          font-weight: 600;
          letter-spacing: 0.5px;
        "
      >
        Database Backup Report
      </div>

      <!-- Success Badge -->
      <div
        style="
          display: flex;
          justify-content: center;
          align-items: center;
          background: #d1fae5;
          color: #047857;
          padding: 8px 14px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
          border: 1px solid #10b981;
          width: fit-content;
          margin: 16px auto;
        "
      >
        Backup Completed Successfully
      </div>

      <!-- Information Table -->
      <table
        style="
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
          background: #ffffff;
        "
      >
        <tr style="background: #f8fafc">
          <td style="padding: 16px; font-weight: 600; color: #1e293b">
            Backup Location:
          </td>
          <td style="padding: 16px; color: #374151">${backupLocation}</td>
        </tr>
        <tr>
          <td
            style="
              padding: 16px;
              font-weight: 600;
              color: #1e293b;
              background: #f1f5f9;
            "
          >
            Date Completed:
          </td>
          <td style="padding: 16px; color: #374151; background: #f1f5f9">
            ${dateCompleted}
          </td>
        </tr>
        <tr style="background: #f8fafc">
          <td style="padding: 16px; font-weight: 600; color: #1e293b">
            Database Size:
          </td>
          <td style="padding: 16px; color: #374151">${dbSize}</td>
        </tr>
        <tr>
          <td
            style="
              padding: 16px;
              font-weight: 600;
              color: #1e293b;
              background: #f1f5f9;
            "
          >
            Compressed Size:
          </td>
          <td style="padding: 16px; color: #374151; background: #f1f5f9">
            ${compressedSize}
          </td>
        </tr>
        <tr style="background: #f8fafc">
          <td style="padding: 16px; font-weight: 600; color: #1e293b">
            Available Disk Space:
          </td>
          <td style="padding: 16px; color: #374151">${diskSpace}</td>
        </tr>
      </table>

      <p
        style="
          text-align: center;
          font-size: 13px;
          margin-top: 20px;
          color: #6b7280;
          font-style: italic;
          padding-bottom: 20px;
        "
      >
        This is an automated message. Please do not reply.
      </p>
    </div>
    `,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("❌ Error sending email:", error);
      throw new Error(`Failed to send email: ${error}`);
    }
    console.log("✅ Email sent:", info.response);
  });
};

export const getDatabaseSize = (
  server: string,
  database: string,
  username: string,
  password: string
) => {
  return new Promise<number>((resolve, reject) => {
    // Escape database name properly
    const escapedDatabase = database.replace(/'/g, "''");

    // Single-line SQL query
    const sqlCommand = `USE [${escapedDatabase}]; SELECT COALESCE(SUM(CAST(size AS BIGINT)) * 8 * 1024, 0) AS size_in_bytes FROM sys.database_files;`;

    // Correct sqlcmd format
    const command = `sqlcmd -S "${server}" -U "${username}" -P "${password}" -Q "${sqlCommand}" -h-1 -W`;

    console.log("Executing command:", command);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(
          "❌ Error getting database size:",
          stderr || error.message
        );
        return reject(error);
      }

      console.log("🔍 Raw SQLCMD Output:", stdout);

      // Extract the correct number from the output
      const lines = stdout
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean);
      const sizeLine = lines.find((line) => /^\d+$/.test(line)); // Find the line with only digits

      if (!sizeLine) {
        return reject(
          new Error("Failed to retrieve database size. Output: " + stdout)
        );
      }

      resolve(parseInt(sizeLine, 10) / (1024 * 1024));
    });
  });
};

// 🟠 Compress Backup File Using 7-Zip
export const compressBackup = (
  backupFileDir: string,
  zipPassword: string,
  dbDir,
  originalDBSize
) => {
  return new Promise<{
    message: string;
    completedAt: string;
    driveSpace: string;
    compressedSize: string;
    originalSize: string;
    backupFileDir: string;
  }>((resolve, reject) => {
    if (!fs.existsSync(backupFileDir)) {
      console.error("❌ Backup file does not exist:", backupFileDir);
      return reject(new Error("Backup file not found."));
    }

    const zipFile = `${backupFileDir.replace(/\.bak$/, "")}.7z`;
    const zipCommand = `"C:\\Program Files\\7-Zip\\7z.exe" a -t7z "${zipFile}" "${backupFileDir}" -mx5 -p"${zipPassword}" -mhe=on`;

    exec(zipCommand, async (error, stdout, stderr) => {
      console.log("📌 7-Zip Output:", stdout);
      console.error("⚠️ 7-Zip Error:", stderr);

      if (error) {
        console.error(
          "❌ Error compressing database:",
          stderr || error.message
        );
        return reject(error);
      }

      console.log("✅ Database successfully compressed and encrypted.");

      // ❌ Remove the original uncompressed backup file
      fs.unlink(backupFileDir, (unlinkError) => {
        if (unlinkError) {
          console.error(
            "⚠️ Failed to delete uncompressed backup:",
            unlinkError.message
          );
        } else {
          console.log("✅ Uncompressed backup file removed.");
        }
      });

      // Get current date and time in the required format
      const now = new Date();
      const formattedDate = now.toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      // Format it to match YYYY-MM-DD, hh:mm am/pm
      const completedAt = formattedDate
        .replace(",", "")
        .replace(/\//g, "-")
        .replace(/(\d+)-(\d+)-(\d+)/, "$3-$1-$2") // Convert MM-DD-YYYY to YYYY-MM-DD
        .toLowerCase();

      // Get remaining disk storage percentage
      let remainingStorage = "Unknown";
      try {
        const drive = path.parse(dbDir).root; // Get the drive letter (e.g., "D:/")
        const { free, total } = diskusage.checkSync(drive);
        const percentageRemaining = ((free / total) * 100).toFixed(2);
        remainingStorage = `${percentageRemaining}%`;
      } catch (err) {
        console.error("⚠️ Error fetching disk space:", err.message);
      }

      // Get compressed file size
      let compressedSize = "Unknown";
      try {
        if (fs.existsSync(zipFile)) {
          const stats = fs.statSync(zipFile);
          const compressedSizedd = Number(
            stats.size / (1024 * 1024)
          ).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          });
          compressedSize = compressedSizedd; // Convert bytes to MB
        }
      } catch (err) {
        console.error("⚠️ Error fetching compressed file size:", err.message);
      }

      const formattedOriginalDBSize = Number(originalDBSize).toLocaleString(
        undefined,
        {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }
      );

      resolve({
        message: "Database successfully compressed and encrypted.",
        completedAt: completedAt,
        driveSpace: remainingStorage,
        compressedSize: `${compressedSize} MB`,
        originalSize: `${formattedOriginalDBSize} MB`,
        backupFileDir: backupFileDir,
      });
    });
  });
};

// Function to ensure directory exists
export const ensureDirectoryExists = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log("Created new directory.");
  }
};

// 🔵 Backup Database Function
export const backupDatabase = async (
  server: string,
  database: string,
  backupDir: string,
  username: string,
  password: string
): Promise<{
  backupDir: string;
  backupFileDir: string;
  backupFile: string;
  message: string;
}> => {
  return new Promise((resolve, reject) => {
    // Generate backup filename: database_backup_YYYY-MM-DD_UUID.bak
    const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    const uniqueId = randomUUID(); // Generate unique ID
    const backupFileDir = path.join(
      backupDir,
      `${database}_backup_${date}_${uniqueId}.bak`
    );
    const backupFile = `${database}_backup_${date}_${uniqueId}.bak`;

    const backupCommand = `sqlcmd -S ${server} -U ${username} -P ${password} -Q "BACKUP DATABASE ${database} TO DISK='${backupFileDir}' WITH FORMAT, COMPRESSION, INIT;"`;

    exec(backupCommand, (error, stdout, stderr) => {
      if (error) {
        console.error("❌ Error backing up database:", stderr || error.message);
        return reject(error);
      }
      if (stdout.includes("Msg 3201, Level 16, State 1")) {
        return reject(new Error("Access is denied"));
      }
      console.log("✅ Database backup completed:", stdout);
      resolve({
        backupDir: backupDir,
        backupFileDir: backupFileDir,
        backupFile: backupFile,
        message: stdout,
      }); // ✅ Return the backup file name
    });
  });
};
