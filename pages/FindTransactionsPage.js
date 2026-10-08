
const { expect } = require('@playwright/test');

class FindTransactionsPage {
  constructor(page) {
    this.page = page;
    this.transactionTable = page.locator('#transactionTable');
    this.transactionRows = page.locator(
      '#transactionTable tbody tr'
    );
  }

  async getTotalTransferredOut() {
    // The table becomes visible after a valid search.
    await expect(this.transactionTable).toBeVisible();

    await expect
      .poll(
        async () => {
          return await this.transactionRows.count();
        },
        { timeout: 10000 }
      )
      .toBeGreaterThan(0);

    const rows = await this.transactionRows.all();
    let totalCents = 0;

    for (const row of rows) {
      const cells = row.locator('td');

      if (await cells.count() < 4) {
        continue;
      }

      // Columns: Date | Transaction | Debit (-) | Credit (+)
      const debitText = (await cells.nth(2).innerText()).trim();

      if (!debitText) {
        continue;
      }

      const normalized = debitText.replace(/[$,\s]/g, '');

      if (!/^-?\d+(\.\d{1,2})?$/.test(normalized)) {
        continue;
      }

      const negative = normalized.startsWith('-');
      const unsigned = negative
        ? normalized.slice(1)
        : normalized;

      const [whole, decimal = ''] = unsigned.split('.');

      const cents =
        Number(whole) * 100 +
        Number((decimal + '00').slice(0, 2));

      totalCents += negative ? -cents : cents;
    }

    return totalCents;
  }
}

module.exports = FindTransactionsPage;