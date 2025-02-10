import React, { useState } from "react";
import styles from "./styles.module.css";
import { ROUTES } from "../../lib/constants";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import {
  Card,
  CardContent,
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

const daysOfWeek = [
  { label: "S", id: "s1" },
  { label: "M", id: "m" },
  { label: "T", id: "t1" },
  { label: "W", id: "w" },
  { label: "T", id: "t2" },
  { label: "F", id: "f" },
  { label: "S", id: "s2" },
];

export default function Scheduler() {
  const [path, setPath] = useState<string>("");
  const [schedule, setSchedule] = useState<string>("daily");
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [error, setError] = useState<string>("");

  const { toast } = useToast();

  const handleSubmit = () => {
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

    toast({
      description: `Backup path: ${path}, Schedule: ${scheduleText}`,
      duration: 3000,
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

  return (
    <div className={styles.container}>
      <Card>
        <CardHeader>
          <CardTitle className="font-bold text-2xl">
            Drive Data Sync Plan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form className={styles.form}>
            <div className={styles.inputGroup}>
              <Label htmlFor="path">Drive path</Label>
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
    </div>
  );
}
