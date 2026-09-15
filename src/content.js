chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  try {
    if (message?.type === "SITE_PARSER_SCAN_PAGE") {
      const items = globalThis.SiteParserOLX?.parseSearchPage?.() || [];
      sendResponse({ ok: true, items, pageUrl: location.href });
      return;
    }

    if (message?.type === "SITE_PARSER_GET_DESCRIPTION") {
      const selectors = [
        '[data-cy="ad_description"]',
        '[data-testid="ad-description"]',
        '#textContent',
        'div[data-cy="ad_description"]'
      ];
      let description = '';
      for (const selector of selectors) {
        const node = document.querySelector(selector);
        if (node?.textContent?.trim()) { description = node.textContent.replace(/\s+/g, ' ').trim(); break; }
      }
      if (!description) {
        const headings = [...document.querySelectorAll('h2,h3,h4')];
        const heading = headings.find(h => /описание|сипаттама|description/i.test(h.textContent || ''));
        const container = heading?.parentElement;
        if (container) description = (container.textContent || '').replace(/\s+/g, ' ').trim();
      }
      sendResponse({ ok: true, description, pageUrl: location.href });
    }
  } catch (error) {
    sendResponse({ ok: false, error: error?.message || String(error) });
  }
});