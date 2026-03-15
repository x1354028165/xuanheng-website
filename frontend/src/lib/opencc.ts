import OpenCC from 'opencc-js';

// Global singleton - IRON LAW: never instantiate inside components
const twConverter = OpenCC.Converter({ from: 'cn', to: 'twp' });

export { twConverter };

export function convertToTW(text: string): string {
  return twConverter(text);
}
