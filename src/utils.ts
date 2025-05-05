import type { RGBColor, DesignTokensFile } from './types';
// importing from just 'jszip' gives this esbuild error: Could not resolve "jszip"
import JSZip from 'jszip/dist/jszip.min';

export const FigmaToW3cTokenType: { [K in VariableResolvedDataType]: string } =
  {
    BOOLEAN: 'boolean',
    COLOR: 'color',
    FLOAT: 'number',
    STRING: 'string',
  } as const;

export function rgbToHex({ r, g, b, a }: RGBColor) {
  if (a !== 1) {
    return `rgba(${[r, g, b]
      .map((n) => Math.round(n * 255))
      .join(', ')}, ${a.toFixed(4)})`;
  }
  const toHex = (value: number) => {
    const hex = Math.round(value * 255).toString(16);
    return hex.length === 1 ? `0${hex}` : hex;
  };

  const hex = [toHex(r), toHex(g), toHex(b)].join('');
  return `#${hex}`;
}

export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

export async function createZipFile(files: DesignTokensFile[]) {
  // Create a new JSZip instance
  const zip = new JSZip();

  for (const file of files) {
    // eslint-disable-next-line no-restricted-syntax
    zip.file(file.fileName, `${JSON.stringify(file.body, null, 2)}\n`);
  }

  // Generate the zip file
  const content = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: {
      level: 9,
    },
  });

  // Return a download link
  return URL.createObjectURL(content);
}
