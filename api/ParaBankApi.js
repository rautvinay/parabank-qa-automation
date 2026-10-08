const { request } = require('@playwright/test');

class ParaBankApi {
  async init() {
    this.apiContext = await request.newContext({
      baseURL:
        'https://parabank.parasoft.com',
      extraHTTPHeaders: {
        Accept: 'application/json',
      },
    });
  }

  // ---------- Admin preconditions ----------

  async cleanDatabase(browser) {
    const context = await browser.newContext();

    try {
      const page = await context.newPage();

      await page.goto(
        'https://parabank.parasoft.com/parabank/admin.htm'
      );

      await page.locator(
        'button[name="action"][value="CLEAN"]'
      ).click();

      await page.waitForLoadState('domcontentloaded');

      console.log(
        'Database cleaned successfully'
      );
    } finally {
      await context.close();
    }
  }

  async setLoanProvider(browser) {
    const context = await browser.newContext();

    try {
      const page = await context.newPage();

      await page.goto(
        'https://parabank.parasoft.com/parabank/admin.htm'
      );

      await page.locator(
        '#loanProvider'
      ).selectOption('ws');

      await page.locator(
        '#adminForm input[type="submit"]'
      ).click();

      await page.waitForLoadState(
        'domcontentloaded'
      );

      const selectedValue =
        await page.locator(
          '#loanProvider'
        ).inputValue();

      if (selectedValue !== 'ws') {
        throw new Error(
          `Expected Web Service loan provider, received: ${selectedValue}`
        );
      }

      console.log(
        'Loan Provider set to Web Service'
      );
    } finally {
      await context.close();
    }
  }

  // ---------- REST API ----------

  async deposit(accountId, amount) {
    const response =
      await this.apiContext.post(
        '/parabank/services/bank/deposit',
        {
          params: {
            accountId,
            amount,
          },
        }
      );

    if (!response.ok()) {
      const body = await response.text();

      throw new Error(
        `POST /deposit failed with HTTP ${response.status()}: ${body}`
      );
    }

    return response;
  }

  async getTransactions(accountId) {
    const response =
      await this.apiContext.get(
        `/parabank/services/bank/accounts/${accountId}/transactions`
      );

    if (!response.ok()) {
      const body = await response.text();

      throw new Error(
        `GET /accounts/${accountId}/transactions failed with HTTP ${response.status()}: ${body}`
      );
    }

    return response;
  }

  async getTransactionsJson(accountId) {
    const response =
      await this.getTransactions(accountId);

    return response.json();
  }

  async dispose() {
    if (this.apiContext) {
      await this.apiContext.dispose();

      this.apiContext = null;
    }
  }
}

module.exports = ParaBankApi;