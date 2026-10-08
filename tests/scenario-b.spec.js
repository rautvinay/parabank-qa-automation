
const { test, expect } = require('@playwright/test');

const ParaBankApi = require('../api/ParaBankApi');
const RegisterPage = require('../pages/RegisterPage');
const RequestLoanPage = require('../pages/RequestLoanPage');
const TransferFundsPage = require('../pages/TransferFundsPage');
const FindTransactionsPage = require('../pages/FindTransactionsPage');
const { createUniqueUser } = require('../utils/testData');

test('Scenario B - Transfer funds and verify total deductions', async ({
  page,
  browser,
}) => {
  // 1. Reset the database and configure the loan provider
  const api = new ParaBankApi();

  try {
    await api.init();
    await api.cleanDatabase(browser);
    await api.setLoanProvider(browser);
  } finally {
    await api.dispose();
  }

  // 2. Register a unique user
  const user = createUniqueUser();

  await page.goto('/parabank/register.htm');

  const registerPage = new RegisterPage(page);
  await registerPage.register(user);

  await expect(
    page.getByText('Your account was created successfully')
  ).toBeVisible();

  await expect(
    page.getByRole('link', { name: 'Accounts Overview' })
  ).toBeVisible();

  console.log(`Registered user: ${user.username}`);

  // 3. Open a checking account
  await page.getByRole('link', {
    name: 'Open New Account',
  }).click();

  await expect(
    page.getByRole('heading', { name: 'Open New Account' })
  ).toBeVisible();

  const sourceSelector = page.locator('#fromAccountId');

  await expect(sourceSelector.locator('option').first())
    .toBeAttached();

  const sourceAccountId = await sourceSelector
    .locator('option')
    .first()
    .getAttribute('value');

  if (!sourceAccountId) {
    throw new Error('Source account ID was not found');
  }

  await page.locator('#type').selectOption('0');
  await sourceSelector.selectOption(sourceAccountId);

  await page.getByRole('button', {
    name: 'Open New Account',
  }).click();

  await expect(
    page.getByText('Account Opened!')
  ).toBeVisible();

  const targetAccountId = (
    await page.locator('#newAccountId').innerText()
  ).trim();

  expect(targetAccountId).not.toBe('');

  console.log(`Source account ID: ${sourceAccountId}`);
  console.log(`Target account ID: ${targetAccountId}`);

  // 4. Request a loan to fund the transfers
  await page.getByRole('link', {
    name: 'Request Loan',
  }).click();

  await expect(
    page.getByRole('heading', { name: 'Apply for a Loan' })
  ).toBeVisible();

  const loanPage = new RequestLoanPage(page);

  await loanPage.applyForLoan(200, 0, targetAccountId);

  const loanStatus = await loanPage.getLoanStatus();

  expect(loanStatus).toBe('Approved');
  await loanPage.verifyApproval();

  const loanAccountNumber =
    await loanPage.getLoanAccountNumber();

  expect(loanAccountNumber).not.toBe('');

  console.log(`Loan account ID: ${loanAccountNumber}`);

  // 5. Perform the three transfers
  const transfers = [150, 25.50, 8.99];

  const transferPage = new TransferFundsPage(page);

  for (const amount of transfers) {
    await page.getByRole('link', {
      name: 'Transfer Funds',
    }).click();

    await expect(
      page.getByRole('heading', { name: 'Transfer Funds' })
    ).toBeVisible();

    console.log(`Transferring $${amount.toFixed(2)}`);

    await transferPage.transfer(
      amount,
      loanAccountNumber,
      sourceAccountId
    );

    console.log(`Transfer of $${amount.toFixed(2)} completed`);
  }

  // 6. Calculate the expected total using integer cents
  const expectedTotalCents = transfers.reduce(
    (total, amount) => total + Math.round(amount * 100),
    0
  );

  console.log(
    `Expected total deduction: $${(expectedTotalCents / 100).toFixed(2)}`
  );

  // 7. Search transactions for the loan account
  await page.getByRole('link', {
    name: 'Find Transactions',
  }).click();

  await expect(
    page.getByRole('heading', { name: 'Find Transactions' })
  ).toBeVisible();

  await page.locator('#accountId').selectOption(
    String(loanAccountNumber)
  );

  // ParaBank provides separate search buttons.
  // Search by date range instead of using Find By ID.
  await page.locator('#fromDate').fill('01-01-2020');
  await page.locator('#toDate').fill('12-31-2030');

  await page.locator('#findByDateRange').click();

  // 8. Parse the transaction table and total the debit amounts
  const findTransactionsPage =
    new FindTransactionsPage(page);

  const actualTotalCents =
    await findTransactionsPage.getTotalTransferredOut();

  console.log(
    `Actual total transferred out: $${(actualTotalCents / 100).toFixed(2)}`
  );

  // 9. Validate the result
  expect(actualTotalCents).toBe(expectedTotalCents);

  console.log('Scenario B completed successfully');
});