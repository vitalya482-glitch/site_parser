const scanButton = document.querySelector('#scan');
const statusNode = document.querySelector('#status');
const countNode = document.querySelector('#count');
const resultsNode = document.querySelector('#results');

function render(items) {
  resultsNode.replaceChildren();
  for (const item of items) {
    const row = document.createElement('tr');

    const title = document.createElement('td');
    title.textContent = item.title;

    const price = document.createElement('td');
    price.textContent = item.price || '—';

    const linkCell = document.createElement('td');
    const link = document.createElement('a');
    link.href = item.url;
    link.target = '_blank';
    link.rel = 'noreferrer';
    link.textContent = 'Открыть';
    linkCell.append(link);

    row.append(title, price, linkCell);
    resultsNode.append(row);
  }
}

async function findOlxTab() {
  const tabs = await chrome.tabs.query({});
  return tabs.find((tab) => /^https:\/\/(www\.)?olx\.kz\//i.test(tab.url || ''));
}

scanButton.addEventListener('click', async () => {
  scanButton.disabled = true;
  statusNode.textContent = 'Сканирую открытую страницу OLX…';
  countNode.textContent = '';

  try {
    const tab = await findOlxTab();
    if (!tab?.id) throw new Error('Не найдена открытая вкладка OLX.kz. Сначала открой поиск OLX.');

    const response = await chrome.tabs.sendMessage(tab.id, { type: 'SITE_PARSER_SCAN_PAGE' });
    if (!response?.ok) throw new Error(response?.error || 'Парсер не вернул результат.');

    render(response.items || []);
    statusNode.textContent = `Страница: ${response.pageUrl}`;
    countNode.textContent = `Найдено: ${(response.items || []).length}`;
  } catch (error) {
    statusNode.textContent = error?.message || String(error);
    resultsNode.replaceChildren();
  } finally {
    scanButton.disabled = false;
  }
});