const input = document.getElementById('input');
const list = document.getElementById('list');
const add = document.getElementById('add');
const totalTask = document.getElementById('total-tasks')

function itemFunck() {
    let count = 0;
    if (input.value.trim() === '') {
        count++;
        return;
    }
    

    const item = document.createElement('li');

    item.textContent = input.value;

    list.append(item);

    input.value = '';

    function removeButtton() {
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'remove';

        item.append(removeBtn);
        removeBtn.addEventListener('click', (event) => {
            event.stopPropagation();
            removeBtn.parentElement.remove();
        })
    }
    removeButtton();

    function completed() {
        item.addEventListener('click', (event) => {
            event.preventDefault();
            item.classList.toggle('completed');
        })
    }
    completed();



}

add.addEventListener('click', (event) => {
    event.preventDefault();
    itemFunck();
});
