const fs = require('fs');
const { parse: parseUrl } = require('url');
const { parse: parseQuery } = require('querystring');
const cheerio = require('cheerio');

const $ = cheerio.load(fs.readFileSync('account.html'));
const $rows = $('.wallet_table_row').toArray();

const transactions = $rows
  .map((_el, _i) => {
    const url = _el.attribs.onclick.match(/'(.*)'/)[1];
    const params = parseQuery(parseUrl(url).query);
    const transactionId = params.transid;

    const $row = $(_el);
    const date = $row.find('.wht_date').text();

    const items = $row.find('.wht_items').children(':not(.wth_payment):not(.wth_item_refunded)').toArray().map(item => $(item).text().trim());
    const recipients = $row.find('.wht_items').find('.wth_payment').children().toArray().map(item => $(item).text().trim().split('Gift sent to ')[1]).filter(t => t);
    const isWalletCreditPurchase = !items.length && $row.find('.wht_items').text().includes(' Wallet Credit');
    const type = $row.find('.wht_type').children().first().text();
    const total = parseFloat($row.find('.wht_total').text().trim().replace('$', ''));

    const isRefund = !!$row.find('.wth_item_refunded').length;

    return {
      date,
      transactionId,
      url,
      items,
      recipients,
      type,
      total,
      isRefund,
      isWalletCreditPurchase,
    };
  })
  // remove community market transactions (no transid)
  .filter(t => t.transactionId)
  // remove wallet credit purchases, e.g. gift cards or funding for in-game purchases
  .filter(t => !t.isWalletCreditPurchase);


const totalSpent = transactions.reduce((acc, t) => {
  if (t.isRefund) {
    return acc - t.total;
  }
  return acc + t.total;
}, 0);

const totalGiftPurchases = transactions.reduce((acc, t) => {
  if (t.type === 'Gift Purchase') {
    return acc + t.total;
  }
  return acc;
}, 0);

const recipientTotals = transactions.reduce((acc, t) => {
  if (t.type !== 'Gift Purchase') { return acc; }
  if (t.recipients.length > 1) {
    console.error("This gift purchase had multiple recipients and I don't know how to deal with it:", t);
    return acc;
  }

  const name = t.recipients[0];
  acc[name] = (acc[name] || 0) + t.total;
  return acc;
}, {});

console.log(`
Total spent: ${totalSpent.toFixed(2)}
Spent on yourself: ${(totalSpent - totalGiftPurchases).toFixed(2)}
Spent on others: ${totalGiftPurchases.toFixed(2)}
`);

Object.entries(recipientTotals).forEach(([name, val]) => {
  console.log(`- ${name}: ${val.toFixed(2)}`);
});
