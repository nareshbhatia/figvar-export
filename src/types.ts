import type { EventHandler } from '@create-figma-plugin/utilities';

// A single token
export interface DesignToken {
  /*
   * Types in Figma: BOOLEAN, COLOR, FLOAT, STRING
   * Types in output: boolean, color, number, string
   */
  $type: string;

  // Alias values are formatted as strings like "{color.primary}"
  $value: boolean | number | string;
}

// Collection of tokens
export interface DesignTokens {
  [key: string]: DesignToken | DesignTokens; // Tokens can be nested
}

// A design tokens file
export interface DesignTokensFile {
  fileName: string;
  body: DesignTokens;
}

export interface RGBColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface GetTokensRequestHandler extends EventHandler {
  name: 'GET_TOKENS_REQUEST';
  handler: () => void;
}

export interface GetTokensResponseHandler extends EventHandler {
  name: 'GET_TOKENS_RESPONSE';
  handler: (files: DesignTokensFile[]) => void;
}

export interface CloseHandler extends EventHandler {
  name: 'CLOSE';
  handler: () => void;
}
