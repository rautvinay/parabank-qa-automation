const { test, expect } = require('@playwright/test');

const ParaBankApi = require('../api/ParaBankApi');
const RegisterPage = require('../pages/RegisterPage');
const RequestLoanPage = require('../pages/RequestLoanPage');
const AccountsOverviewPage = require('../pages/AccountsOverviewPage');
const { createUniqueUser } = require('../utils/testData');

test('Scenario A - Register user, open checking account and apply for loan', async ({ page, browser }) => {
  // 1. Prepare database and loan provider
  const api = new ParaBankApi();

  await api.init();
  await api.cleanDatabase(browser);
  await api.setLoanProvider(browser);
  await api.dispose();

  // 2. Generate unique user
  const user = createUniqueUser();

  // 3. Register user
  await page.goto('/parabank/register.htm');

  const registerPage = new RegisterPage(page);

  await registerPage.register(user);

  await expect(
    page.getByText('Your account was created successfully')
  ).toBeVisible();

  console.log(`Registered user: ${user.username}`);

  // 4. Registration automatically logs the user in
  await expect(
    page.getByRole('link', { name: 'Accounts Overview' })
  ).toBeVisible();

  console.log('Registration and automatic login successful');

  // 5. Open New Account
  await page.getByRole('link', {
    name: 'Open New Account',
  }).click();

  await expect(
    page.getByRole('heading', {
      name: 'Open New Account',
    })
  ).toBeVisible();

  // 6. Select Checking account
  const accountType = page.locator('#type');

  await expect(accountType).toBeVisible();

  await accountType.selectOption('0');

  // 7. Wait for source account dropdown
  const fromAccount = page.locator('#fromAccountId');

  await expect(fromAccount).toBeVisible();

  // Wait until the account dropdown has at least one option
  await expect(
    fromAccount.locator('option').first()
  ).toBeAttached();

  // 8. Get source account dynamically
  const sourceAccountId = await fromAccount
    .locator('option')
    .first()
    .getAttribute('value');

  if (!sourceAccountId) {
    throw new Error(
      'Could not determine the source account ID'
    );
  }

  console.log(`Source account ID: ${sourceAccountId}`);

  // 9. Select source account
  await fromAccount.selectOption(sourceAccountId);

  // 10. Open checking account
  await page.getByRole('button', {
    name: 'Open New Account',
  }).click();

  // 11. Verify account was opened
  await expect(
    page.getByText('Account Opened!')
  ).toBeVisible();

  // 12. Capture new checking account ID
  const newAccountId = (
    await page.locator('#newAccountId').textContent()
  ).trim();

  console.log(
    `New Checking Account ID: ${newAccountId}`
  );

  expect(newAccountId).not.toBe('');

  // 13. Navigate to Request Loan
  await page.getByRole('link', {
    name: 'Request Loan',
  }).click();

  await expect(
    page.getByRole('heading', {
      name: 'Apply for a Loan',
    })
  ).toBeVisible();

  // 14. Apply for loan
  const loanPage = new RequestLoanPage(page);

  const loanAmount = 200;
  const downPayment = 0;

  console.log(`Loan amount: $${loanAmount}`);
  console.log(`Down payment: $${downPayment}`);

  await loanPage.applyForLoan(
    loanAmount,
    downPayment,
    newAccountId
  );

  // 15. Verify loan status
  const loanStatus = await loanPage.getLoanStatus();

  console.log(`Loan status: ${loanStatus}`);

  expect(loanStatus).toBe('Approved');

  // 16. Verify approval message
  await loanPage.verifyApproval();

  console.log(
    'Loan approval message verified'
  );

  // 17. Extract dynamic loan account number
  const loanAccountNumber =
    await loanPage.getLoanAccountNumber();

  console.log(
    `New Loan Account Number: ${loanAccountNumber}`
  );

  expect(loanAccountNumber).not.toBe('');

  // 18. Navigate to Accounts Overview
  await page.getByRole('link', {
    name: 'Accounts Overview',
  }).click();

  // 19. Verify Accounts Overview page
  await expect(
    page.getByRole('heading', {
      name: 'Accounts Overview',
    })
  ).toBeVisible();

  // 20. Open the newly created loan account
  const accountsPage =
    new AccountsOverviewPage(page);

  await accountsPage.openAccount(
    loanAccountNumber
  );

  // 21. Get loan account balance
  const depositedBalance =
    await accountsPage.getAccountBalance();

  console.log(
    `Loan account balance: $${depositedBalance.toFixed(2)}`
  );

  // 22. Verify loan amount was deposited
  expect(depositedBalance).toBe(loanAmount);

  console.log(
    `Verified loan deposit: $${loanAmount.toFixed(2)}`
  );

  console.log(
    'Scenario A completed successfully'
  );
});