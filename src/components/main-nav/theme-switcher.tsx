import { Moon, Sun } from "lucide-solid";
import { type Component, Show } from "solid-js";
import { createCookieFromClient } from "~/lib/client-cookies";
import { COOKIE_NAME_THEME } from "~/lib/cookie-names";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { themeStore } from "~/stores/theme-store";

export type Theme = "light" | "dark";

export function getThemeColorByTheme(theme: "light" | "dark") {
  return theme === "light" ? "#ffffff" : "#030712";
}

function toggleTheme() {
  const theme = themeStore.currentTheme() === "light" ? "dark" : "light";
  themeStore.setCurrentTheme(theme);
  createCookieFromClient(COOKIE_NAME_THEME, theme, 365 * 5);

  if (theme === "dark") {
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark");
  }

  document
    .querySelector('meta[name="theme-color"]')
    ?.setAttribute("content", getThemeColorByTheme(theme));
}

export const ThemeSwitcher: Component = () => {
  const theme = themeStore.currentTheme;

  return (
    <Tooltip>
      <TooltipTrigger
        as={Button<"button">}
        variant="ghost"
        onClick={toggleTheme}
      >
        <Show when={theme() === "light"} fallback={<Moon class="h-5 w-5" />}>
          <Sun class="h-5 w-5" />
        </Show>
      </TooltipTrigger>
      <TooltipContent>
        {theme() === "light" ? "Switch to dark mode" : "Switch to light mode"}
      </TooltipContent>
    </Tooltip>
  );
};
