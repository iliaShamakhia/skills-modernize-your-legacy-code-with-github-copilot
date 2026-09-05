# Account Management System - Test Plan

## Overview
This test plan covers the business logic and functionality of the Account Management System written in Cobol. The system allows users to view account balance, credit funds, and debit funds with validation for insufficient balance scenarios.

## Initial System State
- Initial Account Balance: 1000.00

---

## Test Cases

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|---|---|---|---|---|---|---|---|
| TC-001 | Display main menu | System is running | 1. Launch the Account Management System | Menu is displayed with options: 1. View Balance, 2. Credit Account, 3. Debit Account, 4. Exit | | | |
| TC-002 | View account balance - Valid operation | System is running, Account balance is 1000.00 | 1. From main menu, select option 1 (View Balance) | Current balance of 1000.00 is displayed | | | |
| TC-003 | Credit account - Valid amount | System is running, Account balance is 1000.00 | 1. From main menu, select option 2 (Credit Account)<br>2. Enter amount: 500.00<br>3. System processes the transaction | Amount is added to balance, New balance: 1500.00 is displayed | | | |
| TC-004 | Credit account - Zero amount | System is running, Account balance is 1000.00 | 1. From main menu, select option 2 (Credit Account)<br>2. Enter amount: 0<br>3. System processes the transaction | Balance remains 1000.00 after transaction | | | |
| TC-005 | Credit account - Large amount | System is running, Account balance is 1000.00 | 1. From main menu, select option 2 (Credit Account)<br>2. Enter amount: 999999.99<br>3. System processes the transaction | Amount is added, New balance: 1000999.99 is displayed | | | Verify system can handle large numbers |
| TC-006 | Debit account - Valid amount (Sufficient funds) | System is running, Account balance is 1000.00 | 1. From main menu, select option 3 (Debit Account)<br>2. Enter amount: 250.00<br>3. System validates and processes the transaction | Amount is deducted from balance, New balance: 750.00 is displayed | | | |
| TC-007 | Debit account - Exact balance amount | System is running, Account balance is 1000.00 | 1. From main menu, select option 3 (Debit Account)<br>2. Enter amount: 1000.00<br>3. System validates and processes the transaction | Amount is deducted, New balance: 0.00 is displayed | | | Edge case: debit exactly the full balance |
| TC-008 | Debit account - Insufficient funds | System is running, Account balance is 1000.00 | 1. From main menu, select option 3 (Debit Account)<br>2. Enter amount: 1500.00<br>3. System validates the transaction | Error message "Insufficient funds for this debit." is displayed, Balance remains 1000.00 | | | Transaction should be rejected |
| TC-009 | Debit account - Amount exceeds balance | System is running, Account balance is 500.00 | 1. From main menu, select option 3 (Debit Account)<br>2. Enter amount: 750.00<br>3. System validates the transaction | Error message "Insufficient funds for this debit." is displayed, Balance remains 500.00 | | | Verify validation logic |
| TC-010 | Invalid menu choice - Below range | System is running | 1. From main menu, enter choice: 0 | Error message "Invalid choice, please select 1-4." is displayed, Menu reappears | | | |
| TC-011 | Invalid menu choice - Above range | System is running | 1. From main menu, enter choice: 5 | Error message "Invalid choice, please select 1-4." is displayed, Menu reappears | | | |
| TC-012 | Invalid menu choice - Non-numeric | System is running | 1. From main menu, enter choice: A | Error message "Invalid choice, please select 1-4." is displayed or system handles invalid input gracefully | | | |
| TC-013 | Exit program - Valid operation | System is running | 1. From main menu, select option 4 (Exit) | Message "Exiting the program. Goodbye!" is displayed, Program terminates | | | |
| TC-014 | Sequential credit transactions | System is running, Account balance is 1000.00 | 1. Credit 100.00, verify new balance is 1100.00<br>2. Credit 200.00, verify new balance is 1300.00<br>3. Credit 50.00, verify new balance is 1350.00 | All transactions are processed sequentially, Final balance: 1350.00 | | | Verify accumulation of multiple credits |
| TC-015 | Sequential debit transactions | System is running, Account balance is 1000.00 | 1. Debit 100.00, verify new balance is 900.00<br>2. Debit 200.00, verify new balance is 700.00<br>3. Debit 50.00, verify new balance is 650.00 | All transactions are processed sequentially, Final balance: 650.00 | | | Verify accumulation of multiple debits |
| TC-016 | Mixed credit and debit transactions | System is running, Account balance is 1000.00 | 1. Credit 500.00, balance: 1500.00<br>2. Debit 300.00, balance: 1200.00<br>3. Credit 200.00, balance: 1400.00<br>4. Debit 100.00, balance: 1300.00 | All transactions process correctly, Final balance: 1300.00 | | | Verify correct arithmetic across different operation types |
| TC-017 | View balance after credit | System is running, Account balance is 1000.00 | 1. Credit 250.00<br>2. Select option 1 to view balance | Current balance: 1250.00 is displayed | | | Verify data persistence across operations |
| TC-018 | View balance after debit | System is running, Account balance is 1000.00 | 1. Debit 300.00<br>2. Select option 1 to view balance | Current balance: 700.00 is displayed | | | Verify data persistence across operations |
| TC-019 | Debit with zero amount | System is running, Account balance is 1000.00 | 1. From main menu, select option 3 (Debit Account)<br>2. Enter amount: 0<br>3. System processes the transaction | Balance remains 1000.00, Transaction succeeds with no change | | | |
| TC-020 | Decimal precision - Credit with cents | System is running, Account balance is 1000.00 | 1. Credit 25.50<br>2. View balance | New balance: 1025.50 is displayed with correct decimal precision | | | Verify decimal handling |
| TC-021 | Decimal precision - Debit with cents | System is running, Account balance is 1000.00 | 1. Debit 75.25<br>2. View balance | New balance: 924.75 is displayed with correct decimal precision | | | Verify decimal handling |
| TC-022 | Menu loop - Continue after operation | System is running | 1. Select any valid operation (e.g., View Balance)<br>2. Operation completes<br>3. Observe if menu reappears | Main menu reappears after each operation, allowing continuous transactions | | | Verify program loop functionality |
| TC-023 | Data integrity - Balance persists after multiple operations | System is running, Account balance is 1000.00 | 1. Perform multiple mixed operations<br>2. Note the final calculated balance<br>3. View balance to confirm it matches | Final displayed balance matches the expected calculation | | | Verify data consistency |

---

## Test Execution Notes

### Scope
This test plan covers:
- Menu navigation and validation
- Account balance viewing
- Credit transactions (positive amounts)
- Debit transactions with sufficient and insufficient fund validation
- Data persistence and integrity
- Decimal precision handling
- Sequential transaction processing
- Program exit functionality

### Out of Scope
- Performance and load testing
- Concurrent user access
- System recovery from failures
- Negative amount handling (if applicable to business rules)
- Audit logging and compliance

### Defect/Issue Tracking Template
When issues are found during testing, document:
- Test Case ID that failed
- Actual Result vs. Expected Result
- Steps to reproduce
- Severity level (Critical/High/Medium/Low)
- Screenshots or logs if applicable

