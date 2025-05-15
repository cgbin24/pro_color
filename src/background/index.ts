import { getSiteTheme, saveSiteTheme, saveButtonPosition, getConfig, saveConfig } from '../utils/storage';

/**
 * 创建右键菜单
 */
const createContextMenu = () => {
  // 先移除所有现有菜单项，防止重复
  chrome.contextMenus.removeAll(() => {
    // 添加选项页面入口
    chrome.contextMenus.create({
      id: 'pro-color-options',
      title: '管理扩展程序',
      contexts: ['action']
    });

    // 添加显示/隐藏悬浮按钮选项
    chrome.contextMenus.create({
      id: 'pro-color-toggle-button',
      title: '显示/隐藏悬浮按钮',
      contexts: ['action']
    });
  });
};

/**
 * 处理右键菜单点击
 */
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'pro-color-options') {
    // 打开选项页
    chrome.runtime.openOptionsPage();
  } else if (info.menuItemId === 'pro-color-toggle-button' && tab?.id) {
    // 切换悬浮按钮显示状态
    chrome.tabs.sendMessage(tab.id, {
      action: 'toggleFloatingButton'
    }).catch(error => {
      console.log('Content script not ready yet');
    });
  }
});

/**
 * 处理扩展安装/更新
 */
chrome.runtime.onInstalled.addListener((details) => {
  // 创建右键菜单
  createContextMenu();
  
  if (details.reason === 'install') {
    // 首次安装时打开选项页面
    chrome.tabs.create({ url: 'options.html' });
  }
});

/**
 * 处理扩展图标点击事件
 */
chrome.action.onClicked.addListener((tab) => {
  // 向当前标签页发送显示/隐藏悬浮按钮的消息
  if (tab.id) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'toggleFloatingButton'
    }).catch(error => {
      // 内容脚本可能尚未加载，这是正常的
      console.log('Content script not ready yet, opening options page instead');
      chrome.runtime.openOptionsPage();
    });
  }
});

/**
 * 监听来自内容脚本的消息
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 处理获取站点主题请求
  if (message.action === 'getSiteTheme' && message.hostname) {
    getSiteTheme(message.hostname)
      .then(theme => {
        sendResponse({ theme });
      })
      .catch(error => {
        console.error('Error getting site theme:', error);
        sendResponse({ error: error.message });
      });
    
    return true; // 指示异步响应
  }
  
  // 处理保存主题请求
  if (message.action === 'saveTheme' && message.hostname && message.theme) {
    saveSiteTheme(message.hostname, message.theme)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch(error => {
        console.error('Error saving site theme:', error);
        sendResponse({ error: error.message });
      });
    
    return true; // 指示异步响应
  }
  
  // 处理移除站点主题请求
  if (message.action === 'removeSiteTheme' && message.hostname) {
    getSiteTheme(message.hostname)
      .then(theme => {
        if (theme) {
          return getConfig().then(config => {
            delete config.themes[message.hostname];
            return saveConfig(config);
          });
        }
      })
      .then(() => {
        sendResponse({ success: true });
      })
      .catch(error => {
        console.error('Error removing site theme:', error);
        sendResponse({ error: error.message });
      });
    
    return true; // 指示异步响应
  }
  
  // 处理保存按钮位置请求
  if (message.action === 'saveButtonPosition' && message.edge) {
    saveButtonPosition(message.edge, message.y)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch(error => {
        console.error('Error saving button position:', error);
        sendResponse({ error: error.message });
      });
    
    return true; // 指示异步响应
  }
  
  // 处理获取按钮位置请求
  if (message.action === 'getButtonPosition') {
    getConfig()
      .then(config => {
        sendResponse({ 
          position: config.floatingButtonPosition || {
            edge: 'right',
            y: 50
          }
        });
      })
      .catch(error => {
        console.error('Error getting button position:', error);
        sendResponse({ 
          error: error.message,
          position: { edge: 'right', y: 50 } // 提供默认值
        });
      });
    
    return true; // 指示异步响应
  }
  
  // 处理打开选项页面请求
  if (message.action === 'openOptionsPage') {
    chrome.runtime.openOptionsPage();
    sendResponse({ success: true });
    return true;
  }
  
  return false;
});

/**
 * 处理标签页更新，确保内容脚本已注入
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && tab.url.startsWith('http')) {
    const url = new URL(tab.url);
    getSiteTheme(url.hostname)
      .then(theme => {
        if (theme) {
          // 通知内容脚本应用主题
          chrome.tabs.sendMessage(tabId, {
            action: 'applyTheme',
            theme
          }).catch(error => {
            // 内容脚本可能尚未加载，这是正常的
            console.log('Content script not ready yet');
          });
        }
      })
      .catch(error => {
        console.error('Error getting site theme on tab update:', error);
      });
  }
}); 