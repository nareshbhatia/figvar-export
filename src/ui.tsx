import {
  Button,
  Columns,
  Container,
  render,
  VerticalSpace,
  Text,
} from '@create-figma-plugin/ui';
import { emit, on } from '@create-figma-plugin/utilities';
import { h } from 'preact';
import { useCallback, useEffect } from 'preact/hooks';
import {
  CloseHandler,
  DesignTokensFile,
  GetTokensResponseHandler,
  GetTokensRequestHandler,
} from './types';
import { createZipFile } from './utils';

function Plugin() {
  useEffect(() => {
    on<GetTokensResponseHandler>(
      'GET_TOKENS_RESPONSE',
      handleGetTokensResponse,
    );
  }, []);

  const handleExportButtonClick = useCallback(function () {
    emit<GetTokensRequestHandler>('GET_TOKENS_REQUEST');
  }, []);

  const handleCloseButtonClick = useCallback(function () {
    emit<CloseHandler>('CLOSE');
  }, []);

  const handleGetTokensResponse = useCallback(async function (
    files: DesignTokensFile[],
  ) {
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
  }, []);

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
