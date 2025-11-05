import { ThemeCategory, ThemeDefinition, ThemeId } from "../types";

export interface ThemeConfig {
  id: ThemeId;
  name: string;
  shortName?: string;
  description: string;
  category: ThemeCategory;
  mode: "dark" | "light";
  css: Record<string, string>;
  premium?: boolean;
  wallpaper?: string;
  accentGradient?: string;
  badges?: string[];
  tags?: string[];
  accessibility?: ThemeDefinition["accessibility"];
  hud?: ThemeDefinition["hud"];
}
