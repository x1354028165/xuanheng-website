declare module 'opencc-js' {
  interface ConverterOptions {
    from: 'cn' | 'tw' | 'twp' | 'hk' | 'jp' | 'kr';
    to: 'cn' | 'tw' | 'twp' | 'hk' | 'jp' | 'kr';
  }
  function Converter(options: ConverterOptions): (text: string) => string;
  export default { Converter };
}
