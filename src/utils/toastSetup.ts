import { Toast } from 'toastify-react-native';
import { getMappedErrorMessage } from './getMappedErrorMessage';

let isPatched = false;

/**
 * Global Interceptor for `toastify-react-native` Toast static methods.
 * Ensures all toast messages (success, error, info, warn, show) are automatically
 * mapped and translated according to the current app language (Arabic/English).
 */
export const setupGlobalToast = () => {
  if (isPatched) return;
  isPatched = true;

  const originalSuccess = Toast.success;
  const originalError = Toast.error;
  const originalInfo = Toast.info;
  const originalWarn = Toast.warn;
  const originalShow = Toast.show;

  Toast.success = (text: string, ...args: any[]) => {
    const mapped = getMappedErrorMessage(text);
    return originalSuccess(mapped, ...args);
  };

  Toast.error = (text: string, ...args: any[]) => {
    const mapped = getMappedErrorMessage(text);
    return originalError(mapped, ...args);
  };

  Toast.info = (text: string, ...args: any[]) => {
    const mapped = getMappedErrorMessage(text);
    return originalInfo(mapped, ...args);
  };

  Toast.warn = (text: string, ...args: any[]) => {
    const mapped = getMappedErrorMessage(text);
    return originalWarn(mapped, ...args);
  };

  Toast.show = (options: any) => {
    if (options && typeof options === 'object') {
      const newOpts = { ...options };
      if (newOpts.text1) {
        newOpts.text1 = getMappedErrorMessage(newOpts.text1);
      }
      if (newOpts.text2) {
        newOpts.text2 = getMappedErrorMessage(newOpts.text2);
      }
      return originalShow(newOpts);
    }
    return originalShow(options);
  };
};
