const transactionsList = document.querySelector('.transactions__list');

const balanceCard = document.querySelector('.balance-card .card__content span');
const incomeCard = document.querySelector('.income-card .card__content span');
const expenseCard = document.querySelector('.expense-card .card__content span');

const formatter = new Intl.NumberFormat('en-Us', {
    style: 'currency',
    currency: 'USD',
});

async function getTransactions() {

    try {
        const response = await fetch('http://localhost:3000/transactions');

        if (!response.ok) {

            throw new Error('Failed to fetch transactions');
        }

        const transactions = await response.json();

        const totalIncome = transactions.reduce((sum, transaction) => {
            if (transaction.type === 'income') {
                return sum + transaction.amount;
            }
            return sum;
        }, 0);
        // console.log(totalIncome);
        // incomeCard.textContent = '$' + totalIncome;
        incomeCard.textContent = formatter.format(totalIncome);

        const totalExpenses = transactions.reduce((sum, transaction) => {
            if (transaction.type === 'expense') {
                return sum + transaction.amount;
            }
            return sum;
        }, 0)
        expenseCard.textContent = formatter.format(totalExpenses);



        const balance = totalIncome - totalExpenses;
        balanceCard.textContent = formatter.format(balance);





        transactions.forEach((transaction) => {

            console.log(transaction.amount + ' ' + transaction.description);

            const transactionsItem = document.createElement('div');

            transactionsItem.classList.add('transaction-item');

            const transactionsItemTitle = document.createElement('p');

            transactionsItemTitle.classList.add('transaction-item__title');
            transactionsItemTitle.textContent = transaction.description;

            const transactionsItemAmount = document.createElement('p');

            transactionsItemAmount.classList.add('transaction-item__amount');

            if (transaction.type === 'income') {
                transactionsItem.classList.add('income');
                transactionsItemAmount.textContent = '+' + formatter.format(transaction.amount)
            }
            if (transaction.type === 'expense') {
                transactionsItem.classList.add('expense');
                transactionsItemAmount.textContent = '-' + formatter.format(transaction.amount)
            }

            const transactionItemType = document.createElement('p');

            transactionItemType.classList.add('transaction-item__type');
            transactionItemType.textContent = transaction.type;

            const transactionItemDate = document.createElement('p');

            transactionItemDate.classList.add('transaction-item__date');
            transactionItemDate.textContent = transaction.date;

            const category = document.createElement('p');

            category.classList.add('transaction-item__category');
            category.textContent = transaction.category;

            transactionsItem.appendChild(transactionsItemTitle);
            transactionsItem.appendChild(transactionsItemAmount);
            transactionsItem.appendChild(transactionItemType);
            transactionsItem.appendChild(transactionItemDate);
            transactionsItem.appendChild(category);

            transactionsList.appendChild(transactionsItem);

        })


    } catch (error) {
        const transactionsError = document.createElement('p');

        transactionsError.classList.add('transactions__error');

        transactionsError.textContent = 'Failed to fetch transactions';

        transactionsList.appendChild(transactionsError);

        console.error(error);
    }


}

getTransactions();



// ======




// console.log(foramter.format());
