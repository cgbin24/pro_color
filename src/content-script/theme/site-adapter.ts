import { ThemeName } from '../types';
import { addSiteIdentification } from '../utils/dom-utils';

/**
 * 处理特定网站的元素
 */
export const processSpecificElements = (themeName: ThemeName) => {
  const hostname = window.location.hostname;
  
  // 添加网站标识
  addSiteIdentification(hostname);
  
  // 百度网站特殊处理
  if (hostname.includes('baidu.com')) {
    processBaiduElements(themeName);
  }
  // 可以添加更多网站的特殊处理
  // ...
};

/**
 * 处理百度网站的特定元素
 */
export const processBaiduElements = (themeName: ThemeName) => {
  // 保留原始搜索框样式
  const searchBox = document.querySelector('.s_form');
  if (searchBox && searchBox instanceof HTMLElement) {
    searchBox.classList.add('pro-color-preserved');
  }
  
  // 保留结果区域内图片和标志
  const resultArea = document.getElementById('content_left');
  if (resultArea) {
    const images = resultArea.querySelectorAll('img');
    images.forEach(img => {
      img.classList.add('pro-color-preserved');
      const parent = img.parentElement;
      if (parent) {
        parent.classList.add('pro-color-preserved');
      }
    });
    
    // 保留搜索结果的标题链接颜色
    const titleLinks = resultArea.querySelectorAll('.c-title a');
    titleLinks.forEach(link => {
      if (link instanceof HTMLElement) {
        link.style.setProperty('color', '#2440b3', 'important');
        link.classList.add('pro-color-preserved');
      }
    });
  }
  
  // 处理顶部导航栏
  const navs = document.querySelectorAll('.s-top-nav-tab-item');
  navs.forEach(nav => {
    if (nav instanceof HTMLElement) {
      nav.style.backgroundColor = 'transparent';
      nav.classList.add('pro-color-preserved');
    }
  });
}; 