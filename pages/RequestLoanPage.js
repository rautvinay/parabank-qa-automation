const { expect } = require('@playwright/test');

class RequestLoanPage {
  constructor(page) {
    this.page = page;

    this.loanAmount = page.locator('#amount');
    this.downPayment = page.locator('#downPayment');
    this.fromAccount = page.locator('#fromAccountId');

    this.applyButton = page.locator(
      'input[value="Apply Now"]'
    );

    this.loanProcessedMessage = page.getByText(
      'Loan Request Processed'
    );

    this.approvedMessage = page.getByText(
      'Congratulations, your loan has been approved.'
    );
  }

  async applyForLoan(amount, downPayment, accountId) {
    await this.loanAmount.fill(String(amount));
    await this.downPayment.fill(String(downPayment));

    await expect(
      this.fromAccount.locator('option')
    ).not.toHaveCount(0);

    await this.fromAccount.selectOption(String(accountId));

    await this.applyButton.click();

    await expect(
      this.loanProcessedMessage
    ).toBeVisible();
  }

  async getLoanStatus() {
    const bodyText = await this.page.locator('body').innerText();

    const match = bodyText.match(
      /Status:\s*(Approved|Denied|Pending)/i
    );

    if (!match) {
      throw new Error('Loan status was not found on the page');
    }

    return match[1];
  }

  async getLoanAccountNumber() {
    const bodyText = await this.page.locator('body').innerText();

    const match = bodyText.match(
      /Your new account number:\s*(\d+)/i
    );

    if (!match) {
      throw new Error(
        'Loan account number was not found in the loan result'
      );
    }

    return match[1];
  }

  async verifyApproval() {
    await expect(
      this.approvedMessage
    ).toBeVisible();
  }
}

module.exports = RequestLoanPage;