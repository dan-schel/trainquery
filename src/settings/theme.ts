const lsKey = "trainquery-theme";

type Theme = "auto" | "light" | "dark";

let theme: Theme | null = null;

export function getTheme(): Theme {
  if (theme != null) {
    return theme;
  }

  const retrieveTheme = () => {
    const value = localStorage.getItem(lsKey);
    if (value == "light") { return "light"; }
    if (value == "dark") { return "dark"; }
    return "auto";
  };

  theme = retrieveTheme();
  return theme;
}

export function setTheme(theme: Theme) {
  document.documentElement.classList.toggle("light", theme == "light");
  document.documentElement.classList.toggle("dark", theme == "dark");
  if (theme == "auto") {
    localStorage.removeItem(lsKey);
  }
  else {
    localStorage.setItem(lsKey, theme);
  }
}
