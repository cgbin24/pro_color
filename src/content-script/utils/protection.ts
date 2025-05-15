/**
 * 保护UI元素
 */
export const protectUIElements = () => {
  // 查找所有扩展的UI元素
  const uiElements = document.querySelectorAll(
    '#pro-color-container, ' + 
    '#pro-color-floating-button, ' + 
    '#pro-color-theme-panel, ' + 
    '.pro-color-theme-option, ' + 
    '.pro-color-theme-color, ' + 
    '.pro-color-theme-name, ' + 
    '[id^="pro-color"], ' + 
    '[class^="pro-color"]'
  );
  
  // 为每个元素设置保护
  uiElements.forEach(element => {
    if (element instanceof HTMLElement) {
      // 添加类标记，以便CSS可以针对性地应用样式
      element.classList.add('pro-color-ui');
      
      // 注意：不再通过JavaScript直接设置背景颜色等样式
      // 所有视觉保护样式将由 public/themes.css 中的 !important 规则处理
    }
  });
};

/**
 * 确保插件UI元素不受主题影响
 */
export const protectProColorElements = () => {
  // 保护按钮和面板
  const container = document.getElementById('pro-color-container');
  const button = document.getElementById('pro-color-floating-button');
  const panel = document.getElementById('pro-color-theme-panel');
  const options = document.querySelectorAll('.pro-color-theme-option');
  
  // 保护容器
  if (container) {
    container.classList.add('pro-color-protected');
    // container.style.backgroundColor = 'transparent'; // 由CSS处理
  }
  
  // 保护按钮
  if (button) {
    button.classList.add('pro-color-protected');
    // button.style.backgroundColor = '#ffffff'; // 由CSS处理
  }
  
  // 保护面板
  if (panel) {
    panel.classList.add('pro-color-protected');
    // panel.style.backgroundColor = 'white'; // 由CSS处理
  }
  
  // 保护所有主题选项
  options.forEach(option => {
    option.classList.add('pro-color-protected');
    // if (option instanceof HTMLElement) { // 由CSS处理
    //   option.style.backgroundColor = 'transparent';
    // }
  });
}; 