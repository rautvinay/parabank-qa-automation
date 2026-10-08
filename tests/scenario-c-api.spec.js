const {
  test,
  expect,
} = require('@playwright/test');

const ParaBankApi = require('../api/ParaBankApi');
const RegisterPage = require('../pages/RegisterPage');
const {
  createUniqueUser,
} = require('../utils/testData');

const {
  assertTransactionListSchema,
} = require('../utils/apiSchemas');

test.describe(
  'Scenario C - REST API Transaction Validation',
  () => {
    test(
      'should deposit funds through REST API and validate transaction history',
      async ({ page, browser }) => {
        const api = new ParaBankApi();

        try {
          // --------------------------------------------
          // 1. Initialize REST API context
          // --------------------------------------------

          await api.init();

          // --------------------------------------------
          // 2. Admin precondition
          // --------------------------------------------

          await api.cleanDatabase(browser);
          await api.setLoanProvider(browser);

          // --------------------------------------------
          // 3. Register unique customer through UI
          // --------------------------------------------

          const user = createUniqueUser();

          const registerPage =
            new RegisterPage(page);

          await page.goto(
            '/parabank/register.htm'
          );

          await registerPage.register(user);

          // --------------------------------------------
          // 4. Open checking account through UI
          // --------------------------------------------

          await page.getByRole('link', {
            name: 'Open New Account',
          }).click();

          await expect(
            page.getByRole('heading', {
              name: 'Open New Account',
            })
          ).toBeVisible();

          const fromAccount =
            page.locator('#fromAccountId');

          await expect(
            fromAccount
          ).toBeVisible();

          await expect(
            fromAccount.locator('option').first()
          ).toBeAttached();

          await page.locator('#type')
            .selectOption('0');

          await page.getByRole('button', {
            name: 'Open New Account',
          }).click();

          // ParaBank keeps #newAccountId hidden,
          // so wait for the account number to be populated.

          const newAccountLink =
            page.locator('#newAccountId');

          await expect(
            newAccountLink
          ).toHaveAttribute(
            'href',
            /.+/
          );

          const accountId = Number(
            (
              await newAccountLink.innerText()
            ).trim()
          );

          expect(
            Number.isInteger(accountId)
          ).toBeTruthy();

          expect(
            accountId
          ).toBeGreaterThan(0);

          console.log(
            `Created checking account: ${accountId}`
          );

          // --------------------------------------------
          // 5. Deposit $500 using REST API
          // --------------------------------------------

          const depositAmount = 500;

          const depositResponse =
            await api.deposit(
              accountId,
              depositAmount
            );

          expect(
            depositResponse.status()
          ).toBe(200);

          console.log(
            `REST deposit successful: $${depositAmount}`
          );

          // --------------------------------------------
          // 6. Retrieve transactions using REST API
          // --------------------------------------------

          const transactions =
            await api.getTransactionsJson(
              accountId
            );

          console.log(
            `Retrieved ${transactions.length} transaction(s)`
          );

          // --------------------------------------------
          // 7. Validate response schema
          // --------------------------------------------

          assertTransactionListSchema(
            transactions
          );

          expect(
            transactions.length
          ).toBeGreaterThan(0);

          // --------------------------------------------
          // 8. Validate account transactions
          // --------------------------------------------

          const accountTransactions =
            transactions.filter(
              (transaction) =>
                transaction.accountId === accountId
            );

          expect(
            accountTransactions.length
          ).toBeGreaterThan(0);

          // --------------------------------------------
          // 9. Validate deposited transaction
          // --------------------------------------------

          const depositTransaction =
            accountTransactions.find(
              (transaction) =>
                transaction.type === 'Credit' &&
                transaction.amount ===
                  depositAmount
            );

          expect(
            depositTransaction,
            `Expected Credit transaction of $${depositAmount} for account ${accountId}`
          ).toBeTruthy();

          expect(
            depositTransaction.id
          ).toBeGreaterThan(0);

          expect(
            depositTransaction.accountId
          ).toBe(accountId);

          expect(
            depositTransaction.type
          ).toBe('Credit');

          expect(
            depositTransaction.amount
          ).toBe(depositAmount);

          expect(
            depositTransaction.date
          ).toBeTruthy();

          expect(
            depositTransaction.description
          ).toBeTruthy();

          console.log(
            'REST transaction history validation passed'
          );
        } finally {
          await api.dispose();
        }
      }
    );
  }
);