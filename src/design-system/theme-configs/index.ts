import { ThemeConfig } from "./types";
import { coreThemes } from "./core";
import { faithfulThemes } from "./faithful";
import { industryThemes } from "./industry";
import { premiumThemes } from "./premium";
import { limitedThemes } from "./limited";
import { accessibilityThemes } from "./accessibility";

export { ThemeConfig } from "./types";
export {
  coreThemes,
  faithfulThemes,
  industryThemes,
  premiumThemes,
  limitedThemes,
  accessibilityThemes,
};

export const allThemeConfigs: ThemeConfig[] = [
  ...coreThemes,
  ...faithfulThemes,
  ...industryThemes,
  ...premiumThemes,
  ...limitedThemes,
  ...accessibilityThemes,
];
