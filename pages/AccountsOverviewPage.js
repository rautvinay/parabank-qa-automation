const { expect } = require('@playwright/test');

class AccountsOverviewPage {
  constructor(page) {
    this.page = page;

    this.accountTable = page.locator('#accountTable');

    this.balance = page.locator('#balance');
  }

  async openAccount(accountId) {
    const accountLink = this.page.getByRole('link', {
      name: String(accountId),
    });

    await expect(accountLink).toBeVisible();

    await accountLink.click();

    // Wait for Account Details page
    await expect(
      this.page.getByText('Account Details', {
        exact: true,
      })
    ).toBeVisible();

    // Wait until the account balance is populated
    await expect(this.balance).toHaveText(
      /\$?[\d,]+\.\d{2}/
    );
  }

  async getAccountBalance() {
    // Wait until balance is populated by the application
    await expect(this.balance).toHaveText(
      /\$?[\d,]+\.\d{2}/
    );

    const balanceText = await this.balance.innerText();

    console.log(
      `Balance value text: ${balanceText}`
    );

    const match = balanceText.match(
      /\$?\s*([\d,]+\.\d{2})/
    );

    if (!match) {
      throw new Error(
        `Could not extract account balance from: ${balanceText}`
      );
    }

    return Number(
      match[1].replace(/,/g, '')
    );
  }
}

module.exports = AccountsOverviewPage;