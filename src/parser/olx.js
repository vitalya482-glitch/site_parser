(() => {
  const normalizeUrl = (href) => {
    try {
      const url = new URL(href, location.origin);
      url.hash = "";
      return url.href;
    } catch {
      return href || "";
    }
  };

  const clean = (value) => (value || "").replace(/\s+/g, " ").trim();

  function parseCard(card) {
    const link = card.querySelector('a[href*="/d/obyavlenie/"]') || card.querySelector('a[href*="/d/ogloszenie/"]');
    if (!link) return null;

    const titleNode =
      card.querySelector('[data-cy="ad-card-title"]') ||
      card.querySelector('h4') ||
      card.querySelector('h6') ||
      link;

    const priceNode =
      card.querySelector('[data-testid="ad-price"]') ||
      [...card.querySelectorAll('p, span')].find((node) => /₸|тг|тенге/i.test(node.textContent || ""));

    const title = clean(titleNode.textContent);
    const price = clean(priceNode?.textContent);
    const url = normalizeUrl(link.href);

    if (!title || !url) return null;

    return { title, price, url };
  }

  function parseSearchPage() {
    const selectors = [
      '[data-cy="l-card"]',
      '[data-testid="l-card"]',
      'div[data-cy="l-card"]'
    ];

    let cards = [];
    for (const selector of selectors) {
      cards = [...document.querySelectorAll(selector)];
      if (cards.length) break;
    }

    // Fallback: OLX periodically changes card wrappers. Group known ad links by a nearby container.
    if (!cards.length) {
      const links = [...document.querySelectorAll('a[href*="/d/obyavlenie/"], a[href*="/d/ogloszenie/"]')];
      cards = links.map((link) => link.closest('article, li, [data-cy], div')).filter(Boolean);
    }

    const seen = new Set();
    const results = [];
    for (const card of cards) {
      const item = parseCard(card);
      if (!item || seen.has(item.url)) continue;
      seen.add(item.url);
      results.push(item);
    }

    return results;
  }

  globalThis.SiteParserOLX = { parseSearchPage };
})();