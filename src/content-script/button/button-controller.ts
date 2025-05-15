import { ButtonControllerState } from '../types';
import { FLOATING_BUTTON_CONFIG } from '../constants';
import { applyTheme } from '../theme/theme-manager';

// 全局变量
let button: HTMLElement;
let panel: HTMLElement;

/**
 * 悬浮按钮控制器
 */
export const FloatingButtonController = {
  // 状态变量
  state: {
    isDragging: false,
    isPanelVisible: false,
    isButtonOnRight: false, // 标记按钮是否在右侧
    dragStartTime: 0,
    initialMouseX: 0,
    initialMouseY: 0,
    initialButtonX: 0,
    initialButtonY: 0,
    buttonRect: null as DOMRect | null,
    dragDistance: 0,
    animationFrameId: null as number | null,
    currentPosition: {
      x: window.innerWidth - FLOATING_BUTTON_CONFIG.EDGE_GAP - 22, // 默认右侧位置
      y: window.innerHeight / 2
    }
  } as ButtonControllerState,
  
  // 初始化
  init() {
    // 获取DOM元素
    button = document.getElementById('pro-color-floating-button')!;
    panel = document.getElementById('pro-color-theme-panel')!;
    
    // 设置按钮初始位置（将在后续从存储中读取）
    this.setButtonPosition(window.innerWidth - FLOATING_BUTTON_CONFIG.EDGE_GAP - 22, window.innerHeight / 2);
    this.state.isButtonOnRight = true; // 默认按钮在右侧
    
    // 绑定事件处理
    button.addEventListener('mousedown', this.handleMouseDown.bind(this));
    button.addEventListener('click', this.handleClick.bind(this));
    button.addEventListener('contextmenu', this.handleContextMenu.bind(this));
    
    // 主题选择处理
    this.initThemeOptions();
    
    // 点击外部关闭面板
    document.addEventListener('click', this.handleOutsideClick.bind(this));
    
    // 窗口大小变化时调整按钮位置
    window.addEventListener('resize', this.handleWindowResize.bind(this));
    
    // 从存储读取按钮位置
    this.initButtonPosition();
    
    // 初始化完成
    console.log('Pro Color floating button initialized');
  },
  
  // 初始化按钮位置
  initButtonPosition() {
    chrome.runtime.sendMessage(
      { action: 'getButtonPosition' },
      (response) => {
        if (response && response.position) {
          const { edge, y: yPercent } = response.position;
          const yPixel = (window.innerHeight * yPercent) / 100;
          let xPixel;

          if (edge === 'left') {
            xPixel = FLOATING_BUTTON_CONFIG.EDGE_GAP + button.offsetWidth / 2;
            this.state.isButtonOnRight = false;
          } else {
            xPixel = window.innerWidth - FLOATING_BUTTON_CONFIG.EDGE_GAP - button.offsetWidth / 2;
            this.state.isButtonOnRight = true;
          }
          
          console.log('初始化按钮位置 (中心点):', { edge, yPercent, xPixel, yPixel });
          // 初始加载时，按钮可能默认opacity为0或不可见，在setButtonPosition中处理
          this.setButtonPosition(xPixel, yPixel, false, true);
        } else {
          // 如果没有存储位置，则使用默认位置并设为可见
          const defaultX = window.innerWidth - FLOATING_BUTTON_CONFIG.EDGE_GAP - button.offsetWidth / 2;
          const defaultY = window.innerHeight / 2;
          this.state.isButtonOnRight = true;
          this.setButtonPosition(defaultX, defaultY, false, true);
        }
      }
    );
  },
  
  // 窗口大小变化处理
  handleWindowResize() {
    // 确保按钮不会超出屏幕边界
    const { x, y } = this.state.currentPosition;
    const newX = Math.min(Math.max(22, x), window.innerWidth - 44);
    const newY = Math.min(Math.max(22, y), window.innerHeight - 22);
    
    if (newX !== x || newY !== y) {
      this.setButtonPosition(newX, newY);
    }
  },
  
  // 设置按钮位置（使用绝对像素）
  setButtonPosition(x: number, y: number, isSnappingAnimation: boolean = false, initialSetup: boolean = false) {
    // x 和 y 是按钮的期望中心点
    // 限制按钮不超出屏幕范围 (基于中心点)
    x = Math.max(button.offsetWidth / 2, Math.min(window.innerWidth - button.offsetWidth / 2, x));
    y = Math.max(button.offsetHeight / 2, Math.min(window.innerHeight - button.offsetHeight / 2, y));
    
    this.state.currentPosition = { x, y };
    
    if (x <= window.innerWidth / 2) {
        this.state.isButtonOnRight = false;
    } else {
        this.state.isButtonOnRight = true;
    }

    let transitionProperties = [];
    if (isSnappingAnimation) {
      transitionProperties.push('left 0.2s ease', 'right 0.2s ease');
    } else if (!initialSetup && !this.state.isDragging) { // 例如窗口大小调整, 或非拖拽的常规移动
      transitionProperties.push('left 0.2s ease', 'right 0.2s ease', 'top 0.2s ease');
    }
    // initialSetup 或者 isDragging 时，transition 为 'none' (通过不向数组添加任何内容实现)
    // opacity 的过渡会在 initialSetup 的 setTimeout 中单独添加
    button.style.transition = transitionProperties.join(', ') || 'none';
    
    if (this.state.isButtonOnRight) {
      button.style.right = `${window.innerWidth - x}px`; 
      button.style.left = 'auto';
      button.style.transform = 'translate(50%, -50%)';
    } else {
      button.style.left = `${x}px`; 
      button.style.right = 'auto';
      button.style.transform = 'translate(-50%, -50%)';
    }
    button.style.top = `${y}px`;

    if (initialSetup) {
        button.style.opacity = '1'; 
        button.style.pointerEvents = 'auto';
        setTimeout(() => {
            if(button && !this.state.isDragging){
                // 恢复标准过渡，并加入 opacity 过渡
                button.style.transition = 'left 0.2s ease, right 0.2s ease, top 0.2s ease, opacity 0.2s ease';
            }
        }, 50); 
    }
    
    if (isSnappingAnimation) {
      setTimeout(() => {
        if (button && !this.state.isDragging) { 
          // 吸附动画后，也恢复包含 top 和 opacity 的标准过渡
          button.style.transition = 'left 0.2s ease, right 0.2s ease, top 0.2s ease, opacity 0.2s ease';
        }
      }, 200); 
    }
    
    if (!this.state.isDragging) {
      this.updatePanelPosition(this.state.isButtonOnRight);
    }
  },
  
  // 更新面板位置
  updatePanelPosition(isPanelOnLeft: boolean) {
    const { x, y } = this.state.currentPosition;
    
    // 确定按钮实际位置
    const isActuallyOnRight = this.state.isButtonOnRight || x > window.innerWidth / 2;
    
    // 简化位置日志输出，减少控制台负担
    // console.log("按钮实际在" + (isActuallyOnRight ? "右侧" : "左侧"));
    
    // 严格重置所有样式，避免任何冲突
    panel.removeAttribute('style');
    
    // 设置基本样式
    panel.style.position = 'fixed';
    panel.style.top = `${y}px`;
    panel.style.transform = 'translateY(-50%)';
    panel.style.transition = 'all 0.25s ease-out'; // 添加平滑过渡
    
    // 定位距离 = 边缘间距 + 按钮大小 + 面板与按钮的间距
    const offset = FLOATING_BUTTON_CONFIG.EDGE_GAP + FLOATING_BUTTON_CONFIG.BUTTON_SIZE + FLOATING_BUTTON_CONFIG.PANEL_BUTTON_GAP;
    
    // 根据按钮实际位置确定面板定位方式
    if (isActuallyOnRight) {
      panel.style.right = `${offset}px`;
      panel.style.left = 'auto';
    } else {
      panel.style.left = `${offset}px`;
      panel.style.right = 'auto';
    }
    
    // 添加方向类，用于动画
    panel.classList.remove('panel-left', 'panel-right');
    panel.classList.add(isActuallyOnRight ? 'panel-left' : 'panel-right');
    
    // 修改可见状态
    if (this.state.isPanelVisible) {
      panel.classList.add('visible');
    } else {
      panel.classList.remove('visible');
    }
  },
  
  // 处理鼠标按下事件
  handleMouseDown(e: MouseEvent) {
    // 只处理左键点击
    if (e.button !== 0) return;
    
    // 初始化拖动状态
    const rect = button.getBoundingClientRect();
    this.state.isDragging = false;
    this.state.buttonRect = rect;
    this.state.initialMouseX = e.clientX;
    this.state.initialMouseY = e.clientY;
    this.state.initialButtonX = this.state.currentPosition.x;
    this.state.initialButtonY = this.state.currentPosition.y;
    this.state.dragStartTime = Date.now();
    this.state.dragDistance = 0;
    
    // 添加临时事件监听
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
    
    // 阻止事件传播
    e.preventDefault();
    e.stopPropagation();
  },
  
  // 处理鼠标移动事件（使用箭头函数避免this绑定问题）
  handleMouseMove: function(e: MouseEvent) {
    const self = FloatingButtonController;
    
    // 计算拖动距离
    const dx = e.clientX - self.state.initialMouseX;
    const dy = e.clientY - self.state.initialMouseY;
    self.state.dragDistance = Math.sqrt(dx * dx + dy * dy);
    
    // 判断是否已达到拖动阈值
    if (self.state.dragDistance > FLOATING_BUTTON_CONFIG.DRAG_THRESHOLD) {
      // 如果是第一次超过阈值，标记为拖动状态并关闭面板
      if (!self.state.isDragging) {
        self.state.isDragging = true;
        button.classList.add('dragging');
        
        // 拖动时关闭面板
        if (self.state.isPanelVisible) {
          self.state.isPanelVisible = false;
          panel.classList.remove('visible');
        }
        
        // 创建初始位置引用以便直接使用transform
        self.state.initialButtonX = self.state.currentPosition.x;
        self.state.initialButtonY = self.state.currentPosition.y;
        
        // 设置按钮为absolute定位提高性能
        button.style.position = 'fixed';
        button.style.left = self.state.initialButtonX + 'px';
        button.style.top = self.state.initialButtonY + 'px';
        button.style.right = 'auto';
        
        // 清除可能影响性能的transform
        button.style.transform = 'translate(-50%, -50%)';
      }
      
      // 使用transform直接更新位置，性能更好
      if (self.state.animationFrameId) {
        cancelAnimationFrame(self.state.animationFrameId);
      }
      
      self.state.animationFrameId = requestAnimationFrame(() => {
        // 使用transform实现拖动，减少reflow
        button.style.transform = `translate(${dx}px, ${dy}px) translate(-50%, -50%)`;
        
        // 更新当前位置引用（不直接操作DOM）
        self.state.currentPosition.x = self.state.initialButtonX + dx;
        self.state.currentPosition.y = self.state.initialButtonY + dy;
      });
    }
  },
  
  // 处理鼠标松开事件
  handleMouseUp: function(e: MouseEvent) {
    const self = FloatingButtonController;
    
    document.removeEventListener('mousemove', self.handleMouseMove);
    document.removeEventListener('mouseup', self.handleMouseUp);
    
    if (self.state.isDragging) {
      button.classList.remove('dragging');
      self.state.isDragging = false;
      
      let finalY = self.state.currentPosition.y;
      let currentXCenter = self.state.currentPosition.x;

      finalY = Math.max(button.offsetHeight / 2, Math.min(window.innerHeight - button.offsetHeight / 2, finalY));

      let finalXCenter: number;
      let intendedToBeOnRight: boolean;

      const determineSnapPosition = () => {
        if (FLOATING_BUTTON_CONFIG.ALWAYS_SNAP_TO_EDGE) {
          if (currentXCenter < window.innerWidth / 2) {
            finalXCenter = FLOATING_BUTTON_CONFIG.EDGE_GAP + button.offsetWidth / 2;
            intendedToBeOnRight = false;
          } else {
            finalXCenter = window.innerWidth - FLOATING_BUTTON_CONFIG.EDGE_GAP - button.offsetWidth / 2;
            intendedToBeOnRight = true;
          }
        } else {
          const snapThreshold = FLOATING_BUTTON_CONFIG.SNAP_THRESHOLD;
          if (currentXCenter - button.offsetWidth / 2 < snapThreshold) {
            finalXCenter = FLOATING_BUTTON_CONFIG.EDGE_GAP + button.offsetWidth / 2;
            intendedToBeOnRight = false;
          } else if (currentXCenter + button.offsetWidth / 2 > window.innerWidth - snapThreshold) {
            finalXCenter = window.innerWidth - FLOATING_BUTTON_CONFIG.EDGE_GAP - button.offsetWidth / 2;
            intendedToBeOnRight = true;
          } else {
            finalXCenter = currentXCenter; 
            intendedToBeOnRight = currentXCenter > window.innerWidth / 2;
          }
        }
      };

      determineSnapPosition();
      self.state.isButtonOnRight = intendedToBeOnRight; // 关键：先确定最终在哪一侧
      
      button.style.transform = ''; // 清除拖拽时的 transform, e.g. translate(dx,dy)
      
      // 调用 setButtonPosition 进行吸附动画
      self.setButtonPosition(finalXCenter, finalY, true, false);
      
      const edge = self.state.isButtonOnRight ? 'right' : 'left';
      const yPercent = Math.round((finalY / window.innerHeight) * 100);
      
      chrome.runtime.sendMessage({
        action: 'saveButtonPosition',
        edge: edge,
        y: yPercent
      });
      
    } // isDragging end
    
    self.state.buttonRect = null;
    if (self.state.animationFrameId) {
      cancelAnimationFrame(self.state.animationFrameId);
      self.state.animationFrameId = null;
    }
    self.state.dragDistance = 0; 
  },
  
  // 处理点击事件
  handleClick(e: MouseEvent) {
    // 只有当不是拖动时才处理点击事件
    if (this.state.dragDistance < FLOATING_BUTTON_CONFIG.DRAG_THRESHOLD && 
        Date.now() - this.state.dragStartTime < FLOATING_BUTTON_CONFIG.CLICK_TIME_THRESHOLD) {
      // 切换面板显示状态
      this.state.isPanelVisible = !this.state.isPanelVisible;
      const isPanelOnLeft = this.state.currentPosition.x > window.innerWidth / 2;
      this.updatePanelPosition(isPanelOnLeft);
    }
  },
  
  // 初始化主题选项
  initThemeOptions() {
    const themeOptions = document.querySelectorAll('.pro-color-theme-option');
    themeOptions.forEach(option => {
      option.addEventListener('click', () => {
        const theme = option.getAttribute('data-theme');
        
        if (theme === 'reset') {
          // 重置主题（移除主题）
          applyTheme(null);
          
          // 通知后台删除当前站点主题设置
          chrome.runtime.sendMessage({
            action: 'removeSiteTheme',
            hostname: window.location.hostname
          });
        } else {
          // 应用主题
          applyTheme(theme as any);
          
          // 通知后台保存设置
          chrome.runtime.sendMessage({
            action: 'saveTheme',
            hostname: window.location.hostname,
            theme
          });
        }
        
        // 关闭面板
        this.state.isPanelVisible = false;
        const isPanelOnLeft = this.state.currentPosition.x > window.innerWidth / 2;
        this.updatePanelPosition(isPanelOnLeft);
      });
    });
  },
  
  // 处理外部点击
  handleOutsideClick(e: MouseEvent) {
    if (this.state.isPanelVisible && 
        !panel.contains(e.target as Node) && 
        !button.contains(e.target as Node)) {
      this.state.isPanelVisible = false;
      const isPanelOnLeft = this.state.currentPosition.x > window.innerWidth / 2;
      this.updatePanelPosition(isPanelOnLeft);
    }
  },
  
  // 处理右键菜单
  handleContextMenu(e: MouseEvent) {
    e.preventDefault();
    // 打开管理页面
    chrome.runtime.sendMessage({ action: 'openOptionsPage' });
  },
  
  // 切换按钮显示/隐藏
  toggleVisibility() {
    // 切换按钮的显示/隐藏状态
    const isButtonVisible = button.style.display !== 'none';
    button.style.display = isButtonVisible ? 'none' : 'flex';
    
    // 如果隐藏按钮，同时也隐藏面板
    if (isButtonVisible) {
      this.state.isPanelVisible = false;
      const isPanelOnLeft = this.state.currentPosition.x > window.innerWidth / 2;
      this.updatePanelPosition(isPanelOnLeft);
    }
  }
}; 