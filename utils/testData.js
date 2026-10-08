const crypto = require('crypto');

function createUniqueUser() {
  const uniqueId = crypto
    .randomUUID()
    .replace(/-/g, '')
    .slice(0, 12);

  return {
    firstName: 'QA',
    lastName: 'Automation',
    address: '123 Test Street',
    city: 'Pune',
    state: 'Maharashtra',
    zipCode: '411001',
    phone: '9876543210',
    ssn: uniqueId.slice(0, 9),
    username: `qa_${uniqueId}`,
    password: 'Test@12345',
  };
}

module.exports = {
  createUniqueUser,
};