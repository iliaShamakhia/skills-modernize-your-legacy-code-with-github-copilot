'use strict';

const readline = require('node:readline');

const INITIAL_BALANCE_CENTS = 100000;

class DataProgram {
  constructor(initialBalanceCents = INITIAL_BALANCE_CENTS) {
    this.balanceCents = initialBalanceCents;
  }

  call(operation, balanceCents) {
    switch (operation) {
      case 'READ':
        return this.balanceCents;
      case 'WRITE':
        this.balanceCents = balanceCents;
        return this.balanceCents;
      default:
        return this.balanceCents;
    }
  }
}

function formatBalance(balanceCents) {
  return (balanceCents / 100).toFixed(2);
}

function parseAmount(input) {
  const value = String(input).trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(value)) {
    return null;
  }

  const [whole, fraction = ''] = value.split('.');
  return Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
}

class Operations {
  constructor(dataProgram, prompt) {
    this.dataProgram = dataProgram;
    this.prompt = prompt;
  }

  async call(operation) {
    switch (operation) {
      case 'TOTAL ':
        this.prompt(`Current balance: ${formatBalance(this.dataProgram.call('READ'))}`);
        break;
      case 'CREDIT':
        await this.credit();
        break;
      case 'DEBIT ':
        await this.debit();
        break;
      default:
        break;
    }
  }

  async readAmount(label) {
    const amount = parseAmount(await this.prompt(label));
    if (amount === null) {
      this.prompt('Invalid amount.');
    }
    return amount;
  }

  async credit() {
    const amount = await this.readAmount('Enter credit amount: ');
    if (amount === null) {
      return;
    }

    const balance = this.dataProgram.call('READ') + amount;
    this.dataProgram.call('WRITE', balance);
    this.prompt(`Amount credited. New balance: ${formatBalance(balance)}`);
  }

  async debit() {
    const amount = await this.readAmount('Enter debit amount: ');
    if (amount === null) {
      return;
    }

    const balance = this.dataProgram.call('READ');
    if (balance < amount) {
      this.prompt('Insufficient funds for this debit.');
      return;
    }

    const newBalance = balance - amount;
    this.dataProgram.call('WRITE', newBalance);
    this.prompt(`Amount debited. New balance: ${formatBalance(newBalance)}`);
  }
}

function displayMenu(output) {
  output('--------------------------------');
  output('Account Management System');
  output('1. View Balance');
  output('2. Credit Account');
  output('3. Debit Account');
  output('4. Exit');
  output('--------------------------------');
}

async function run(input = process.stdin, output = console.log) {
  const inputInterface = readline.createInterface({ input, crlfDelay: Infinity });
  const lines = inputInterface[Symbol.asyncIterator]();
  const dataProgram = new DataProgram();
  const operations = new Operations(dataProgram, async (message) => {
    if (message.endsWith(': ')) {
      output(message);
      const next = await lines.next();
      return next.done ? '' : next.value;
    }
    output(message);
    return '';
  });

  try {
    let continueRunning = true;
    while (continueRunning) {
      displayMenu(output);
      output('Enter your choice (1-4): ');
      const choice = await lines.next();
      if (choice.done) {
        break;
      }

      switch (choice.value.trim()) {
        case '1':
          await operations.call('TOTAL ');
          break;
        case '2':
          await operations.call('CREDIT');
          break;
        case '3':
          await operations.call('DEBIT ');
          break;
        case '4':
          continueRunning = false;
          break;
        default:
          output('Invalid choice, please select 1-4.');
      }
    }
  } finally {
    inputInterface.close();
  }

  output('Exiting the program. Goodbye!');
  return dataProgram.call('READ');
}

if (require.main === module) {
  run().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = {
  DataProgram,
  Operations,
  formatBalance,
  parseAmount,
  run,
};