import type {
  CloseHandler,
  DesignToken,
  DesignTokens,
  DesignTokensFile,
  GetTokensRequestHandler,
  GetTokensResponseHandler,
  RGBColor,
} from './types';
import { rgbToHex, FigmaToW3cTokenType, toKebabCase } from './utils';
import { emit, on, once, showUI } from '@create-figma-plugin/utilities';

function isVariableAlias(value: unknown): value is VariableAlias {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    value.type === 'VARIABLE_ALIAS'
  );
}

async function processCollection({
  name,
  modes,
  variableIds,
}: VariableCollection) {
  const files: DesignTokensFile[] = [];

  const modeCount = modes.length;
  for (const mode of modes) {
    const fileName =
      modeCount > 1
        ? `${toKebabCase(name)}.${toKebabCase(mode.name)}.tokens.json`
        : `${toKebabCase(name)}.tokens.json`;
    const file: DesignTokensFile = { fileName, body: {} };

    // Process each variable
    for (const variableId of variableIds) {
      const variable = await figma.variables.getVariableByIdAsync(variableId);
      if (variable === undefined || variable === null) continue;

      const { name, resolvedType, valuesByMode } = variable;
      const value = valuesByMode[mode.modeId];
      if (value === undefined || value === null) continue;

      // Traverse the token path, creating nested objects as needed
      let obj: DesignTokens = file.body;
      name.split('/').forEach((groupName) => {
        if (obj[groupName] === undefined) {
          obj[groupName] = {};
        }
        obj = obj[groupName] as DesignTokens;
      });

      const token = obj as unknown as DesignToken;

      // Set the type of token
      token.$type = FigmaToW3cTokenType[resolvedType];

      // Now set the value of the token, first handling aliases
      if (isVariableAlias(value)) {
        const currentVar = await figma.variables.getVariableByIdAsync(value.id);
        if (currentVar) {
          token.$value = `{${currentVar.name.replace(/\//g, '.')}}`;
        }
        continue;
      }

      // Handle other token types
      switch (resolvedType) {
        case 'COLOR':
          token.$value = rgbToHex(value as RGBColor);
          break;
        case 'FLOAT':
        case 'BOOLEAN':
        case 'STRING':
          token.$value = value as string;
          break;
      }
    }

    // Save the file
    files.push(file);
  }

  // Return all the files
  return files;
}

async function handleGetTokensRequest() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync();
  const files: DesignTokensFile[] = [];
  for (const collection of collections) {
    files.push(...(await processCollection(collection)));
  }
  return files;
}

export default function () {
  on<GetTokensRequestHandler>('GET_TOKENS_REQUEST', async () => {
    const files = await handleGetTokensRequest();
    emit<GetTokensResponseHandler>('GET_TOKENS_RESPONSE', files);
  });

  once<CloseHandler>('CLOSE', () => {
    figma.closePlugin();
  });

  showUI({
    height: 80,
    width: 240,
  });
}
