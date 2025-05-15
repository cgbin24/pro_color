import { createFloatingButton, toggleFloatingButton } from './button/floating-button';
import { initThemeHandler, applyTheme } from './theme/theme-manager';

/**
 * 主函数
 */
const main = () => {
  // 等待页面加载完成
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      // 初始化主题处理 - 注意：现在不再直接创建DOM观察器
      initThemeHandler();
      
      // 创建悬浮按钮 - 这个功能不会影响网站内容样式
      createFloatingButton();
    });
  } else {
    // 页面已经加载完成
    initThemeHandler();
    createFloatingButton();
  }
};

// 启动
main();

// 监听来自后台的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'applyTheme' && message.theme) {
    applyTheme(message.theme);
    sendResponse({ success: true });
  } else if (message.action === 'toggleFloatingButton') {
    toggleFloatingButton();
    sendResponse({ success: true });
  }
  return true;
});
