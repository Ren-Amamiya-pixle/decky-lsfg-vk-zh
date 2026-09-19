import { ButtonItem, ConfirmModal, Field, PanelSectionRow, showModal } from "@decky/ui";
import { useEffect, useRef } from "react";
import type { GameTarget, KnownGameSource } from "../utils/gameTargets";
import { sourceLabel } from "../utils/gameTargets";
import { CollapsibleItemGroup, collapsibleItemGroupStyles, usePersistentCollapsed } from "./CollapsibleItemGroup";

interface Props {
  targets: GameTarget[];
  runningGame: GameTarget | null;
  source: KnownGameSource;
  bulkOperationBusy: boolean;
  onSelect: (appid: string) => void;
  onEnableAll: (source: KnownGameSource) => Promise<void>;
  onResetAll: (source: KnownGameSource) => Promise<void>;
  focusConfiguredToggle?: boolean;
  onConfiguredToggleFocused?: () => void;
}

const ENABLED_COLLAPSED_KEY = "lsfg-enabled-games-collapsed-v4";
const AVAILABLE_COLLAPSED_KEY = "lsfg-available-games-collapsed-v3";

function targetDescription(game: GameTarget): string {
  if (game.isFlatpakShortcut) return "非 Steam｜请在 Flatpak 标签页管理";
  return game.source === "unknown"
    ? "来源未知 · 不参与批量操作"
    : sourceLabel(game.source);
}

export function GameConfigurationSelector({
  targets,
  runningGame,
  source,
  bulkOperationBusy,
  onSelect,
  onEnableAll,
  onResetAll,
  focusConfiguredToggle = false,
  onConfiguredToggleFocused,
}: Props) {
  const sortGames = (games: GameTarget[]) => [...games].sort((a, b) => {
    if (a.appid === runningGame?.appid) return -1;
    if (b.appid === runningGame?.appid) return 1;
    return a.name.localeCompare(b.name);
  });
  const enabledGames = sortGames(targets.filter((game) => game.configured));
  const availableGames = sortGames(targets.filter((game) => !game.configured));
  const enableableGames = availableGames.filter((game) => game.source === source && !game.isFlatpakShortcut);
  const removableGames = enabledGames.filter((game) => game.source === source && !game.isFlatpakShortcut);
  const sourceName = source === "nonSteam" ? "非 Steam 快捷方式" : "Steam 游戏";
  const emptyDescription = source === "nonSteam"
    ? "Steam 尚未报告可用的非 Steam 快捷方式"
    : "Steam 尚未报告可用的已安装游戏";
  const toItem = (game: GameTarget) => ({
    id: game.appid,
    label: game.name,
    description: targetDescription(game),
    disabled: game.isFlatpakShortcut,
  });
  const [enabledCollapsed, toggleEnabled] = usePersistentCollapsed(`${ENABLED_COLLAPSED_KEY}-${source}`);
  const [availableCollapsed, toggleAvailable] = usePersistentCollapsed(`${AVAILABLE_COLLAPSED_KEY}-${source}`);
  const enabledToggleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!focusConfiguredToggle) return;
    const frame = requestAnimationFrame(() => {
      enabledToggleRef.current?.querySelector<HTMLElement>('[role="button"], button')?.focus();
      onConfiguredToggleFocused?.();
    });
    return () => cancelAnimationFrame(frame);
  }, [enabledGames.length, focusConfiguredToggle, onConfiguredToggleFocused]);

  const confirmResetAll = () => {
    showModal(
      <ConfirmModal
        strTitle={`移除全部${sourceName}配置？`}
        strOKButtonText="全部移除"
        strCancelButtonText="取消"
        onOK={() => void onResetAll(source)}
        onCancel={() => {}}
      />,
    );
  };

  const confirmEnableAll = () => {
    showModal(
      <ConfirmModal
        strTitle={`启用全部可用${sourceName}？`}
        strDescription={`为每个可用${sourceName}创建独立的小黄鸭配置；来源未知的配置不会包含在内，Flatpak 配置请在 Flatpak 标签页单独管理。`}
        strOKButtonText="全部启用"
        strCancelButtonText="取消"
        onOK={() => void onEnableAll(source)}
        onCancel={() => {}}
      />,
    );
  };

  return (
    <>
      <style>
        {collapsibleItemGroupStyles}
      </style>
      {targets.length === 0 && (
        <PanelSectionRow>
          <Field label={`未找到${sourceName}`} description={emptyDescription} />
        </PanelSectionRow>
      )}
      <CollapsibleItemGroup
        title="已启用"
        items={enabledGames.map(toItem)}
        collapsed={enabledCollapsed}
        onToggle={toggleEnabled}
        onSelect={onSelect}
        toggleRef={enabledToggleRef}
      />
      <CollapsibleItemGroup
        title="可用"
        items={availableGames.map(toItem)}
        collapsed={availableCollapsed}
        onToggle={toggleAvailable}
        onSelect={onSelect}
      />
      {enableableGames.length > 0 && (
        <PanelSectionRow>
          <ButtonItem layout="below" onClick={confirmEnableAll} disabled={bulkOperationBusy}>
            {`启用全部${sourceName}`}
          </ButtonItem>
        </PanelSectionRow>
      )}
      <PanelSectionRow>
        <ButtonItem
          layout="below"
          onClick={confirmResetAll}
          disabled={bulkOperationBusy || removableGames.length === 0}
        >
          {`移除全部${sourceLabel(source)}配置`}
        </ButtonItem>
      </PanelSectionRow>
    </>
  );
}
