function generateID() {
    return '_' + Math.random().toString(36).substr(2, 9);
}

window.onload = function() {
    loadTasks();
    document.getElementById('toggle-mode').onclick = toggleMode;
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark');
    }
    document.getElementById('new-task').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addTask();
        }
    });
};

function toggleMode() {
    document.body.classList.toggle('dark');
    localStorage.setItem('darkMode', document.body.classList.contains('dark'));
}

function addTask() {
    const taskInput = document.getElementById('new-task');
    const dueDate = document.getElementById('due-date').value;
    const priority = document.getElementById('priority').value;
    const text = taskInput.value.trim();

    if (text === '') {
        alert('Digite uma tarefa!');
        return;
    }

    const task = {
        id: generateID(),
        text: text,
        priority: priority,
        date: new Date().toLocaleString(),
        dueDate: dueDate,
        column: 'todo'
    };

    createTaskElement(task);
    saveTask(task);

    taskInput.value = '';
    document.getElementById('due-date').value = '';
    updateCounters();
}

function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = `task priority-${task.priority}`;
    div.id = task.id;
    div.draggable = true;
    div.ondragstart = drag;

    const overdue = checkOverdue(task.dueDate) ? '<span class="overdue">❗️ Atrasado</span>' : '';

    div.innerHTML = `
        <div class="top">
            <span class="title" ondblclick="editTask(this)">${task.text}</span>
            <button onclick="removeTask(this)">X</button>
        </div>
        <div class="meta">🕒 ${task.date} ${task.dueDate ? ` | 📅 ${task.dueDate}` : ''} ${overdue}</div>
    `;

    document.getElementById(task.column).appendChild(div);
}

function editTask(element) {
    element.contentEditable = true;
    element.focus();
    element.onblur = () => {
        element.contentEditable = false;
        updateTaskText(element.parentElement.parentElement.id, element.innerText);
    };
}

function allowDrop(ev) {
    ev.preventDefault();
}

function drag(ev) {
    ev.dataTransfer.setData('text/plain', ev.target.id);
}

function drop(ev) {
    ev.preventDefault();
    const id = ev.dataTransfer.getData('text/plain');
    const task = document.getElementById(id);
    ev.currentTarget.appendChild(task);
    updateTaskColumn(id, ev.currentTarget.id);
    updateCounters();
}

function removeTask(button) {
    if (confirm('Deseja realmente excluir esta tarefa?')) {
        const task = button.closest('.task');
        task.remove();
        deleteTask(task.id);
        updateCounters();
    }
}

function clearAll() {
    if (confirm('Tem certeza que deseja remover todas as tarefas?')) {
        localStorage.removeItem('tasks');
        location.reload();
    }
}

function searchTasks() {
    const searchValue = document.getElementById('search').value.toLowerCase();
    const priorityFilter = document.getElementById('filterPriority').value;
    const tasks = document.getElementsByClassName('task');

    Array.from(tasks).forEach(task => {
        const text = task.querySelector('.title').innerText.toLowerCase();
        const priority = task.className.includes(`priority-${priorityFilter}`);
        const matchesText = text.includes(searchValue);
        const matchesPriority = !priorityFilter || priority;

        task.style.display = (matchesText && matchesPriority) ? 'flex' : 'none';
    });
}

function updateCounters() {
    const todo = document.getElementById('todo').getElementsByClassName('task').length;
    const inProgress = document.getElementById('in-progress').getElementsByClassName('task').length;
    const done = document.getElementById('done').getElementsByClassName('task').length;

    document.getElementById('count-todo').innerText = todo;
    document.getElementById('count-in-progress').innerText = inProgress;
    document.getElementById('count-done').innerText = done;
}

function saveTask(task) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.push(task);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function deleteTask(id) {
    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks = tasks.filter(t => t.id !== id);
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function updateTaskColumn(id, column) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.column = column;
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
}

function updateTaskText(id, text) {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    const task = tasks.find(t => t.id === id);
    if (task) {
        task.text = text;
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }
}

function loadTasks() {
    const tasks = JSON.parse(localStorage.getItem('tasks')) || [];
    tasks.forEach(task => createTaskElement(task));
    updateCounters();
}

function checkOverdue(date) {
    if (!date) return false;
    const today = new Date().toISOString().split('T')[0];
    return date < today;
}
