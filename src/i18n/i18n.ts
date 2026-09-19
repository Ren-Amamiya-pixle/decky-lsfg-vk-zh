// languages.json build via CI build
// to generate for localhost/dev, run `build_i18n_json.sh` script
import * as languages from "./languages.json";

type LanguageStrings = Record<string, string>;
type Language = { name: string; strings?: LanguageStrings };
type LanguageData = {
  language_metadata: Record<string, Language>;
  steam_language_map: Record<string, string>;
  [language: string]: LanguageStrings | Record<string, Language> | Record<string, string>;
};

const languageData = languages as unknown as LanguageData;
const steamLanguageMap = languageData.steam_language_map;

const normalizeLanguage = (language: string): string => {
  const normalized = language.trim().toLowerCase();
  return steamLanguageMap[normalized] ?? normalized;
};

function getLangs() {
  const langs = languageData.language_metadata;

  Object.keys(languageData).forEach((lang) => {
    if (lang === "language_metadata" || lang == "steam_language_map") {
      return;
    }
    const strs = languageData[lang] as LanguageStrings;
    if (lang && strs && langs[lang]?.name) {
      langs[lang].strings = strs;
    }
  });

  return langs;
}

export const LANGS: {
  [key: string]: Language;
} = getLangs();

let cachedLang: string | undefined;

export const getCurrentLanguage = (): string => {
  // This is the dedicated Chinese distribution, so it intentionally does not
  // follow the language selected for the surrounding Steam interface.
  if (!cachedLang) cachedLang = "zh";
  return cachedLang;
};

export const getLanguageName = (lang?: string): string => {
  const targetLang = normalizeLanguage(lang || getCurrentLanguage());
  return LANGS[targetLang]?.name || targetLang;
};

/**
 * Translate a key to the current language
 *
 * @param key - Translation key
 * @param originalString - Original text (fallback)
 * @returns Translated string or original text if translation not found
 *
 * @example
 * t('CONTENT_FPS_MULTIPLIER', 'FPS Multiplier')
 */
const t = (key: string, originalString: string): string => {
  const lang = getCurrentLanguage();

  // English always returns the original text
  if (lang === "en") return originalString;

  // Return translation if exists, otherwise return original text
  return LANGS[lang]?.strings?.[key] ?? originalString;
};

export default t;

/** Translate the remaining display strings at render time, including dynamic UI. */
const DISPLAY_TEXT: Record<string, string> = {
  "Settings": "设置",
  "Global settings": "全局设置",
  "Advanced": "高级",
  "Installed": "已安装",
  "Not installed": "未安装",
  "Steam branch": "Steam 分支",
  "FP16 Acceleration": "FP16 加速",
  "Show config file tab": "显示配置文件标签页",
  "Setup incomplete": "设置尚未完成",
  "Learn more": "查看说明",
  "Lossless Scaling": "Lossless Scaling",
  "Steam games": "Steam 游戏",
  "Non-Steam games": "非 Steam 游戏",
  "Flatpak": "Flatpak",
  "Enabled": "已启用",
  "Available": "可用",
  "Back": "返回",
  "Cancel": "取消",
  "Close": "关闭",
  "Retry": "重试",
  "Error": "错误",
  "Unavailable": "不可用",
  "Running": "正在运行",
  "Refreshing...": "正在刷新…",
  "Refresh Flatpaks": "刷新 Flatpak 应用",
  "Remove all": "全部移除",
  "Enable all": "全部启用",
  "Enable all available Flatpaks": "启用全部可用 Flatpak 应用",
  "Remove profile": "移除配置",
  "Remove all profiles": "移除全部配置",
  "Remove Flatpak profile": "移除 Flatpak 配置",
  "Enable for next launch": "为下次启动启用",
  "Game profile": "游戏配置",
  "Game Details": "游戏详情",
  "Flow Scale": "流动缩放",
  "Performance Mode": "性能模式",
  "Present Mode Override": "覆盖呈现模式",
  "Preserve Swapchain Image Count": "保留交换链图像数量",
  "FPS multiplier": "帧率倍率",
  "OFF": "关闭",
  "Enable LSFG-VK": "启用小黄鸭",
  "Enabling...": "正在启用…",
  "Removing...": "正在移除…",
  "Prepared externally": "由外部方式准备",
  "No Flatpak applications found": "未找到 Flatpak 应用",
  "Flatpak application is no longer installed": "此 Flatpak 应用已不再安装",
  "Target source unavailable": "无法确定目标来源",
  "File unavailable": "文件不可用",
  "Game is running": "游戏正在运行",
  "Quit and enable": "退出并启用",
  "Enable without quitting": "不退出直接启用",
  "No Steam games found": "未找到 Steam 游戏",
  "No non-Steam shortcuts found": "未找到非 Steam 快捷方式",
  "Could not initialize workarounds": "无法初始化兼容设置",
  "Could not clean up game workarounds": "无法清理游戏兼容设置",
  "Could not clean up game launch options": "无法清理游戏启动选项",
  "Workaround rollback failed": "兼容设置回滚失败",
  "Workaround update failed": "兼容设置更新失败",
  "Flatpak unavailable": "Flatpak 不可用",
  "Flatpak operation failed": "Flatpak 操作失败",
  "Could not enable all games": "无法启用全部游戏",
  "Could not remove all profiles": "无法移除全部配置",
  "Could not roll back workaround state": "无法回滚兼容设置",
  "Could not remove the selected profiles": "无法移除所选配置",
  "Could not read workaround state": "无法读取兼容设置",
  "Could not save workaround state": "无法保存兼容设置",
  "Could not remove workaround state": "无法移除兼容设置",
  "Could not list Flatpak applications": "无法列出 Flatpak 应用",
  "The target source is unknown; re-discover the game before enabling it": "目标来源未知；请重新扫描游戏后再启用。",
  "Reinstalling...": "正在重新安装…",
  "Reinstall wrapper": "重新安装包装器",
  "Present": "存在",
  "Not present": "不存在",
  "Lossless Scaling Not Installed": "Lossless Scaling 未安装",
  "Uninstallation cancelled: could not clean up launch options": "卸载已取消：无法清理启动选项",
  "Game is no longer available": "游戏已不可用",
  "Unknown source": "来源未知",
  "Enable all available Flatpaks?": "启用全部可用 Flatpak 应用？",
};

const replaceDisplayText = (value: string): string => {
  const direct = DISPLAY_TEXT[value.trim()];
  if (direct) return value.replace(value.trim(), direct);
  return value
    .replace(/^Enable all (Steam games|non-Steam shortcuts)$/, (_match, source: string) => `启用全部${source === "Steam games" ? " Steam 游戏" : "非 Steam 快捷方式"}`)
    .replace(/^Remove all (Steam|Non-Steam) profiles$/, (_match, source: string) => `移除全部${source === "Steam" ? " Steam" : "非 Steam"}配置`)
    .replace(/^No (Steam games|non-Steam shortcuts) found$/, (_match, source: string) => `未找到${source === "Steam games" ? " Steam 游戏" : "非 Steam 快捷方式"}`)
    .replace(/^Enable all available (Steam games|non-Steam shortcuts)\?$/, (_match, source: string) => `启用全部可用${source === "Steam games" ? " Steam 游戏" : "非 Steam 快捷方式"}？`)
    .replace(/^Remove all (Steam games|non-Steam shortcuts) profiles\?$/, (_match, source: string) => `移除全部${source === "Steam games" ? " Steam 游戏" : "非 Steam 快捷方式"}配置？`)
    .replace(/^Non-Steam \| Use Flatpak Tab$/, "非 Steam｜请在 Flatpak 标签页管理")
    .replace(/^Unknown source · excluded from bulk actions$/, "来源未知 · 不参与批量操作")
    .replace(/^Bulk actions exclude this profile$/, "批量操作不包含此配置")
    .replace(/^Prepared externally$/, "由外部方式准备")
    .replace(/^Available$/, "可用")
    .replace(/^Enabled$/, "已启用")
    .replace(/^Running$/, "正在运行")
    .replace(/^Back to (Flatpaks|.*)$/, (_match, target: string) => `返回${target === "Flatpaks" ? " Flatpak 应用" : target}`)
    .replace(/^Lossless Scaling is installed, but its LSFG-VK runtime is not ready yet\.$/, "Lossless Scaling 已安装，但小黄鸭运行环境尚未就绪。")
    .replace(/^Lossless Scaling is on (.*)\. Select the (.*) branch before launching games\.$/, "Lossless Scaling 当前使用 $1。请在启动游戏前选择 $2 分支。")
    .replace(/^Quit the game now so LSFG-VK is used on its next launch\?$/, "现在退出游戏，以便下次启动时使用小黄鸭？")
    .replace(/^Refresh Steam and try again before enabling this target\.$/, "请刷新 Steam 后再尝试启用此目标。")
    .replace(/^Steam has not reported any eligible installed games$/, "Steam 尚未报告可用的已安装游戏")
    .replace(/^Steam has not reported any eligible non-Steam shortcuts$/, "Steam 尚未报告可用的非 Steam 快捷方式")
    .replace(/^The file has not been created yet\.$/, "该文件尚未创建。")
    .replace(/^Steam did not provide readable launch options\.$/, "Steam 未提供可读取的启动选项。")
    .replace(/^Create individual LSFG-VK profiles for every Flatpak app this plugin can manage\. Apps prepared externally or unavailable will be skipped\.$/, "为本插件可管理的每个 Flatpak 应用创建独立的小黄鸭配置；由外部方式准备或不可用的应用将跳过。")
    .replace(/^Create individual LSFG-VK profiles for every available (.*)\. Unknown-source profiles are excluded\. Flatpak profiles are managed separately in the Flatpak tab\.$/, "为每个可用目标创建独立的小黄鸭配置；来源未知的配置不会包含在内，Flatpak 配置请在 Flatpak 标签页单独管理。")
    .replace(/^Remove all Flatpak profiles\?$/, "移除全部 Flatpak 配置？")
    .replace(/^Finish LSFG-VK setup$/, "完成小黄鸭设置")
    .replace(/^Switch Lossless Scaling to the lsfg-vk branch$/, "将 Lossless Scaling 切换至 lsfg-vk 分支")
    .replace(/^Open Lossless Scaling in your Steam library\.$/, "在 Steam 库中打开 Lossless Scaling。")
    .replace(/^Open Properties, then Game Versions & Betas\.$/, "打开属性，然后进入游戏版本与测试版。")
    .replace(/^Select the lsfg-vk branch\.$/, "选择 lsfg-vk 分支。")
    .replace(/^Wait for Steam to finish the update and reopen Decky LSFG-VK\.$/, "等待 Steam 完成更新后重新打开小黄鸭。")
    .replace(/^Controls: (.*) profile$/, "控制：$1 配置")
    .replace(/^Could not create a profile for (.*)$/, "无法为 $1 创建配置")
    .replace(/^FPS multiplier · /, "帧率倍率 · ")
    .replace(/^Flow Scale \(/, "流动缩放（")
    .replace(/^([\d.]+%)\)$/, "$1）")
    .replace(/^Running in (.*)$/, "正在 $1 中运行")
    .replace(/^Steam shortcut$/, "Steam 快捷方式")
    .replace(/^Reading launch options\.\.\.$/, "正在读取启动选项…")
    .replace(/^Launch options unavailable$/, "启动选项不可用")
    .replace(/^Wrapper needs to be reinstalled$/, "需要重新安装包装器")
    .replace(/^LSFG-VK Enabled$/, "小黄鸭已启用")
    .replace(/^LSFG-VK not enabled$/, "小黄鸭未启用")
    .replace(/^App ID /, "应用 ID ")
    .replace(/^runtime /, "运行时 ")
    .replace(/^profile /, "配置 ")
    .replace(/^Installation failed:/, "安装失败：")
    .replace(/^Uninstallation failed:/, "卸载失败：")
    .replace(/^Installing lsfg-vk\.\.\.$/, "正在安装小黄鸭…")
    .replace(/^Uninstalling lsfg-vk\.\.\.$/, "正在卸载小黄鸭…")
    .replace(/^lsfg-vk Installed$/, "小黄鸭已安装")
    .replace(/^lsfg-vk Not Installed$/, "小黄鸭未安装")
    .replace(/^lsfg-vk installed$/, "小黄鸭已安装")
    .replace(/^lsfg-vk uninstalled successfully!$/, "小黄鸭已成功卸载");
};
export const zh = replaceDisplayText;

/** Unexpected backend diagnostics remain available in the console, not in the Chinese UI. */
export const zhError = (error: unknown): string => {
  const message = error instanceof Error ? error.message : String(error ?? "");
  const translated = zh(message);
  if (!/[A-Za-z]{3,}/.test(translated) || translated !== message) return translated;
  console.error("小黄鸭运行错误：", message);
  return "操作未完成，请查看 Decky 日志中的详细错误信息。";
};
