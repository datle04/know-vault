// Message types flowing through the extension
// popup -> background -> content script (and response back)

export type MessageType =
  | 'EXTRACT_CONTENT'
  | 'CONTENT_EXTRACRTED'
  | 'SAVE_ARTICLE'
  | 'SAVE_PROGRESS'
  | 'CHECK_URL'
  | 'CHECK_URL_RESULT';

// Content script extracts page content on request
export interface ExtractContentMessage {
  type: 'EXTRACT_CONTENT';
}

export interface ContentExtractedMessage {
  type: 'CONTENT_EXTRACTED';
  payload: {
    title: string;
    html: string;
    url: string;
    selection?: string;
  };
}

// Popup triggers a save
export interface SaveArticleMessage {
  type: 'SAVE_ARTICLE';
  payload: {
    url: string;
    title: string;
    html: string;
    selection?: string;
  };
}

// Background reports progress back to popup
export interface SaveProgressMessage {
  type: 'SAVE_PROGRESS';
  payload:
    | { stage: 'SAVING' }
    | { stage: 'SAVED'; articleId: string; status: string }
    | { stage: 'DUPLICATE'; articleId: string; status: string }
    | { stage: 'ERROR'; errorCode: string };
}

// Popup ask: has this URL been saved before?
export interface CheckUrlMessage {
  type: 'CHECK_URL';
  payload: { url: string };
}

export interface CheckUrlResultMessage {
  type: 'CHECK_URL_RESULT';
  payload: { exists: boolean; articleId?: string; status?: string };
}

// Union of all messages going popup -> background
export type PopupToBackgroundMessage = SaveArticleMessage | CheckUrlMessage;

// Union of all messages going background -> content script
export type BackgroundToContentMessage = ExtractContentMessage;

// What background sends back to popup (via chrome.runtime.sendMessage response)
export type BackgroundToPopupMessage = SaveProgressMessage | CheckUrlResultMessage;
