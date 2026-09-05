'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const { Readable } = require('node:stream');

const {
  DataProgram,
  Operations,
  formatBalance,
  run,
} = require('./index');

function createOperations(amounts, output = []) {
  const dataProgram = new DataProgram();
  const operations = new Operations(dataProgram, async (message) => {
    output.push(message);
    return message.endsWith(': ') ? amounts.shift() || '' : '';
  });

  return { dataProgram, operations, output };
}

async function runApplication(input) {
  const output = [];
  const balance = await run(Readable.from(input), (message) => output.push(message));
  return { balance, output };
}

test('TC-001 displays the main menu', async () => {
  const { output } = await runApplication(['4\n']);

  assert.deepEqual(output.slice(0, 7), [
    '--------------------------------',
    'Account Management System',
    '1. View Balance',
    '2. Credit Account',
    '3. Debit Account',
    '4. Exit',
    '--------------------------------',
  ]);
});

test('TC-002 views the initial account balance', async () => {
  const { operations, output } = createOperations([]);

  await operations.call('TOTAL ');

  assert.equal(output.at(-1), 'Current balance: 1000.00');
});

test('TC-003 credits a valid amount', async () => {
  const { dataProgram, operations, output } = createOperations(['500.00']);

  await operations.call('CREDIT');

  assert.equal(formatBalance(dataProgram.call('READ')), '1500.00');
  assert.equal(output.at(-1), 'Amount credited. New balance: 1500.00');
});

test('TC-004 credits zero without changing the balance', async () => {
  const { dataProgram, operations, output } = createOperations(['0']);

  await operations.call('CREDIT');

  assert.equal(formatBalance(dataProgram.call('READ')), '1000.00');
  assert.equal(output.at(-1), 'Amount credited. New balance: 1000.00');
});

test('TC-005 credits a large amount', async () => {
  const { dataProgram, operations } = createOperations(['999999.99']);

  await operations.call('CREDIT');

  assert.equal(formatBalance(dataProgram.call('READ')), '1000999.99');
});

test('TC-006 debits a valid amount when funds are sufficient', async () => {
  const { dataProgram, operations, output } = createOperations(['250.00']);

  await operations.call('DEBIT ');

  assert.equal(formatBalance(dataProgram.call('READ')), '750.00');
  assert.equal(output.at(-1), 'Amount debited. New balance: 750.00');
});

test('TC-007 allows a debit equal to the full balance', async () => {
  const { dataProgram, operations } = createOperations(['1000.00']);

  await operations.call('DEBIT ');

  assert.equal(formatBalance(dataProgram.call('READ')), '0.00');
});

test('TC-008 rejects a debit when funds are insufficient', async () => {
  const { dataProgram, operations, output } = createOperations(['1500.00']);

  await operations.call('DEBIT ');

  assert.equal(formatBalance(dataProgram.call('READ')), '1000.00');
  assert.equal(output.at(-1), 'Insufficient funds for this debit.');
});

test('TC-009 rejects a debit above a reduced balance', async () => {
  const output = [];
  const dataProgram = new DataProgram(50000);
  const operations = new Operations(dataProgram, async (message) => {
    output.push(message);
    return '750.00';
  });

  await operations.call('DEBIT ');

  assert.equal(formatBalance(dataProgram.call('READ')), '500.00');
  assert.equal(output.at(-1), 'Insufficient funds for this debit.');
});

test('TC-010 rejects a menu choice below the valid range', async () => {
  const { output } = await runApplication(['0\n', '4\n']);

  assert.ok(output.includes('Invalid choice, please select 1-4.'));
});

test('TC-011 rejects a menu choice above the valid range', async () => {
  const { output } = await runApplication(['5\n', '4\n']);

  assert.ok(output.includes('Invalid choice, please select 1-4.'));
});

test('TC-012 handles a non-numeric menu choice gracefully', async () => {
  const { output } = await runApplication(['A\n', '4\n']);

  assert.ok(output.includes('Invalid choice, please select 1-4.'));
});

test('TC-013 exits with the expected message', async () => {
  const { output } = await runApplication(['4\n']);

  assert.equal(output.at(-1), 'Exiting the program. Goodbye!');
});

test('TC-014 accumulates sequential credit transactions', async () => {
  const { dataProgram, operations } = createOperations(['100.00', '200.00', '50.00']);

  await operations.call('CREDIT');
  await operations.call('CREDIT');
  await operations.call('CREDIT');

  assert.equal(formatBalance(dataProgram.call('READ')), '1350.00');
});

test('TC-015 accumulates sequential debit transactions', async () => {
  const { dataProgram, operations } = createOperations(['100.00', '200.00', '50.00']);

  await operations.call('DEBIT ');
  await operations.call('DEBIT ');
  await operations.call('DEBIT ');

  assert.equal(formatBalance(dataProgram.call('READ')), '650.00');
});

test('TC-016 processes mixed credit and debit transactions', async () => {
  const { dataProgram, operations } = createOperations(['500.00', '300.00', '200.00', '100.00']);

  await operations.call('CREDIT');
  await operations.call('DEBIT ');
  await operations.call('CREDIT');
  await operations.call('DEBIT ');

  assert.equal(formatBalance(dataProgram.call('READ')), '1300.00');
});

test('TC-017 shows the updated balance after a credit', async () => {
  const { operations, output } = createOperations(['250.00']);

  await operations.call('CREDIT');
  await operations.call('TOTAL ');

  assert.equal(output.at(-1), 'Current balance: 1250.00');
});

test('TC-018 shows the updated balance after a debit', async () => {
  const { operations, output } = createOperations(['300.00']);

  await operations.call('DEBIT ');
  await operations.call('TOTAL ');

  assert.equal(output.at(-1), 'Current balance: 700.00');
});

test('TC-019 debits zero without changing the balance', async () => {
  const { dataProgram, operations, output } = createOperations(['0']);

  await operations.call('DEBIT ');

  assert.equal(formatBalance(dataProgram.call('READ')), '1000.00');
  assert.equal(output.at(-1), 'Amount debited. New balance: 1000.00');
});

test('TC-020 preserves cents when crediting', async () => {
  const { dataProgram, operations } = createOperations(['25.50']);

  await operations.call('CREDIT');

  assert.equal(formatBalance(dataProgram.call('READ')), '1025.50');
});

test('TC-021 preserves cents when debiting', async () => {
  const { dataProgram, operations } = createOperations(['75.25']);

  await operations.call('DEBIT ');

  assert.equal(formatBalance(dataProgram.call('READ')), '924.75');
});

test('TC-022 returns to the main menu after an operation', async () => {
  const { output } = await runApplication(['1\n', '4\n']);

  assert.equal(output.filter((message) => message === 'Account Management System').length, 2);
});

test('TC-023 preserves the final balance after multiple operations', async () => {
  const { operations, dataProgram } = createOperations(['500.00', '300.00', '200.00', '100.00']);

  await operations.call('CREDIT');
  await operations.call('DEBIT ');
  await operations.call('CREDIT');
  await operations.call('DEBIT ');
  await operations.call('TOTAL ');

  assert.equal(formatBalance(dataProgram.call('READ')), '1300.00');
});