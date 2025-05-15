import { ThemeName } from '../types';
import { DEFAULT_THEMES } from '../../types';
import { checkPseudoElementBackground } from '../theme/bg-detector';

// 保存全局MutationObserver的引用，以便可以断开
let globalObserver: MutationObserver | null = null;

/**
 * 创建DOM监听器以处理动态内容
 */
export const createDomObserver = () => {
  // 如果已存在观察器，先断开
  if (globalObserver) {
    globalObserver.disconnect();
    globalObserver = null;
  }
  
  // 获取当前主题
  const getCurrentTheme = () => {
    const html = document.documentElement;
    
    // 首先检查是否有主题应用标记
    if (!html.classList.contains('pro-color-theme-applied')) {
      return null;
    }
    
    // 然后查找具体是哪个主题
    for (const theme of DEFAULT_THEMES) {
      if (html.classList.contains(theme.id)) {
        return theme.id;
      }
    }
    return null;
  };
  
  // 检查元素是否应该被排除(不应用主题)
  const shouldExcludeElement = (element: Element): boolean => {
    // 排除插件自身的元素
    if (element.id && element.id.includes('pro-color')) return true;
    if (element.classList && [...element.classList].some(cls => cls.includes('pro-color'))) return true;
    
    // 排除特定类型的元素
    const tagName = element.tagName.toLowerCase();
    if (['img', 'video', 'canvas', 'svg', 'iframe', 'embed', 'object'].includes(tagName)) return true;
    
    // 排除特定角色的元素
    if (element.getAttribute('role') === 'img') return true;
    if (element.getAttribute('aria-hidden') === 'true') return true;
    
    // 检查元素是否有背景图片
    if (element instanceof HTMLElement) {
      const computedStyle = window.getComputedStyle(element);
      const bgImage = computedStyle.backgroundImage;
      
      // 如果有背景图片且不是none，标记为有背景图片的元素并排除
      if (bgImage && bgImage !== 'none' && !bgImage.includes('linear-gradient')) {
        element.classList.add('has-bg-image');
        return true;
      }
    }
    
    // 排除可能包含logo的元素
    if (element.className && (
      element.className.includes('logo') || 
      element.className.includes('icon') || 
      element.className.includes('avatar')
    )) return true;
    
    // 排除广告相关元素
    if (element.id && (
      element.id.includes('ad') || 
      element.id.includes('banner') || 
      element.id.includes('promotion')
    )) return true;
    
    if (element.className && (
      element.className.includes('ad') || 
      element.className.includes('banner') || 
      element.className.includes('promotion') ||
      element.className.includes('sponsor')
    )) return true;
    
    // 排除已处理元素
    if (element.classList.contains('pro-color-processed') || 
        element.classList.contains('pro-color-preserved')) {
      return true;
    }
    
    // 排除特定网站元素
    if (window.location.hostname.includes('baidu.com')) {
      // 百度特定元素
      if (element.id === 's_form' || element.id === 'result' || 
          element.id === 'content_right' || // 右侧广告区域
          element.className.includes('s_ipt_wr') || 
          element.className.includes('s_btn_wr') ||
          element.className.includes('s-top-nav')) {
        return true;
      }
      
      // 百度图片和图标
      if (tagName === 'img' || element.querySelector('img')) return true;
      
      // 百度搜索按钮和工具栏
      if (element.className && (
        element.className.includes('btn') || 
        element.className.includes('tool') ||
        element.className.includes('tabs') ||
        element.className.includes('c-title')
      )) {
        return true;
      }
    }
    
    // 检查是否为插件UI元素 - 更安全的检查方式
    if (element.id && typeof element.id.includes === 'function' && element.id.includes('pro-color')) return true;
    if (element.classList && 
        (element.classList.contains('pro-color-ui') || 
         element.classList.contains('pro-color-protected'))) return true;
    
    return false;
  };
  
  // 应用主题到单个元素
  const applyThemeToElement = (element: Element, themeName: ThemeName) => {
    // 如果元素应该被排除，则不应用主题
    if (shouldExcludeElement(element)) return;
    
    try {
      // 添加类以标记此元素已处理
      element.classList.add('pro-color-processed');
      
      // 转换为HTMLElement以访问style属性
      if (element instanceof HTMLElement) {
        // 再次检查背景图片
        const computedStyle = window.getComputedStyle(element);
        if (computedStyle.backgroundImage && 
            computedStyle.backgroundImage !== 'none' && 
            !computedStyle.backgroundImage.includes('linear-gradient')) {
          element.classList.add('has-bg-image');
          return; // 有背景图片，不应用主题
        }
        
        // 再次检查是否为插件UI元素
        if (element.id && element.id.includes('pro-color')) return;
        if (element.className && element.className.includes('pro-color')) return;
        
        // 应用主题样式
        if (window.getComputedStyle(element).backgroundColor !== 'rgba(0, 0, 0, 0)' && 
            !element.style.backgroundColor.includes('var(--bg-color)')) {
          element.style.setProperty('background-color', 'var(--bg-color)', 'important');
        }
        
        if (window.getComputedStyle(element).color !== 'rgba(0, 0, 0, 0)' && 
            !element.style.color.includes('var(--text-color)')) {
          element.style.setProperty('color', 'var(--text-color)', 'important');
        }
        
        // 处理边框颜色
        if (window.getComputedStyle(element).borderColor !== 'rgba(0, 0, 0, 0)' && 
            !element.style.borderColor.includes('var(--border-color)')) {
          element.style.setProperty('border-color', 'var(--border-color)', 'important');
        }
        
        // 如果是链接元素，应用链接颜色
        if (element.tagName.toLowerCase() === 'a' && 
            !element.style.color.includes('var(--link-color)')) {
          element.style.setProperty('color', 'var(--link-color)', 'important');
        }
      }
    } catch (error) {
      // 忽略处理错误
      console.debug('Pro Color: 元素样式应用错误', error);
    }
  };
  
  // 创建MutationObserver
  const observer = new MutationObserver((mutations) => {
    const currentTheme = getCurrentTheme();
    
    // 如果没有激活的主题，不做任何处理
    if (!currentTheme) return;
    
    // 处理添加的节点
    mutations.forEach(mutation => {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        const newElements = new Set<Element>();
        
        // 收集所有新添加的元素
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            newElements.add(element);
            
            // 收集子元素
            element.querySelectorAll('*').forEach(child => {
              newElements.add(child);
            });
          }
        });
        
        // 检查可能具有背景图的元素
        const bgCandidates = Array.from(newElements).filter(el => {
          // 检查是否可能有背景图的元素
          if (!(el instanceof HTMLElement)) return false;
          
          const tagName = el.tagName.toLowerCase();
          if (['img', 'video', 'canvas', 'svg', 'iframe'].includes(tagName)) {
            return false;
          }
          
          // 检查样式属性
          const styleAttr = el.getAttribute('style');
          if (styleAttr && (
            styleAttr.includes('background') ||
            styleAttr.includes('url(')
          )) {
            return true;
          }
          
          // 检查类名和ID
          const className = el.className;
          const id = el.id;
          
          if ((className && (
            className.includes('bg-') ||
            className.includes('background') ||
            className.includes('image') ||
            className.includes('banner') ||
            className.includes('cover') ||
            className.includes('header') ||
            className.includes('logo') ||
            className.includes('icon') ||
            className.includes('carousel') ||
            className.includes('slider') ||
            className.includes('thumbnail') ||
            className.includes('avatar')
          )) || (id && (
            id.includes('bg-') ||
            id.includes('background') ||
            id.includes('image') ||
            id.includes('banner') ||
            id.includes('logo') ||
            id.includes('icon')
          ))) {
            return true;
          }
          
          // 检查是否有data属性表明可能有背景图
          if (el.hasAttribute('data-bg') ||
              el.hasAttribute('data-background') ||
              el.hasAttribute('data-background-image') ||
              el.hasAttribute('data-src')) {
            return true;
          }
          
          return false;
        });
        
        // 标记可能有背景图的元素
        bgCandidates.forEach(element => {
          if (element instanceof HTMLElement) {
            // 添加标记类
            element.classList.add('has-bg-image');
            
            // 检查伪元素
            try {
              // 检查:before伪元素
              const beforeStyle = window.getComputedStyle(element, ':before');
              if (beforeStyle.backgroundImage && 
                  beforeStyle.backgroundImage !== 'none' && 
                  beforeStyle.backgroundImage.includes('url(')) {
                element.setAttribute('data-has-pseudo-bg', 'true');
              }
              
              // 检查:after伪元素
              const afterStyle = window.getComputedStyle(element, ':after');
              if (afterStyle.backgroundImage && 
                  afterStyle.backgroundImage !== 'none' && 
                  afterStyle.backgroundImage.includes('url(')) {
                element.setAttribute('data-has-pseudo-bg', 'true');
              }
            } catch (e) {
              // 忽略错误
            }
          }
        });
        
        // 对剩余元素应用主题
        newElements.forEach(element => {
          // 排除已标记的背景图元素
          if (element.classList.contains('has-bg-image')) return;
          
          // 排除插件UI元素 (更精确的判断)
          if (element.classList?.contains('pro-color-ui') || element.classList?.contains('pro-color-protected')) {
            return;
          }
          
          // 排除其他应该排除的元素
          if (shouldExcludeElement(element)) return;
          
          // 应用主题
          if (!element.classList.contains('pro-color-processed')) {
            applyThemeToElement(element, currentTheme as ThemeName);
          }
        });
      }
    });
    
    // 最后再次确保UI元素保护
    import('../utils/protection').then(({ protectUIElements }) => {
      protectUIElements();
    });
  });
  
  // 配置观察器
  observer.observe(document.body, {
    childList: true,
    subtree: true,
    attributes: false, // 不观察属性变化，减少不必要的触发
  });
  
  // 保存全局引用
  globalObserver = observer;
  
  return observer;
};

/**
 * 断开DOM观察器
 */
export const disconnectDomObserver = () => {
  if (globalObserver) {
    globalObserver.disconnect();
    globalObserver = null;
    console.log('DOM观察器已断开');
  }
}; 