import type {
  CloseHandler,
  DesignTokensFile,
  GetTokensResponseHandler,
  GetTokensRequestHandler,
} from './types';
import { createZipFile } from './utils';
import {
  Button,
  Columns,
  Container,
  render,
  VerticalSpace,
} from '@create-figma-plugin/ui';
import { emit, on } from '@create-figma-plugin/utilities';
// `h` is required to be in scope for preact
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { h } from 'preact';
import { useCallback, useEffect } from 'preact/hooks';

function Plugin() {
  const handleExportButtonClick = useCallback(() => {
    emit<GetTokensRequestHandler>('GET_TOKENS_REQUEST');
  }, []);

  const handleCloseButtonClick = useCallback(() => {
    emit<CloseHandler>('CLOSE');
  }, []);

  const handleGetTokensResponse = useCallback(
    async (files: DesignTokensFile[]) => {
      // Create a zip file
      const url = await createZipFile(files);

      // Create a link element
      const link = document.createElement('a');
      link.href = url;
      link.download = 'figma-tokens.zip';
      link.style.display = 'none';

      // Append to the document
      document.body.appendChild(link);

      // Trigger the download
      link.click();

      // Clean up
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    [],
  );

  useEffect(() => {
    on<GetTokensResponseHandler>(
      'GET_TOKENS_RESPONSE',
      handleGetTokensResponse,
    );
  }, [handleGetTokensResponse]);

  return (
    <Container space="medium">
      <VerticalSpace space="extraLarge" />
      <Columns space="extraSmall">
        <Button fullWidth onClick={handleExportButtonClick}>
          Export
        </Button>
        <Button fullWidth onClick={handleCloseButtonClick} secondary>
          Close
        </Button>
      </Columns>
      <VerticalSpace space="extraLarge" />
    </Container>
  );
}

export default render(Plugin);
