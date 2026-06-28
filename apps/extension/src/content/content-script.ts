import { Readability } from '@mozilla/readability';
import type { BackgroundToContentMessage, ContentExtractedMessage } from '../shared/messages.js';

chrome.runtime.onMessage.addListener(
  (
    message: BackgroundToContentMessage,
    _sender,
    sendResponse: (response: ContentExtractedMessage) => void,
  ) => {
    if (message.type !== 'EXTRACT_CONTENT') return false;

    const documentClone = document.cloneNode(true) as Document;
    const reader = new Readability(documentClone);
    const parsed = reader.parse();

    sendResponse({
      type: 'CONTENT_EXTRACTED',
      payload: {
        title: parsed?.title ?? document.title,
        html: parsed?.content ?? document.body.innerHTML,
        url: window.location.href,
      },
    });

    return true; // keep message chanel open for async sendResponse
  },
);
