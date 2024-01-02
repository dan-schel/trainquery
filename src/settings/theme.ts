const lsKey = "trainquery-theme";

export type Theme = "auto" | "light" | "dark";

let theme: Theme | null = null;

export function getTheme(): Theme {
  if (theme != null) {
    return theme;
  }

  const retrieveTheme = () => {
    const value = localStorage.getItem(lsKey);
    if (value === "light") {
      return "light";
    }
    if (value === "dark") {
      return "dark";
    }
    return "auto";
  };

  theme = retrieveTheme();
  return theme;
}

export function setTheme(newTheme: Theme) {
  theme = newTheme;
  document.documentElement.classList.toggle("light", newTheme === "light");
  document.documentElement.classList.toggle("dark", newTheme === "dark");
  if (newTheme === "auto") {
    localStorage.removeItem(lsKey);
  } else {
    localStorage.setItem(lsKey, newTheme);
  }
}
