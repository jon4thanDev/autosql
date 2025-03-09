import React, { useState } from "react";
import styles from "./styles.module.css";
import { ROUTES } from "../../lib/constants";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Label } from "../../components/ui/Label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/Select";
import { useToast } from "../../hooks/use-toast";
import { Link } from "react-router-dom";
import { fetchAPI } from "../../features/scheduler/utils/apiRequest";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/Tabs";

const daysOfWeek = [
  { label: "S", id: "sunday" },
  { label: "M", id: "monday" },
  { label: "T", id: "tuesday" },
  { label: "W", id: "wednesday" },
  { label: "T", id: "thursday" },
  { label: "F", id: "friday" },
  { label: "S", id: "saturday" },
];

export default function Scheduler() {
  const [path, setPath] = useState<string>("");
  const [dbInput, setDbInput] = useState<string>("");
  const [server, setServer] = useState<string>("");
  const [user, setUser] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [backupPassword, setBackupPassword] = useState<string>("");
  const [schedule, setSchedule] = useState<string>("daily");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!path) {
      setError("Path is required.");
      return;
    }
    setError("");

    const scheduleText =
      schedule === "custom"
        ? `Custom schedule: ${selectedDays
            .map((id) => daysOfWeek.find((d) => d.id === id)?.label)
            .join(", ")}`
        : `${schedule.charAt(0).toUpperCase() + schedule.slice(1)} schedule`;

    const localIP = await window.electronAPI.getLocalIP();
    const backendDomain =
      process.env.NODE_ENV === "development"
        ? "http://localhost:5000"
        : `http://${localIP}:5000`;

    toast({
      description: "Looking for the specified directory...",
      itemID: "schedule",
      duration: 6000,
    });
    await fetchAPI("/api/v1/scheduler/directory", "POST", { directory: path });

    toast({
      description: "Saving backup database...",
      itemID: "schedule",
      duration: Infinity,
    });

    const backup = await fetchAPI<{
      backupFileDir: string;
      backupDir: string;
      backupFile: string;
      message: string;
      origDatabaseSize: number;
    }>(`/api/v1/scheduler/backup`, "POST", {
      server: server,
      user: user,
      password: password,
      database: dbInput,
      backupDir: path,
    })
      .then((res) => {
        toast({
          description: res.message,
          itemID: "schedule",
          duration: 3000,
        });
        return res;
      })
      .catch((error) => {
        const errorMessage = error.message || "An error occurred.";
        toast({
          description: errorMessage,
          itemID: "schedule",
          duration: 5000,
          variant: "destructive",
        });
      });

    if (!backup) {
      return;
    }

    toast({
      description: "Compressing backup database...",
      itemID: "schedule",
      duration: Infinity,
    });

    const compressedDb = await fetchAPI<{
      message: string;
      completedAt: string;
      driveSpace: string;
      compressedSize: string;
      originalSize: string;
      backupFileDir: string;
    }>("/api/v1/scheduler/compress", "POST", {
      backupFileDir: backup.backupFileDir,
      dbDir: backup.backupDir,
      zipPassword: backupPassword,
      originalDBSize: backup.origDatabaseSize,
    })
      .then((res) => {
        toast({
          description: "Compressed completed successfully.",
          itemID: "schedule",
          duration: 5000,
          variant: "destructive",
        });
        return res;
      })
      .catch((error) => {
        const errorMessage =
          error.message || "Something went wrong, an error occurred.";
        toast({
          description: errorMessage,
          itemID: "schedule",
          duration: 5000,
          variant: "destructive",
        });
        throw error;
      });

    if (!compressedDb) {
      return;
    }

    toast({
      description: "Sending email notification, please wait...",
      itemID: "schedule",
      duration: Infinity,
    });

    await fetchAPI("/api/v1/scheduler/email", "POST", {
      backupFile: backup.backupFile,
      completedAt: compressedDb.completedAt,
      originalDBSize: compressedDb.originalSize,
      compressedSize: compressedDb.compressedSize,
      remainingStorage: compressedDb.driveSpace,
    })
      .then(() => {
        toast({
          description: "Email notification sent successfully.",
          itemID: "schedule",
          duration: 5000,
        });
        return;
      })
      .catch((error) => {
        const errorMessage =
          error.message || "Something went wrong, an error occurred.";
        toast({
          description: errorMessage,
          itemID: "schedule",
          duration: 5000,
          variant: "destructive",
        });
        throw error;
      });
  };

  const handleScheduleChange = (value: string) => {
    setSchedule(value);
    if (value !== "custom") {
      setSelectedDays([]); // Reset selected days if changing schedule type
    }
  };

  const toggleDay = (id: string) => {
    setSelectedDays((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const renderScheduleButtons = () => {
    return daysOfWeek.map(({ label, id }) => (
      <Button
        key={id}
        variant={selectedDays.includes(id) ? "default" : "outline"}
        className={`rounded-full px-3 text-xs ${
          selectedDays.includes(id) && `${styles.selectedDay}`
        } ${styles.day}`}
        type="button"
        onClick={() => toggleDay(id)}
      >
        {label}
      </Button>
    ));
  };

  /**
   * Delete plan starts here.
   */
  const handleOnDeletePlanClick = async () => {
    toast({
      description: "Deleting backup database...",
      duration: Infinity,
      itemID: "deleteSchedule",
    });

    await fetchAPI("/api/v1/scheduler/delete", "DELETE")
      .then((res) => {
        toast({
          description: "Backup database deleted successfully.",
          duration: 5000,
          itemID: "deleteSchedule",
        });
        return res;
      })
      .catch((err) => {
        const errorMessage = err.message || "An error occurred.";
        toast({
          description: errorMessage,
          duration: 5000,
          itemID: "deleteSchedule",
          variant: "destructive",
        });
        throw err;
      });
  };

  return (
    <div className={styles.container}>
      <Tabs defaultValue="backup">
        <TabsList className={styles.tabs}>
          <TabsTrigger value="backup" className={styles.tab}>
            Backup
          </TabsTrigger>
          <TabsTrigger value="delete" className={styles.tab}>
            Delete
          </TabsTrigger>
        </TabsList>
        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle className="font-bold text-2xl">Backup Plan</CardTitle>
              <CardDescription>
                Ensure data safety with scheduled backups and efficient <br />
                compression strategies.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className={styles.form}>
                <div className={styles.inputGroup}>
                  <Label htmlFor="path">Backup Drive path</Label>
                  <Input
                    id="path"
                    type="text"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    placeholder="Enter backup save path"
                  />
                  {error && <p className={styles.error}>{error}</p>}
                </div>

                <div className={styles.inputGroup}>
                  <Label htmlFor="path">Database name</Label>
                  <Input
                    id="database"
                    type="text"
                    value={dbInput}
                    onChange={(e) => setDbInput(e.target.value)}
                    placeholder="Enter database name"
                  />
                  {error && <p className={styles.error}>{error}</p>}
                </div>

                <div className={styles.inputGroup}>
                  <Label htmlFor="path">Server name</Label>
                  <Input
                    id="server"
                    type="text"
                    value={server}
                    onChange={(e) => setServer(e.target.value)}
                    placeholder="Enter server name"
                  />
                  {error && <p className={styles.error}>{error}</p>}
                </div>

                <div className={styles.inputGroup}>
                  <Label htmlFor="path">User</Label>
                  <Input
                    id="user"
                    type="text"
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                    placeholder="Enter username"
                  />
                  {error && <p className={styles.error}>{error}</p>}
                </div>

                <div className={styles.inputGroup}>
                  <Label htmlFor="path">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                  />
                  {error && <p className={styles.error}>{error}</p>}
                </div>

                <div className={styles.inputGroup}>
                  <Label htmlFor="path">Backup password</Label>
                  <Input
                    id="backup_password"
                    type="text"
                    value={backupPassword}
                    onChange={(e) => setBackupPassword(e.target.value)}
                    placeholder="Enter backup password"
                  />
                  {error && <p className={styles.error}>{error}</p>}
                </div>

                <div className={styles.inputGroup}>
                  <Label htmlFor="schedule">Backup Schedule:</Label>
                  <Select onValueChange={handleScheduleChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time interval" />
                    </SelectTrigger>
                    <SelectContent className={styles.selectContainer}>
                      <SelectGroup>
                        <SelectItem value="daily" className={styles.option}>
                          Daily
                        </SelectItem>
                        <SelectItem value="weekly" className={styles.option}>
                          Weekly
                        </SelectItem>
                        <SelectItem value="monthly" className={styles.option}>
                          Monthly
                        </SelectItem>
                        <SelectItem value="yearly" className={styles.option}>
                          Yearly
                        </SelectItem>
                        <SelectItem value="custom" className={styles.option}>
                          Custom
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <Card
                    style={{
                      height: schedule === "custom" ? "auto" : "0px",
                      overflow: "hidden",
                      transition: "height 0.3s ease-in-out",
                      border:
                        schedule === "custom"
                          ? "1px var(--card-border-color) solid"
                          : "none",
                      boxShadow: schedule === "custom" ? "shadow-sm" : "none",
                    }}
                  >
                    <CardContent className="p-2 grid gap-x-2 grid-cols-7">
                      {renderScheduleButtons()}
                    </CardContent>
                  </Card>
                </div>
              </form>
            </CardContent>
            <CardFooter className={styles.footer}>
              <Button
                type="button"
                variant="destructive"
                className={styles.cancelLink}
              >
                <Link to={ROUTES.ROOT}>Cancel</Link>
              </Button>
              <Button
                type="button"
                variant="default"
                className={styles.scheduleButton}
                onClick={handleSubmit}
              >
                Save Schedule
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="delete">
          <Card>
            <CardHeader>
              <CardTitle className="font-bold text-2xl">
                Delete Backup Plan
              </CardTitle>
              <CardDescription>
                Safely clean up old backups while preserving essential data.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={styles.footer}>
                <Button
                  type="button"
                  variant="default"
                  className={styles.deleteButton}
                  onClick={handleOnDeletePlanClick}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
