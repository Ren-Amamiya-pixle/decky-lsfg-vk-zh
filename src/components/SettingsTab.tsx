import { ButtonItem, DialogButton, Field, PanelSection, PanelSectionRow, ToggleField } from "@decky/ui";
import { type GlobalConfig, type SteamBranchStatus } from "../api/lsfgApi";
import t, { zh, zhError } from "../i18n/i18n";
import { showBranchSetupModal } from "./BranchSetupModal";

interface SettingsTabProps {
  isInstalled: boolean;
  setupComplete: boolean;
  installationStatus: string;
  losslessScalingInstalled: boolean;
  losslessScalingStatus: string;
  steamBranchStatus: SteamBranchStatus | null;
  isInstalling: boolean;
  isUninstalling: boolean;
  globalConfig: GlobalConfig;
  showDebugTab: boolean;
  onGlobalConfigChange: (config: GlobalConfig) => Promise<boolean>;
  onShowDebugTabChange: (value: boolean) => void;
  onInstall: () => void;
  onUninstall: () => void;
}

export function SettingsTab(props: SettingsTabProps) {
  const {
    isInstalled,
    setupComplete,
    installationStatus,
    losslessScalingInstalled,
    losslessScalingStatus,
    steamBranchStatus,
    isInstalling,
    isUninstalling,
    globalConfig,
    showDebugTab,
    onGlobalConfigChange,
    onShowDebugTabChange,
    onInstall,
    onUninstall,
  } = props;
  const setupIncomplete = isInstalled && !setupComplete;
  const branchSetupIncomplete = Boolean(
    setupIncomplete && steamBranchStatus?.installed && steamBranchStatus.needs_switch,
  );
  const selectedBranch = steamBranchStatus?.selected_branch || "当前";
  const targetBranch = steamBranchStatus?.target_branch || "lsfg-vk";
  const buttonLabel = isInstalling
    ? t("INSTALL_INSTALLING", "Installing...")
    : isUninstalling
      ? t("INSTALL_UNINSTALLING", "Uninstalling...")
      : isInstalled
        ? t("INSTALL_UNINSTALL_BTN", "Uninstall LSFG-VK")
        : t("INSTALL_INSTALL_BTN", "Install LSFG-VK");

  return (
    <>
      <PanelSection title={zh("Settings")}>
        {setupIncomplete && (
          <PanelSectionRow>
            <div
              role="alert"
              style={{
                width: "100%",
                boxSizing: "border-box",
                padding: "12px",
                border: "1px solid #e55353",
                borderRadius: "4px",
                background: "rgba(128, 24, 24, 0.32)",
                color: "#ffd7d7",
              }}
            >
              <div style={{ fontWeight: 600 }}>{zh("Setup incomplete")}</div>
              <div style={{ marginTop: "6px", lineHeight: 1.35 }}>
                {branchSetupIncomplete ? (
                  <>Lossless Scaling 当前使用 <strong>{selectedBranch}</strong>。请在启动游戏前选择 <strong>{targetBranch}</strong> 分支。</>
                ) : (
                  <>Lossless Scaling 已安装，但小黄鸭运行环境尚未就绪。</>
                )}
              </div>
              {branchSetupIncomplete && (
                <DialogButton
                  onClick={showBranchSetupModal}
                  style={{ width: "100%", marginTop: "10px" }}
                >
                  {zh("Learn more")}
                </DialogButton>
              )}
            </div>
          </PanelSectionRow>
        )}
        <PanelSectionRow>
          <Field
            label="Lossless Scaling"
            description={zh(losslessScalingInstalled ? "Installed" : losslessScalingStatus || "Not installed")}
          />
        </PanelSectionRow>
        <PanelSectionRow>
          <Field label="小黄鸭运行环境" description={installationStatus.includes("失败") ? zhError(installationStatus) : zh(installationStatus)} />
        </PanelSectionRow>
        {steamBranchStatus?.installed && !setupIncomplete && (
          <PanelSectionRow>
            <Field
              label={zh("Steam branch")}
              description={`${steamBranchStatus.selected_branch || "public"}${steamBranchStatus.needs_switch ? ` - 请切换到 ${targetBranch} 分支` : ""}`}
            />
          </PanelSectionRow>
        )}
        <PanelSectionRow>
          <ButtonItem
            layout="below"
            onClick={isInstalled ? onUninstall : onInstall}
            disabled={isInstalling || isUninstalling}
          >
            {buttonLabel}
          </ButtonItem>
        </PanelSectionRow>
      </PanelSection>
      {isInstalled && (
        <>
          <PanelSection title={zh("Global settings")}>
            <PanelSectionRow>
              <ToggleField
                label={zh("FP16 Acceleration")}
                checked={!globalConfig.no_fp16}
                onChange={(value) => void onGlobalConfigChange({ ...globalConfig, no_fp16: !value })}
              />
            </PanelSectionRow>
          </PanelSection>
          <PanelSection title={zh("Advanced")}>
            <PanelSectionRow>
              <ToggleField
                label={zh("Show config file tab")}
                checked={showDebugTab}
                onChange={onShowDebugTabChange}
              />
            </PanelSectionRow>
          </PanelSection>
        </>
      )}
    </>
  );
}
