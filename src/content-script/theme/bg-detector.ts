/**
 * 标记所有带背景图的元素
 */
export const markBackgroundImages = () => {
  console.log('开始检测背景图片元素');
  
  // 使用高效的选择器直接查找可能有背景图的元素
  const potentialBgElements = document.querySelectorAll(
    '[style*="background"],' +
    '[style*="url("],' +
    '[data-bg],' +
    '[data-background],' +
    '[data-background-image],' +
    '[data-src],' +
    '[class*="bg-"],' +
    '[class*="background"],' +
    '[class*="banner"],' +
    '[class*="cover"],' +
    '[class*="header"],' +
    '[class*="hero"],' +
    '[class*="slider"],' +
    '[class*="carousel"],' +
    '[class*="image"],' +
    '[class*="img"],' +
    '[class*="logo"],' +
    '[class*="icon"],' +
    '[class*="thumbnail"],' +
    '[class*="avatar"],' +
    '[id*="bg-"],' +
    '[id*="background"],' +
    '[id*="banner"],' +
    '[id*="image"],' +
    '[id*="logo"],' +
    '.bg,' +
    '.background,' +
    '.banner,' +
    '.image,' +
    '.img,' +
    '.logo,' +
    '.icon,' +
    '.cover,' +
    '.header,' +
    '.hero,' +
    '.slider,' +
    '.carousel,' +
    '.avatar,' +
    '.thumbnail'
  );
  
  // 处理找到的元素
  console.log(`找到 ${potentialBgElements.length} 个可能有背景图的元素`);
  potentialBgElements.forEach(element => {
    if (element instanceof HTMLElement) {
      try {
        // 添加标记类
        element.classList.add('has-bg-image');
        
        // 检查伪元素
        checkPseudoElementBackground(element);
      } catch (error) {
        // 忽略错误
      }
    }
  });
  
  // 再次检查所有元素的computed style
  const allElements = document.querySelectorAll('*');
  console.log(`检查所有 ${allElements.length} 个元素的计算样式`);
  
  // 分批处理以避免性能问题
  const BATCH_SIZE = 500;
  processBatch(0, allElements, BATCH_SIZE);
};

/**
 * 分批处理元素背景检测
 */
const processBatch = (startIndex: number, allElements: NodeListOf<Element>, BATCH_SIZE: number) => {
  const endIndex = Math.min(startIndex + BATCH_SIZE, allElements.length);
  
  for (let i = startIndex; i < endIndex; i++) {
    const element = allElements[i];
    if (element instanceof HTMLElement && !element.classList.contains('has-bg-image')) {
      try {
        // 获取计算样式
        const style = window.getComputedStyle(element);
        const bgImage = style.backgroundImage;
        
        // 检查是否有背景图片
        if (bgImage && 
            bgImage !== 'none' && 
            !bgImage.includes('linear-gradient') &&
            bgImage.includes('url(')) {
          element.classList.add('has-bg-image');
          continue;
        }
        
        // 检查style属性
        const styleAttr = element.getAttribute('style');
        if (styleAttr && (
          styleAttr.includes('background-image') || 
          styleAttr.includes('background:') || 
          styleAttr.includes('background-image:') ||
          styleAttr.includes('url(')
        )) {
          element.classList.add('has-bg-image');
          continue;
        }
        
        // 检查class和id
        const className = element.className;
        const id = element.id;
        
        if ((className && (
            className.includes('bg-') || 
            className.includes('background') || 
            className.includes('image') ||
            className.includes('banner') ||
            className.includes('logo') ||
            className.includes('header') ||
            className.includes('cover'))) ||
            (id && (
            id.includes('bg-') || 
            id.includes('background') || 
            id.includes('image') ||
            id.includes('banner') ||
            id.includes('logo')
          ))
        ) {
          element.classList.add('has-bg-image');
          continue;
        }
        
        // 检查伪元素
        checkPseudoElementBackground(element);
        
      } catch (error) {
        // 忽略错误
      }
    }
  }
  
  // 处理下一批
  if (endIndex < allElements.length) {
    setTimeout(() => processBatch(endIndex, allElements, BATCH_SIZE), 0);
  } else {
    console.log('背景图片检测完成');
  }
};

/**
 * 检查元素的伪元素是否有背景图
 */
export const checkPseudoElementBackground = (element: HTMLElement) => {
  try {
    // 检查:before伪元素
    const beforeStyle = window.getComputedStyle(element, ':before');
    const beforeBg = beforeStyle.backgroundImage;
    
    if (beforeBg && beforeBg !== 'none' && !beforeBg.includes('linear-gradient') && beforeBg.includes('url(')) {
      element.classList.add('has-bg-image');
      element.setAttribute('data-has-pseudo-bg', 'true');
      return;
    }
    
    // 检查:after伪元素
    const afterStyle = window.getComputedStyle(element, ':after');
    const afterBg = afterStyle.backgroundImage;
    
    if (afterBg && afterBg !== 'none' && !afterBg.includes('linear-gradient') && afterBg.includes('url(')) {
      element.classList.add('has-bg-image');
      element.setAttribute('data-has-pseudo-bg', 'true');
      return;
    }
  } catch (error) {
    // 忽略错误
  }
}; 