/** 触感反馈（Web Vibrate，仅在支持的环境生效） */
export const haptic = {
  tap: () => {
    try {
      navigator.vibrate?.(8);
    } catch {
      /* 忽略 */
    }
  },
  stamp: () => {
    try {
      navigator.vibrate?.([12, 40, 18]);
    } catch {
      /* 忽略 */
    }
  },
};
