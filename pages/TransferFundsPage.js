const { expect } = require('@playwright/test');

class TransferFundsPage {
  constructor(page) {
    this.page = page;

    this.amount = page.locator('#amount');
    this.fromAccount = page.locator('#fromAccountId');
    this.toAccount = page.locator('#toAccountId');

    this.transferButton = page.getByRole('button', {
      name: 'Transfer',
    });

    this.transferCompleteMessage = page.getByText(
      'Transfer Complete!'
    );
  }

  async waitForTransferForm() {
    await expect(this.amount).toBeVisible();

    await expect(this.fromAccount).toBeVisible();

    await expect(this.toAccount).toBeVisible();

    await expect(
      this.fromAccount.locator('option').first()
    ).toBeAttached();

    await expect(
      this.toAccount.locator('option').first()
    ).toBeAttached();
  }

  async transfer(amount, fromAccountId, toAccountId) {
    // Wait for the form to become ready
    await this.waitForTransferForm();

    await this.amount.fill(String(amount));

    await this.fromAccount.selectOption(
      String(fromAccountId)
    );

    await this.toAccount.selectOption(
      String(toAccountId)
    );

    await this.transferButton.click();

    await expect(
      this.transferCompleteMessage
    ).toBeVisible();
  }
}

module.exports = TransferFundsPage;