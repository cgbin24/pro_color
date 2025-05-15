import { ThemeName } from '../types';
import { DEFAULT_THEMES } from '../../types';
import { markBackgroundImages } from './bg-detector';
import { protectUIElements } from '../utils/protection';
import { processSpecificElements } from './site-adapter';
import { createDomObserver, disconnectDomObserver } from '../observer/dom-observer';

// 保存当前激活的主题状态
let currentActiveTheme: ThemeName | null = null;

/**
 * 应用主题到页面
 */
export const applyTheme = (themeName: ThemeName | null) => {
  console.log('应用主题:', themeName);
  const html = document.documentElement;

  // 更新当前激活的主题状态
  currentActiveTheme = themeName;

  if (!themeName) {
    // 断开DOM观察器
    disconnectDomObserver();
    
    // 重置主题时，移除背景图片标记
    document.querySelectorAll('.has-bg-image').forEach(el => {
      el.classList.remove('has-bg-image');
      el.removeAttribute('data-has-pseudo-bg');
    });
    
    // 清除所有旧的主题类
    DEFAULT_THEMES.forEach(theme => {
      html.classList.remove(theme.id);
    });
    
    // 如果是重置主题，移除主题应用标记和网站特定标记
    html.classList.remove('pro-color-theme-applied');
    html.removeAttribute('data-site');
    
    // 移除已处理元素上的内联样式
    document.querySelectorAll('.pro-color-processed').forEach(el => {
      if (el instanceof HTMLElement) {
        el.style.removeProperty('background-color');
        el.style.removeProperty('color');
        el.style.removeProperty('border-color');
        el.classList.remove('pro-color-processed');
      }
    });
  } else {
    // 仅在应用有效主题时标记背景图片
    markBackgroundImages();
    
    // 清除所有旧的主题类
    DEFAULT_THEMES.forEach(theme => {
      html.classList.remove(theme.id);
    });
    
    // 添加新的主题类
    html.classList.add(themeName);
    html.classList.add('pro-color-theme-applied');
    
    // 清除可能存在的处理标记
    document.querySelectorAll('.pro-color-processed').forEach(el => {
      el.classList.remove('pro-color-processed');
    });
    
    // 获取要处理的需要单独处理的元素
    processSpecificElements(themeName);
    
    // 启动DOM观察器以处理动态内容
    createDomObserver();
  }
  
  // 保护UI元素的逻辑可以一直运行，因为它现在主要添加标记类
  protectUIElements();
};

/**
 * 初始化主题处理
 */
export const initThemeHandler = async () => {
  // 从存储获取当前站点的主题
  chrome.runtime.sendMessage(
    { action: 'getSiteTheme', hostname: window.location.hostname },
    (response) => {
      if (response && response.theme) {
        applyTheme(response.theme);
      } else {
        // 如果没有存储的主题，也调用一次applyTheme(null)来确保清理状态
        applyTheme(null);
      }
    }
  );
};

/**
 * 获取当前激活的主题
 */
export const getCurrentActiveTheme = () => {
  return currentActiveTheme;
}; 