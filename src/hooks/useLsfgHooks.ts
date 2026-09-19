import { useCallback, useEffect, useState } from "react";
import {
  checkLsfgVkInstalled,
  getLosslessScalingBranchStatus,
  installLsfgVk,
  uninstallLsfgVk,
  type SteamBranchStatus,
} from "../api/lsfgApi";
import {
  showInstallErrorToast,
  showInstallSuccessToast,
  showUninstallErrorToast,
  showUninstallSuccessToast,
} from "../utils/toastUtils";
import { zh } from "../i18n/i18n";

export function useInstallation(
  reloadConfig?: () => Promise<void>,
  beforeUninstall?: () => Promise<boolean>,
) {
  const [isInstalled, setIsInstalled] = useState(false);
  const [installationStatus, setInstallationStatus] = useState("");
  const [losslessScalingInstalled, setLosslessScalingInstalled] = useState(false);
  const [losslessScalingStatus, setLosslessScalingStatus] = useState("");
  const [steamBranchStatus, setSteamBranchStatus] = useState<SteamBranchStatus | null>(null);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isUninstalling, setIsUninstalling] = useState(false);

  const checkInstallation = useCallback(async () => {
    try {
      setSteamBranchStatus(await getLosslessScalingBranchStatus());
    } catch (error) {
      console.error("Error checking Lossless Scaling Steam branch:", error);
      setSteamBranchStatus(null);
    }

    try {
      const status = await checkLsfgVkInstalled();
      setIsInstalled(status.installed);
      setLosslessScalingInstalled(status.lossless_scaling_installed);
      setLosslessScalingStatus(status.lossless_scaling_installed ? "已安装" : "未安装");
      setInstallationStatus(status.installed ? "小黄鸭运行环境已安装" : "小黄鸭运行环境未安装");
      return status.installed;
    } catch {
      setSteamBranchStatus(null);
      setLosslessScalingInstalled(false);
      setLosslessScalingStatus("未安装");
      setInstallationStatus("小黄鸭运行环境未安装");
      return false;
    }
  }, []);

  useEffect(() => {
    void checkInstallation();
  }, [checkInstallation]);

  const setupComplete =
    isInstalled &&
    losslessScalingInstalled &&
    steamBranchStatus?.success === true &&
    steamBranchStatus.installed &&
    !steamBranchStatus.needs_switch;

  useEffect(() => {
    if (setupComplete || isInstalling || isUninstalling) return;

    const interval = window.setInterval(() => {
      void checkInstallation();
    }, 2000);

    return () => window.clearInterval(interval);
  }, [checkInstallation, isInstalling, isUninstalling, setupComplete]);

  const install = async () => {
    setIsInstalling(true);
    setInstallationStatus("正在安装小黄鸭运行环境…");
    try {
      const result = await installLsfgVk();
      if (!result.success) {
        setInstallationStatus(`安装失败：${zh(result.error || "未知错误")}`);
        showInstallErrorToast(result.error ?? undefined);
        return;
      }
      setInstallationStatus("小黄鸭运行环境已安装");
      showInstallSuccessToast();
      await reloadConfig?.();
      await checkInstallation();
    } catch (error) {
      setInstallationStatus(`安装失败：${zh(String(error))}`);
      showInstallErrorToast(String(error));
    } finally {
      setIsInstalling(false);
    }
  };

  const uninstall = async () => {
    setIsUninstalling(true);
    setInstallationStatus("正在卸载小黄鸭运行环境…");
    try {
      if (beforeUninstall && !(await beforeUninstall())) {
        setInstallationStatus("卸载已取消：无法清理启动选项");
        return;
      }
      const result = await uninstallLsfgVk();
      if (!result.success) {
        setInstallationStatus(`卸载失败：${zh(result.error || "未知错误")}`);
        showUninstallErrorToast(result.error ?? undefined);
        return;
      }
      setIsInstalled(false);
      setInstallationStatus("小黄鸭运行环境已成功卸载");
      await checkInstallation();
      showUninstallSuccessToast();
    } catch (error) {
      setInstallationStatus(`卸载失败：${zh(String(error))}`);
      showUninstallErrorToast(String(error));
    } finally {
      setIsUninstalling(false);
    }
  };

  return {
    isInstalled,
    setupComplete,
    installationStatus,
    losslessScalingInstalled,
    losslessScalingStatus,
    steamBranchStatus,
    isInstalling,
    isUninstalling,
    install,
    uninstall,
    checkInstallation,
  };
}
