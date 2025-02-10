import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../ThemeProvider";

import { Button } from "../Button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../Dropdown";

export function ThemeButton() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="cursor-pointer">
          <Sun
            className={`h-[1.2rem] w-[1.2rem] transition-all ${
              theme === "dark" ? "rotate-90 scale-0" : "rotate-0 scale-100"
            }`}
          />
          <Moon
            className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${
              theme === "dark" ? "rotate-0 scale-100" : "rotate-90 scale-0"
            }`}
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            setTheme("light");
          }}
        >
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            setTheme("dark");
          }}
        >
          Dark
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
