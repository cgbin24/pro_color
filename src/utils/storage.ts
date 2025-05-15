import { ThemeConfig, DEFAULT_CONFIG } from '../types';

// 存储键名
const STORAGE_KEY = 'pro_color_config';

/**
 * 获取完整配置
 */
export const getConfig = async (): Promise<ThemeConfig> => {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] || DEFAULT_CONFIG;
  } catch (error) {
    console.error('Failed to get config:', error);
    return DEFAULT_CONFIG;
  }
};

/**
 * 保存完整配置
 */
export const saveConfig = async (config: ThemeConfig): Promise<void> => {
  try {
    await chrome.storage.local.set({ [STORAGE_KEY]: config });
  } catch (error) {
    console.error('Failed to save config:', error);
  }
};

/**
 * 获取特定网站的主题
 */
export const getSiteTheme = async (hostname: string): Promise<string | null> => {
  const config = await getConfig();
  return config.themes[hostname] || null;
};

/**
 * 保存特定网站的主题
 */
export const saveSiteTheme = async (hostname: string, theme: string): Promise<void> => {
  const config = await getConfig();
  config.themes[hostname] = theme;
  await saveConfig(config);
};

/**
 * 保存悬浮按钮位置
 */
export const saveButtonPosition = async (edge: 'left' | 'right', y: number): Promise<void> => {
  const config = await getConfig();
  config.floatingButtonPosition = { edge, y };
  await saveConfig(config);
};

/**
 * 导出配置为JSON字符串
 */
export const exportConfig = async (): Promise<string> => {
  const config = await getConfig();
  return JSON.stringify(config, null, 2);
};

/**
 * 从JSON字符串导入配置
 */
export const importConfig = async (jsonString: string): Promise<boolean> => {
  try {
    const config = JSON.parse(jsonString) as ThemeConfig;
    
    // 简单验证
    if (!config.version || !config.themes) {
      throw new Error('Invalid config format');
    }
    
    await saveConfig(config);
    return true;
  } catch (error) {
    console.error('Failed to import config:', error);
    return false;
  }
};

/**
 * 恢复默认配置
 */
export const resetConfig = async (): Promise<void> => {
  await saveConfig(DEFAULT_CONFIG);
}; 