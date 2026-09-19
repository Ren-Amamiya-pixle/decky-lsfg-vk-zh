import { Focusable } from "@decky/ui";
import type { FlatpakApp, LsfgConfig } from "../api/lsfgApi";
import type { GameTarget } from "../utils/gameTargets";
import { ConfigurationSection } from "./ConfigurationSection";
import { FpsMultiplierControl } from "./FpsMultiplierControl";
import { NowPlayingSummary } from "./NowPlayingSummary";

interface Props {
  app: FlatpakApp;
  launcher: GameTarget | null;
  onConfigChange: (appId: string, config: LsfgConfig) => Promise<boolean>;
}

export function FlatpakNowPlayingTab({ app, launcher, onConfigChange }: Props) {
  if (!app.config) return null;
  const changeConfig = async (
    field: keyof LsfgConfig,
    value: boolean | number | string | string[],
  ) => {
    await onConfigChange(app.app_id, { ...app.config!, [field]: value });
  };

  return (
    <Focusable>
      <NowPlayingSummary
        title={launcher?.name || app.app_name}
        details={[
          launcher ? (launcher.source === "nonSteam" ? "Steam 快捷方式" : "Steam") : "Flatpak",
          launcher && launcher.name !== app.app_name ? `正在 ${app.app_name} 中运行` : null,
          launcher ? "Flatpak" : null,
          `控制：${app.app_name} 配置`,
        ].filter((detail): detail is string => detail !== null)}
      />
      <FpsMultiplierControl config={app.config} onConfigChange={changeConfig} />
      <ConfigurationSection config={app.config} onConfigChange={changeConfig} />
    </Focusable>
  );
}
