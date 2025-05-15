// 继承自主类型文件
import { ThemeName } from '../../types';

// 按钮控制器状态接口
export interface ButtonControllerState {
  isDragging: boolean;
  isPanelVisible: boolean;
  isButtonOnRight: boolean;
  dragStartTime: number;
  initialMouseX: number;
  initialMouseY: number;
  initialButtonX: number;
  initialButtonY: number;
  buttonRect: DOMRect | null;
  dragDistance: number;
  animationFrameId: number | null;
  currentPosition: {
    x: number;
    y: number;
  };
}

// 导出继承的类型
export type { ThemeName }; 