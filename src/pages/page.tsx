import React, { useEffect, useState } from "react";

declare global {
  interface Window {
    electronAPI: {
      getDiskSpace: (drive: string) => Promise<number>;
    };
  }
}
import styles from "./styles.module.css";
import { Card, CardDescription, CardTitle } from "../components/ui/Card";
import { Button, CardBody, CardHeader, Container } from "react-bootstrap";
import { DataTable } from "../components/ui/Table/DataTable";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/Dropdown";
import {
  ArrowUpDown,
  CircleHelp,
  Cylinder,
  MoreHorizontal,
  Percent,
} from "lucide-react";

const data = [
  {
    date: "Jan. 20, 2025",
    rawSize: "500mb",
    compSize: "20mb",
    savedIn: "Drive",
  },
  {
    date: "Jan. 21, 2025",
    rawSize: "700mb",
    compSize: "30mb",
    savedIn: "Drive",
  },
  {
    date: "Jan. 22, 2025",
    rawSize: "600mb",
    compSize: "25mb",
    savedIn: "Drive",
  },
  {
    date: "Jan. 23, 2025",
    rawSize: "450mb",
    compSize: "18mb",
    savedIn: "Cloud",
  },
  {
    date: "Jan. 24, 2025",
    rawSize: "800mb",
    compSize: "40mb",
    savedIn: "Cloud",
  },
  {
    date: "Jan. 25, 2025",
    rawSize: "550mb",
    compSize: "22mb",
    savedIn: "Drive",
  },
  {
    date: "Jan. 26, 2025",
    rawSize: "650mb",
    compSize: "28mb",
    savedIn: "Cloud",
  },
  {
    date: "Jan. 27, 2025",
    rawSize: "720mb",
    compSize: "35mb",
    savedIn: "Drive",
  },
  {
    date: "Jan. 28, 2025",
    rawSize: "500mb",
    compSize: "20mb",
    savedIn: "Cloud",
  },
  {
    date: "Jan. 29, 2025",
    rawSize: "750mb",
    compSize: "30mb",
    savedIn: "Drive",
  },
  {
    date: "Jan. 30, 2025",
    rawSize: "600mb",
    compSize: "25mb",
    savedIn: "Cloud",
  },
  {
    date: "Jan. 31, 2025",
    rawSize: "850mb",
    compSize: "42mb",
    savedIn: "Cloud",
  },
  {
    date: "Feb. 1, 2025",
    rawSize: "920mb",
    compSize: "45mb",
    savedIn: "Drive",
  },
  {
    date: "Feb. 2, 2025",
    rawSize: "630mb",
    compSize: "27mb",
    savedIn: "Cloud",
  },
  {
    date: "Feb. 3, 2025",
    rawSize: "800mb",
    compSize: "38mb",
    savedIn: "Cloud",
  },
  {
    date: "Feb. 4, 2025",
    rawSize: "500mb",
    compSize: "21mb",
    savedIn: "Drive",
  },
  {
    date: "Feb. 5, 2025",
    rawSize: "730mb",
    compSize: "33mb",
    savedIn: "Cloud",
  },
  {
    date: "Feb. 6, 2025",
    rawSize: "590mb",
    compSize: "26mb",
    savedIn: "Drive",
  },
  {
    date: "Feb. 7, 2025",
    rawSize: "670mb",
    compSize: "29mb",
    savedIn: "Cloud",
  },
  {
    date: "Feb. 8, 2025",
    rawSize: "820mb",
    compSize: "40mb",
    savedIn: "Drive",
  },
];

const columns = [
  {
    accessorKey: "date",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className={`flex items-center cursor-pointer ${styles.headerBtn}`}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "rawSize",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className={`flex items-center cursor-pointer ${styles.headerBtn}`}
        >
          Raw
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "compSize",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className={`flex items-center cursor-pointer ${styles.headerBtn}`}
        >
          Compressed
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "savedIn",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className={`flex items-center cursor-pointer ${styles.headerBtn}`}
        >
          Saved in
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const payment = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="flex justify-center items-center h-8 w-full p-0 cursor-pointer"
            >
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* <DropdownMenuLabel>Actions</DropdownMenuLabel> */}
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(payment.id)}
              className={`cursor-pointer ${styles.viewDriveBtn}`}
            >
              View Drive
            </DropdownMenuItem>
            {/* <DropdownMenuSeparator />
            <DropdownMenuItem>View customer</DropdownMenuItem>
            <DropdownMenuItem>View payment details</DropdownMenuItem> */}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

export default function Home() {
  const [driveSpace, setDriveSpace] = useState<number | null | undefined>();

  useEffect(() => {
    const getDriveSpace = async () => {
      try {
        const freeSpacePercentage = await window.electronAPI.getDiskSpace("D:");
        setDriveSpace(100 - freeSpacePercentage);
      } catch (error) {
        console.error("Error getting drive space:", error);
        setDriveSpace(null);
      }
    };

    getDriveSpace();
  }, []);

  return (
    <div className={styles.container}>
      <Container>
        <h1 className={styles.title}>Dashboard</h1>
        <Card className="w-fit p-3 mb-2 shadow-none">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-base font-bold">
                Drive Available Space
              </CardTitle>
              <span>
                <Cylinder size={17} />
              </span>
            </div>
            <CardDescription>
              Keep track of your current drive space.
            </CardDescription>
          </CardHeader>
          <CardBody className="mt-2">
            {typeof driveSpace === "number" ? (
              <div className="text-3xl font-bold flex items-center">
                {driveSpace} <Percent size={25} className="ms-2" />
              </div>
            ) : (
              <div className="text-md font-bold flex items-center">
                {driveSpace === null
                  ? "No disk found."
                  : driveSpace === undefined
                  ? "Loading..."
                  : ""}
                <CircleHelp size={18} className="ms-2" />
              </div>
            )}
          </CardBody>
        </Card>
        <DataTable columns={columns} data={data} label="Logs" />
      </Container>
    </div>
  );
}
