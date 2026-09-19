import { ButtonItem, ConfirmModal, DialogButton, Field, Focusable, PanelSection, PanelSectionRow, gamepadDialogClasses, showModal } from "@decky/ui";
import { useCallback, useMemo, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import type { FlatpakApp, LsfgConfig, WorkaroundState } from "../api/lsfgApi";
import { zhError } from "../i18n/i18n";
import { CollapsibleItemGroup, collapsibleItemGroupStyles, usePersistentCollapsed } from "./CollapsibleItemGroup";
import { ConfigurationSection } from "./ConfigurationSection";
import { FlatpakWorkaroundsSection } from "./FlatpakWorkaroundsSection";
import { FpsMultiplierControl } from "./FpsMultiplierControl";
import { ProfileDetails } from "./ProfileDetails";

interface Props {
  apps: FlatpakApp[];
  runningApp: FlatpakApp | null;
  loading: boolean;
  busyAppId: string;
  onRefresh: () => Promise<void>;
  onEnable: (appId: string) => Promise<boolean>;
  onEnableAll: () => Promise<void>;
  onRemove: (appId: string) => Promise<boolean>;
  onRemoveAll: () => Promise<void>;
  onConfigChange: (appId: string, config: LsfgConfig) => Promise<boolean>;
  onWorkaroundChange: (appId: string, state: WorkaroundState) => Promise<boolean>;
}

const ENABLED_COLLAPSED_KEY = "lsfg-flatpak-enabled-collapsed-v2";
const AVAILABLE_COLLAPSED_KEY = "lsfg-flatpak-available-collapsed-v2";

export function FlatpakTab({
  apps,
  runningApp,
  loading,
  busyAppId,
  onRefresh,
  onEnable,
  onEnableAll,
  onRemove,
  onRemoveAll,
  onConfigChange,
  onWorkaroundChange,
}: Props) {
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const selected = useMemo(
    () => selectedAppId ? apps.find((app) => app.app_id === selectedAppId) || null : null,
    [apps, selectedAppId],
  );
  const close = useCallback(() => setSelectedAppId(null), []);
  const [enabledCollapsed, toggleEnabled] = usePersistentCollapsed(ENABLED_COLLAPSED_KEY);
  const [availableCollapsed, toggleAvailable] = usePersistentCollapsed(AVAILABLE_COLLAPSED_KEY);

  const enabledApps = useMemo(
    () => apps.filter((app) => app.enabled).sort((a, b) => a.app_name.localeCompare(b.app_name)),
    [apps],
  );
  const availableApps = useMemo(
    () => apps.filter((app) => !app.enabled).sort((a, b) => a.app_name.localeCompare(b.app_name)),
    [apps],
  );
  const enableableApps = useMemo(
    () => availableApps.filter((app) => !(app.prepared && !app.owned) && !app.error),
    [availableApps],
  );
  const confirmEnableAll = () => {
    showModal(
      <ConfirmModal
        strTitle="启用全部可用 Flatpak 应用？"
        strDescription="为本插件可管理的每个 Flatpak 应用创建独立的小黄鸭配置；由外部方式准备或不可用的应用将跳过。"
        strOKButtonText="全部启用"
        strCancelButtonText="取消"
        onOK={() => void onEnableAll()}
        onCancel={() => {}}
      />,
    );
  };
  const confirmRemoveAll = () => {
    showModal(
      <ConfirmModal
        strTitle="移除全部 Flatpak 配置？"
        strOKButtonText="全部移除"
        strCancelButtonText="取消"
        onOK={() => void onRemoveAll()}
        onCancel={() => {}}
      />,
    );
  };
  const itemFor = (app: FlatpakApp) => ({
    id: app.app_id,
    label: app.app_name,
    description: `${app.app_id} · ${app.prepared && !app.owned ? "由外部方式准备" : "可用"}`,
  });

  if (!selectedAppId) {
    return (
      <PanelSection title="Flatpak">
        <style>{collapsibleItemGroupStyles}</style>
        <CollapsibleItemGroup
          title="已启用"
          items={enabledApps.map((app) => ({
            id: app.app_id,
            label: app.app_name,
            description: `${app.app_id}${app.app_id === runningApp?.app_id ? " · 正在运行" : ""}`,
          }))}
          collapsed={enabledCollapsed}
          onToggle={toggleEnabled}
          onSelect={setSelectedAppId}
        />
        <CollapsibleItemGroup
          title="可用"
          items={availableApps.map(itemFor)}
          collapsed={availableCollapsed}
          onToggle={toggleAvailable}
          onSelect={setSelectedAppId}
        />
        {enableableApps.length > 0 && (
          <PanelSectionRow>
            <ButtonItem
              layout="below"
              disabled={loading || Boolean(busyAppId)}
              onClick={confirmEnableAll}
            >
              启用全部可用 Flatpak 应用
            </ButtonItem>
          </PanelSectionRow>
        )}
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            disabled={loading || Boolean(busyAppId) || enabledApps.length === 0}
            onClick={confirmRemoveAll}
          >
            移除全部配置
          </ButtonItem>
        </PanelSectionRow>
        {apps.length === 0 && !loading && (
          <PanelSectionRow>
            <Field label="未找到 Flatpak 应用" />
          </PanelSectionRow>
        )}
        <PanelSectionRow>
          <ButtonItem layout="below" disabled={loading || Boolean(busyAppId)} onClick={() => void onRefresh()}>
            {loading ? "正在刷新…" : "刷新 Flatpak 应用"}
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
    );
  }

  if (!selected) {
    return (
      <PanelSection title="Flatpak">
        <PanelSectionRow>
          <ButtonItem layout="below" onClick={close}>返回</ButtonItem>
        </PanelSectionRow>
        <PanelSectionRow>
          <Field label="此 Flatpak 应用已不再安装" />
        </PanelSectionRow>
      </PanelSection>
    );
  }

  const busy = busyAppId === selected.app_id;
  const config = selected.config;
  const external = selected.prepared && !selected.owned;
  const profileDescription = [
    selected.app_id,
    selected.runtime_branch ? `运行时 ${selected.runtime_branch}` : null,
    selected.enabled ? `配置 ${selected.profile}` : null,
    selected.app_id === runningApp?.app_id ? "正在运行" : null,
  ].filter(Boolean).join(" · ");

  const changeConfig = async (
    field: keyof LsfgConfig,
    value: boolean | number | string | string[],
  ) => {
    if (!config) return;
    await onConfigChange(selected.app_id, { ...config, [field]: value });
  };

  return (
    <Focusable onCancelButton={close}>
      <PanelSection>
        <PanelSectionRow>
          <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
            <Focusable noFocusRing style={{ flex: "none" }}>
              <DialogButton
                aria-label="返回 Flatpak 应用"
                onClick={close}
                style={{
                  width: "48px",
                  minWidth: "48px",
                  height: "24px",
                  minHeight: "24px",
                  padding: 0,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <FaArrowLeft />
              </DialogButton>
            </Focusable>
            <div
              className={gamepadDialogClasses.FieldLabel}
              style={{ flex: 1, minWidth: 0, marginLeft: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {selected.app_name}
            </div>
          </div>
        </PanelSectionRow>
      </PanelSection>
      {!selected.enabled && (
        <PanelSection>
          <PanelSectionRow>
            <ButtonItem
              layout="below"
              disabled={busy || external || Boolean(selected.error)}
              onClick={() => void onEnable(selected.app_id)}
            >
              {busy ? "正在启用…" : external ? "由外部方式准备" : "启用小黄鸭"}
            </ButtonItem>
          </PanelSectionRow>
          {selected.error && (
            <PanelSectionRow>
              <Field label="不可用" description={zhError(selected.error)} />
            </PanelSectionRow>
          )}
        </PanelSection>
      )}
      {selected.enabled && config && (
        <>
          <FpsMultiplierControl config={config} onConfigChange={changeConfig} />
          <ConfigurationSection config={config} onConfigChange={changeConfig} />
          <FlatpakWorkaroundsSection
            state={selected.workarounds}
            disabled={busy}
            onChange={(state) => onWorkaroundChange(selected.app_id, state)}
          />
          <PanelSectionRow>
            <ButtonItem layout="below" disabled={busy} onClick={() => void onRemove(selected.app_id)}>
              {busy ? "正在移除…" : "移除 Flatpak 配置"}
            </ButtonItem>
          </PanelSectionRow>
        </>
      )}
      <ProfileDetails description={profileDescription} />
    </Focusable>
  );
}
