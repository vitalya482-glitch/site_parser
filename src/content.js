chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "SITE_PARSER_SCAN_PAGE") return;

  try {
    const items = globalThis.SiteParserOLX?.parseSearchPage?.() || [];
    sendResponse({ ok: true, items, pageUrl: location.href });
  } catch (error) {
    sendResponse({ ok: false, error: error?.message || String(error) });
  }
});