import { EventHandler } from '@create-figma-plugin/utilities';

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

// For aliases in string format like "{color.primary}"
export type DesignTokenReference = string;

// A single token
export interface DesignToken {
  $type: string;
  $value: string | number | boolean | DesignTokenReference;
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
