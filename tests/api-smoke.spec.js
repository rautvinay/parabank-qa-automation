const { test } = require('@playwright/test');
const ParaBankApi = require('../api/ParaBankApi');

test('ParaBank admin preconditions', async ({ browser }) => {
  const api = new ParaBankApi();

  await api.init();

  await api.cleanDatabase(browser);

  await api.setLoanProvider(browser);

  await api.dispose();
});