
/* =========================
   DOM ELEMENTS
========================= */

const transactionsList = document.querySelector('.transactions__list');

const balanceCard = document.querySelector('.balance-card .card__content span');
const incomeCard = document.querySelector('.income-card .card__content span');
const expenseCard = document.querySelector('.expense-card .card__content span');

const userForm = document.querySelector('.user-form');

const description = document.querySelector('#description');
const amount = document.querySelector('#amount');
const date = document.querySelector('#date');
const type = document.querySelector('#type');
const category = document.querySelector('#category');
const submitBtn = document.querySelector('#submit-btn');

const formMessage = document.querySelector('.form-message');

const cancelEditButton = document.querySelector('#cancel-edit-btn');

const filterButtons = document.querySelectorAll('.filter-button');

const clearButton = document.querySelector('.clear-button');

let selectedFilter = 'all';

filterButtons.forEach(button => {
    button.addEventListener('click', event => {
        const clickedButton = event.currentTarget;

        selectedFilter = clickedButton.dataset.filter;

        // Update active button
        filterButtons.forEach(button => {
            button.classList.remove('active');
        });

        clickedButton.classList.add('active');

        getTransactions();
    });
});

/* =========================
   CONFIGURATION
========================= */

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
});

let editingTransactionId = null;


/* =========================
   GET TRANSACTIONS
========================= */

async function getTransactions() {
    try {
        const response = await fetch('http://localhost:3000/transactions');

        if (!response.ok) {
            throw new Error('Failed to fetch transactions');
        }

        const transactions = await response.json();

        // Calculate income
        const totalIncome = transactions.reduce((sum, transaction) => {
            if (transaction.type === 'income') {
                return sum + transaction.amount;
            }

            return sum;
        }, 0);

        // Calculate expenses
        const totalExpenses = transactions.reduce((sum, transaction) => {
            if (transaction.type === 'expense') {
                return sum + transaction.amount;
            }

            return sum;
        }, 0);

        // Calculate balance
        const balance = totalIncome - totalExpenses;

        // Update dashboard
        incomeCard.textContent = formatter.format(totalIncome);
        expenseCard.textContent = formatter.format(totalExpenses);
        balanceCard.textContent = formatter.format(balance);

        const filteredTransactions = transactions.filter(transaction => {
            if (selectedFilter === 'all') {
                return true;
            }

            return transaction.type === selectedFilter;
        });

        transactionsList.innerHTML = '';
        const sortedTransactions = [...filteredTransactions];

        sortedTransactions.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        // Render transactions
        sortedTransactions.forEach(transaction => {
            const transactionsItem = document.createElement('div');
            transactionsItem.classList.add('transaction-item');

            // Transaction title
            const transactionsItemTitle = document.createElement('p');
            transactionsItemTitle.classList.add('transaction-item__title');
            transactionsItemTitle.textContent = transaction.description;

            // Transaction amount
            const transactionsItemAmount = document.createElement('p');
            transactionsItemAmount.classList.add('transaction-item__amount');

            if (transaction.type === 'income') {
                transactionsItem.classList.add('income');
                transactionsItemAmount.textContent =
                    '+' + formatter.format(transaction.amount);

            } else if (transaction.type === 'expense') {
                transactionsItem.classList.add('expense');
                transactionsItemAmount.textContent =
                    '-' + formatter.format(transaction.amount);
            }

            // Transaction type
            const transactionItemType = document.createElement('p');
            transactionItemType.classList.add('transaction-item__type');
            transactionItemType.textContent = transaction.type;

            // Transaction date
            const transactionItemDate = document.createElement('p');
            transactionItemDate.classList.add('transaction-item__date');
            transactionItemDate.textContent = transaction.date;

            // Transaction category
            const transactionItemCategory = document.createElement('p');
            transactionItemCategory.classList.add('transaction-item__category');
            transactionItemCategory.textContent = transaction.category;

            // Delete button
            const dltBtn = document.createElement('button');
            dltBtn.classList.add('dlt-btn');
            dltBtn.textContent = 'Delete';

            dltBtn.addEventListener('click', event => {
                event.preventDefault();
                deleteTransaction(transaction.id);
            });

            // Edit button
            const editBtn = document.createElement('button');
            editBtn.classList.add('edit-button');
            editBtn.textContent = 'Edit';

            editBtn.addEventListener('click', event => {
                event.preventDefault();

                description.value = transaction.description;
                amount.value = transaction.amount;
                date.value = transaction.date;
                type.value = transaction.type;
                category.value = transaction.category;

                submitBtn.textContent = 'Update';
                editingTransactionId = transaction.id;
            });

            // Append elements
            transactionsItem.appendChild(transactionsItemTitle);
            transactionsItem.appendChild(transactionsItemAmount);
            transactionsItem.appendChild(transactionItemType);
            transactionsItem.appendChild(transactionItemDate);
            transactionsItem.appendChild(transactionItemCategory);
            transactionsItem.appendChild(dltBtn);
            transactionsItem.appendChild(editBtn);

            transactionsList.appendChild(transactionsItem);
        });

    } catch (error) {
        const transactionsError = document.createElement('p');
        transactionsError.classList.add('transactions__error');
        transactionsError.textContent = 'Failed to fetch transactions';

        transactionsList.appendChild(transactionsError);

        console.error(error);
    }
}


/* =========================
   DELETE TRANSACTION
========================= */
async function deleteTransaction(id) {
    try {
        const result = confirm('Are you sure you want to delete this transaction?');
        if (!result) return;
        const response = await fetch(
            `http://localhost:3000/transactions/${id}`,
            {
                method: 'DELETE',
            }
        );

        if (!response.ok) {
            throw new Error('Failed to delete transaction');
        }



        getTransactions();

    } catch (error) {
        console.error(error);
    }
}

async function clearAllTransactions() {
    const result = confirm(
        'Are you sure you want to delete all transactions?'
    );

    if (!result) return;

    const response = await fetch('http://localhost:3000/transactions');

    if (!response.ok) {
        throw new Error('Failed to fetch transactions');
    }

    const transactions = await response.json();

    const deleteRequests = transactions.map(transaction => {
        return fetch(`http://localhost:3000/transactions/${transaction.id}`, {
            method: 'DELETE'
        });
    });

    const responses = await Promise.all(deleteRequests);

    if (responses.some(response => !response.ok)) {
        throw new Error('Failed to delete some transactions');
    }

    getTransactions();
}

/* =========================
   SAVE TRANSACTION
========================= */

async function saveTransaction(newTransaction) {
    const isEditing = editingTransactionId !== null;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...'

    const url = isEditing
        ? `http://localhost:3000/transactions/${editingTransactionId}`
        : 'http://localhost:3000/transactions';

    try {
        const response = await fetch(url, {
            method: isEditing ? 'PATCH' : 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newTransaction),
        });

        if (!response.ok) {
            throw new Error('Failed to save transaction');
        }

        formMessage.textContent = isEditing
            ? 'Transaction updated successfully!'
            : 'Transaction added successfully!';

        userForm.reset();

        editingTransactionId = null;

        getTransactions();

    } catch (error) {
        formMessage.textContent = 'Failed to save transaction!';
        console.error(error);
    } finally {
        submitBtn.disabled = false;

        submitBtn.textContent = editingTransactionId !== null
            ? 'Update'
            : 'Submit';
    }
}


/* =========================
   FORM SUBMIT
========================= */

userForm.addEventListener('submit', event => {
    event.preventDefault();

    formMessage.textContent = '';
    formMessage.classList.remove('form-message--error');

    const amountNumber = Number(amount.value);

    // Validate description
    if (description.value.trim() === '') {
        formMessage.textContent = 'Description cannot be empty';
        formMessage.classList.add('form-message--error');
        return;
    }

    // Validate amount
    if (amount.value.trim() === '' || amountNumber <= 0) {
        formMessage.textContent = 'Amount must be greater than zero';
        formMessage.classList.add('form-message--error');
        return;
    }

    // Validate date
    if (date.value === '') {
        formMessage.textContent = 'Date cannot be empty';
        formMessage.classList.add('form-message--error');
        return;
    }

    // Validate category
    if (category.value.trim() === '') {
        formMessage.textContent = 'Category cannot be empty';
        formMessage.classList.add('form-message--error');
        return;
    }

    // Create transaction object
    const newTransaction = {
        description: description.value.trim(),
        amount: amountNumber,
        type: type.value,
        date: date.value,
        category: category.value.trim(),
    };

    saveTransaction(newTransaction);
});


cancelEditButton.addEventListener('click', (event) => {
    event.preventDefault();

    userForm.reset();
    editingTransactionId = null;
    submitBtn.textContent = 'Submit';
    formMessage.textContent = '';
    formMessage.classList.remove('form-message--error');
})

clearButton.addEventListener('click', event => {
    event.preventDefault();
    clearAllTransactions();
});

/* =========================
   INITIALIZATION
========================= */

getTransactions();
