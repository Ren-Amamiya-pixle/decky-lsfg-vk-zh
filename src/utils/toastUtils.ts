import { toaster } from "@decky/api";
import { zh, zhError } from "../i18n/i18n";

export interface ToastOptions {
  title: string;
  body: string;
}

const showToast = (title: string, body: string): void => {
  toaster.toast({ title: zh(title), body: zh(body) });
};
export const showSuccessToast = showToast;
export const showErrorToast = (title: string, body: string): void => showToast(title, zhError(body));

export const ToastMessages = {
  INSTALL_SUCCESS: {
    title: "安装完成",
    body: "小黄鸭运行环境已安装成功",
  },
  INSTALL_ERROR: {
    title: "安装失败",
    body: "发生未知错误",
  },
  UNINSTALL_SUCCESS: {
    title: "卸载完成",
    body: "小黄鸭运行环境已卸载成功",
  },
  UNINSTALL_ERROR: {
    title: "卸载失败",
    body: "发生未知错误",
  },
  CONFIG_UPDATE_ERROR: {
    title: "更新失败",
    body: "更新配置失败",
  },
} as const;

export const showErrorToastWithMessage = (title: string, error: unknown): void =>
  showErrorToast(title, zhError(error));

export const showInstallSuccessToast = (): void =>
  showSuccessToast(ToastMessages.INSTALL_SUCCESS.title, ToastMessages.INSTALL_SUCCESS.body);

export const showInstallErrorToast = (error?: string): void =>
  showErrorToast(ToastMessages.INSTALL_ERROR.title, error || ToastMessages.INSTALL_ERROR.body);

export const showUninstallSuccessToast = (): void =>
  showSuccessToast(ToastMessages.UNINSTALL_SUCCESS.title, ToastMessages.UNINSTALL_SUCCESS.body);

export const showUninstallErrorToast = (error?: string): void =>
  showErrorToast(ToastMessages.UNINSTALL_ERROR.title, error || ToastMessages.UNINSTALL_ERROR.body);
