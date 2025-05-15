/**
 * 添加网站标识
 */
export const addSiteIdentification = (hostname: string) => {
  const html = document.documentElement;
  let siteType = '';
  
  if (hostname.includes('baidu.com')) {
    siteType = 'baidu';
  } else if (hostname.includes('bing.com')) {
    siteType = 'bing';
  } else if (hostname.includes('google.com')) {
    siteType = 'google';
  } else if (hostname.includes('github.com')) {
    siteType = 'github';
  } else if (hostname.includes('youtube.com')) {
    siteType = 'youtube';
  }
  
  // 设置网站标识
  if (siteType) {
    html.setAttribute('data-site', siteType);
  } else {
    html.removeAttribute('data-site');
  }
};

/**
 * 处理页面所有元素，检查背景图片
 */
export const processBgImageElements = () => {
  // 获取所有元素
  const allElements = document.querySelectorAll('*');
  
  // 检查每个元素的背景图片
  allElements.forEach(element => {
    if (element instanceof HTMLElement) {
      const computedStyle = window.getComputedStyle(element);
      const bgImage = computedStyle.backgroundImage;
      
      // 如果有背景图片且不是none，标记为有背景图片的元素
      if (bgImage && bgImage !== 'none' && !bgImage.includes('linear-gradient')) {
        element.classList.add('has-bg-image');
      }
    }
  });
}; 