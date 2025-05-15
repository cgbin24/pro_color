import { BUTTON_HTML } from '../constants';
import { FloatingButtonController } from './button-controller';

/**
 * 创建悬浮按钮
 */
export const createFloatingButton = () => {
  // 检查是否已经存在按钮
  if (document.getElementById('pro-color-floating-button')) {
    return;
  }
  
  // 创建按钮和面板容器，为它们添加一个父容器以便一起操作
  const container = document.createElement('div');
  container.id = 'pro-color-container';
  container.classList.add('pro-color-protected');
  container.innerHTML = BUTTON_HTML;
  
  // 添加到DOM
  document.body.appendChild(container);
  
  // 获取按钮和面板元素
  const button = document.getElementById('pro-color-floating-button')!;
  const panel = document.getElementById('pro-color-theme-panel')!;
  
  // 添加保护类
  button.classList.add('pro-color-protected');
  panel.classList.add('pro-color-protected');
  
  // 确保背景色
  button.style.backgroundColor = '#ffffff';
  panel.style.backgroundColor = 'white';
  
  // 为所有主题选项添加保护类
  document.querySelectorAll('.pro-color-theme-option').forEach(option => {
    option.classList.add('pro-color-protected');
  });
  
  // 初始化悬浮按钮控制器
  FloatingButtonController.init();
  
  // 保存控制器的引用
  (window as any).__proColorButtonController = FloatingButtonController;
  
  return FloatingButtonController;
};

/**
 * 切换悬浮按钮的显示/隐藏状态
 */
export const toggleFloatingButton = () => {
  // 尝试获取按钮控制器
  const buttonController = (window as any).__proColorButtonController;
  
  if (buttonController) {
    buttonController.toggleVisibility();
  } else {
    // 如果控制器不存在，尝试查找按钮并切换显示状态
    const button = document.getElementById('pro-color-floating-button');
    if (button) {
      const isVisible = button.style.display !== 'none';
      button.style.display = isVisible ? 'none' : 'flex';
      
      if (isVisible) {
        const panel = document.getElementById('pro-color-theme-panel');
        if (panel) {
          panel.classList.remove('visible');
        }
      }
    }
  }
}; 