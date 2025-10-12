import React, { useEffect, useState } from "react";
import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  // Derive theme from document's `dark` class and react to updates
  const [isDark, setIsDark] = useState(
    typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );

  useEffect(() => {
    const update = () => setIsDark(document.documentElement.classList.contains("dark"));
    const onThemeUpdated = () => update();
    const onStorage = (e: StorageEvent) => {
      if (e.key === "aos_settings") update();
    };
    window.addEventListener("theme-updated", onThemeUpdated as any);
    window.addEventListener("aos_settings_updated", onThemeUpdated as any);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("theme-updated", onThemeUpdated as any);
      window.removeEventListener("aos_settings_updated", onThemeUpdated as any);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  const theme = isDark ? "dark" : "light";

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
