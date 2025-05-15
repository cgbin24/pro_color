import React, { useState, useEffect } from 'react';
import { ThemeOption, DEFAULT_THEMES } from '../../types';
import './Popup.css';

const Popup: React.FC = () => {
  const [currentHostname, setCurrentHostname] = useState<string>('');
  const [currentTheme, setCurrentTheme] = useState<string | null>(null);
  
  // 获取当前标签信息
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0].url) {
        try {
          const url = new URL(tabs[0].url);
          setCurrentHostname(url.hostname);
          
          // 获取当前站点主题
          chrome.runtime.sendMessage(
            { action: 'getSiteTheme', hostname: url.hostname },
            (response) => {
              if (response && response.theme) {
                setCurrentTheme(response.theme);
              }
            }
          );
        } catch (error) {
          console.error('Invalid URL:', error);
        }
      }
    });
  }, []);
  
  // 应用主题
  const applyTheme = (theme: string) => {
    // 保存主题设置
    chrome.runtime.sendMessage(
      {
        action: 'saveTheme',
        hostname: currentHostname,
        theme
      },
      () => {
        setCurrentTheme(theme);
        
        // 应用到当前页面
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0].id) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'applyTheme',
              theme
            });
          }
        });
      }
    );
  };
  
  // 移除主题
  const removeTheme = () => {
    chrome.runtime.sendMessage(
      {
        action: 'saveTheme',
        hostname: currentHostname,
        theme: null
      },
      () => {
        setCurrentTheme(null);
        
        // 移除当前页面的主题
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0].id) {
            chrome.tabs.sendMessage(tabs[0].id, {
              action: 'applyTheme',
              theme: null
            });
          }
        });
      }
    );
  };
  
  // 打开选项页
  const openOptions = () => {
    chrome.runtime.openOptionsPage();
  };
  
  return (
    <div className="popup-container">
      <header className="popup-header">
        <h1>Pro Color</h1>
        <p className="current-site">{currentHostname || '当前网站'}</p>
      </header>
      
      <div className="theme-list">
        {DEFAULT_THEMES.map((theme: ThemeOption) => (
          <div 
            key={theme.id}
            className={`theme-item ${currentTheme === theme.id ? 'active' : ''}`}
            onClick={() => applyTheme(theme.id)}
          >
            <div className={`theme-color ${theme.colorClass}`}></div>
            <div className="theme-name">{theme.name}</div>
          </div>
        ))}
      </div>
      
      <div className="popup-actions">
        <button 
          className="remove-theme-btn"
          onClick={removeTheme}
          disabled={!currentTheme}
        >
          恢复默认
        </button>
        <button className="options-btn" onClick={openOptions}>
          高级设置
        </button>
      </div>
    </div>
  );
};

export default Popup; 