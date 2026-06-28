import { apiClient, clearAuth, ApiError } from '../shared/api-client.js';
import type { PopupToBackgroundMessage, SaveProgressMessage } from '../shared/messages.js';

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message: PopupToBackgroundMessage, _sender, sendResponse) => {
  if (message.type === 'CHECK_URL') {
    handleCheckUrl(message.payload.url).then(sendResponse);
    return true;
  }

  if (message.type === 'SAVE_ARTICLE') {
    handleSaveArticle(message).then(sendResponse);
    return true;
  }

  return false;
});

async function handleCheckUrl(url: string) {
  try {
    return await apiClient.checkUrl(url);
  } catch {
    return { exists: false };
  }
}

async function handleSaveArticle(
  message: Extract<PopupToBackgroundMessage, { type: 'SAVE_ARTICLE' }>,
): Promise<SaveProgressMessage['payload']> {
  try {
    // Step 1: Ask contetn script to extract page HTML
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!activeTab?.id) {
      return { stage: 'ERROR', errorCode: 'NO_ACTIVE_TAB' };
    }

    const extractResponse = await chrome.tabs.sendMessage(activeTab.id, {
      type: 'EXTRACT_CONTENT',
    });

    const html = extractResponse?.payload?.html ?? undefined;

    // Step 2: Call quick-save API
    const result = await apiClient.quickSave({
      url: message.payload.url,
      title: extractResponse?.payload?.title ?? message.payload.title, // content script title > tab title
      html,
      selection: message.payload.selection,
    });

    const isDuplicate = result.status !== 'PENDING';
    return isDuplicate
      ? { stage: 'DUPLICATE', articleId: result.articleId, status: result.status }
      : { stage: 'SAVED', articleId: result.articleId, status: result.status };
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      await clearAuth();
      return { stage: 'ERROR', errorCode: 'UNAUTHORIZED' };
    }
    return { stage: 'ERROR', errorCode: 'SAVE_FAILED' };
  }
}
