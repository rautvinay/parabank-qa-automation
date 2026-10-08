function assertTransactionSchema(transaction, index = 0) {
  if (!transaction || typeof transaction !== 'object') {
    throw new Error(
      `Transaction at index ${index} must be an object`
    );
  }

  const requiredFields = [
    'id',
    'accountId',
    'type',
    'date',
    'amount',
    'description',
  ];

  for (const field of requiredFields) {
    if (!(field in transaction)) {
      throw new Error(
        `Transaction at index ${index} is missing required field: ${field}`
      );
    }
  }

  if (!Number.isInteger(transaction.id)) {
    throw new Error(
      `Transaction.id must be an integer at index ${index}`
    );
  }

  if (!Number.isInteger(transaction.accountId)) {
    throw new Error(
      `Transaction.accountId must be an integer at index ${index}`
    );
  }

  if (
    transaction.type !== 'Credit' &&
    transaction.type !== 'Debit'
  ) {
    throw new Error(
      `Transaction.type must be Credit or Debit at index ${index}`
    );
  }

  // ParaBank may serialize the OpenAPI date-time
  // as a string or as a numeric timestamp depending
  // on the deployed server serialization.
  const validDate =
    typeof transaction.date === 'string' ||
    typeof transaction.date === 'number';

  if (!validDate) {
    throw new Error(
      `Transaction.date must be a string or number at index ${index}`
    );
  }

  if (typeof transaction.amount !== 'number') {
    throw new Error(
      `Transaction.amount must be a number at index ${index}`
    );
  }

  if (typeof transaction.description !== 'string') {
    throw new Error(
      `Transaction.description must be a string at index ${index}`
    );
  }

  return true;
}

function assertTransactionListSchema(transactions) {
  if (!Array.isArray(transactions)) {
    throw new Error(
      'Transaction response must be an array'
    );
  }

  transactions.forEach(
    (transaction, index) => {
      assertTransactionSchema(
        transaction,
        index
      );
    }
  );

  return true;
}

module.exports = {
  assertTransactionSchema,
  assertTransactionListSchema,
};