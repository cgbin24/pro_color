import { DEFAULT_THEMES } from '../types';

// 注入到页面的HTML
export const BUTTON_HTML = `
<button id="pro-color-floating-button" title="Pro Color 主题切换">
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="#3F3F46" stroke-width="2"/>
    <path d="M7 12.5C7.82843 12.5 8.5 11.8284 8.5 11C8.5 10.1716 7.82843 9.5 7 9.5C6.17157 9.5 5.5 10.1716 5.5 11C5.5 11.8284 6.17157 12.5 7 12.5Z" fill="#3F3F46"/>
    <path d="M12 16.5C12.8284 16.5 13.5 15.8284 13.5 15C13.5 14.1716 12.8284 13.5 12 13.5C11.1716 13.5 10.5 14.1716 10.5 15C10.5 15.8284 11.1716 16.5 12 16.5Z" fill="#3F3F46"/>
    <path d="M17 12.5C17.8284 12.5 18.5 11.8284 18.5 11C18.5 10.1716 17.8284 9.5 17 9.5C16.1716 9.5 15.5 10.1716 15.5 11C15.5 11.8284 16.1716 12.5 17 12.5Z" fill="#3F3F46"/>
  </svg>
</button>
<div id="pro-color-theme-panel">
  ${DEFAULT_THEMES.map(theme => `
    <div class="pro-color-theme-option" data-theme="${theme.id}">
      <div class="pro-color-theme-color ${theme.colorClass}"></div>
      <div class="pro-color-theme-name">${theme.name}</div>
    </div>
  `).join('')}
  <div class="pro-color-theme-option pro-color-reset" data-theme="reset">
    <div class="pro-color-theme-color theme-reset-color">
      <svg t="1747197066551" class="icon" viewBox="0 0 1027 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="15718" width="200" height="200"><path d="M1020.44444 460.8l-185.6-230.4c-19.2-25.6-57.6-25.6-76.8 0l-185.6 230.4c-12.8 19.2 0 44.8 19.2 44.8h70.4c0 134.4 0 307.2-243.2 448-6.4 6.4 0 12.8 6.4 12.8 454.4-70.4 492.8-377.6 492.8-460.8h76.8c25.6 0 38.4-25.6 25.6-44.8z m-582.4 57.6h-76.8c0-134.4 0-307.2 243.2-448 6.4-6.4 0-12.8-6.4-12.8-454.4 70.4-492.8 377.6-492.8 460.8h-76.8c-25.6 0-38.4 25.6-19.2 44.8l185.6 230.4c19.2 25.6 57.6 25.6 76.8 0l185.6-230.4c12.8-19.2 0-44.8-19.2-44.8z" fill="#cdcdcd" p-id="15719"></path></svg>
    </div>
    <div class="pro-color-theme-name">重置主题</div>
  </div>
</div>
`;

// 配置参数
export const FLOATING_BUTTON_CONFIG = {
  DRAG_THRESHOLD: 5,        // 拖动阈值，小于此值被视为点击
  CLICK_TIME_THRESHOLD: 200, // 毫秒，小于此值被视为点击
  EDGE_GAP: 20,             // 按钮距离屏幕边缘距离（吸附时）
  BUTTON_SIZE: 44,          // 按钮尺寸
  PANEL_BUTTON_GAP: 15,     // 面板与按钮之间的间距
  PANEL_WIDTH: 380,         // 面板宽度
  PANEL_MARGIN: 10,         // 面板与屏幕边缘的最小距离
  MIN_Y_PERCENT: 10,        // 按钮Y轴最小位置（百分比）
  MAX_Y_PERCENT: 90,        // 按钮Y轴最大位置（百分比）
  SNAP_THRESHOLD: 50,       // 距离边缘多少像素时自动吸附（0表示不吸附）
  ALWAYS_SNAP_TO_EDGE: true // 是否始终吸附到最近侧边
}; 