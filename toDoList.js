class Todo {
    constructor({
        title = "Todo App",
        data = [],
        onAdded = () => { },
        onDeleted = () => { },
        onStatusChanged = () => { }
    } = {}) {
        this.nodes = {};
        this.title = title;
        this.data = data;
        this.filteredData = data;
        this.count = data.length;
        this.addTask = this.addTask.bind(this);
        this.deleteTask = this.deleteTask.bind(this);
        this.toggleStatus = this.toggleStatus.bind(this);
        this.filterData = this.filterData.bind(this);
        this.onAdded = onAdded;
        this.onDeleted = onDeleted;
        this.onStatusChanged = onStatusChanged;

        this.elementDefaults = {
            type: "div",
            markup: "",
            container: document.body,
            attributes: {},
            events: {}
        };
    }

    elementCreator(options) {
        const config = { ...this.elementDefaults, ...options };
        const elementNode = document.createElement(config.type);

        Object.keys(config.attributes).forEach(a => {
            config.attributes[a] !== null &&
                elementNode.setAttribute(a, config.attributes[a]);
        });

        elementNode.innerHTML = config.markup;
        config.container.append(elementNode);

        Object.keys(config.events).forEach(e => {
            this.eventBinder(
                elementNode,
                e,
                config.events[e].action,
                config.events[e].api
            );
        });

        return elementNode;
    }

    updateCount() {
        this.count = this.data.length;
        this.nodes.count.innerHTML =
            this.count > 1 ? `${this.count} tasks` : `${this.count} task`;
    }

    eventBinder(el, event, action, api = false) {
        el.addEventListener(event, e => {
            api ? action(e) : action();
        });
    }

    emptyListUI(message = "Not found a task") {
        this.nodes.list.innerHTML = "";
        this.nodes.emptyList = this.elementCreator({
            markup: message,
            attributes: {
                class: "task-empty"
            },
            container: this.nodes.list
        });
    }

    addTask({
        id = new Date().getUTCMilliseconds(),
        name = `New task #${new Date().getUTCMilliseconds()}`,
        completed = false
    } = {}) {
        const inputValue = this.nodes.input.value.trim();
        const taskName = inputValue.length > 0 ? inputValue : name;
        const newTask = { id, name: taskName, completed };

        this.nodes.input.value = "";
        this.data.push(newTask);
        this.listUI(this.data);
        this.onAdded(newTask);
        this.updateCount();
        this.filterData();
    }

    filterData(e, param = null, value = null) {
        const attrParam = e ? e.target.getAttribute("data-param") : null;
        const attrValue = e ? e.target.getAttribute("data-value") : null;

        const queryParam = param ? param : attrParam;
        const queryValue = value ? value : attrValue;

        this.filteredData =
            !queryValue && !queryParam
                ? this.data
                : this.data.filter(task => String(task[queryParam]) === queryValue);
        this.listUI(this.filteredData);
    }

    toggleStatus(e, id = null) {
        const taskId = id ? id : Number(e.target.getAttribute("data-id"));
        const updatedData = this.data.map(task => {
            if (task.id === taskId) task.completed = !task.completed;
            return task;
        });

        this.listUI(updatedData);
        this.data = updatedData;
        this.onStatusChanged(taskId);
        this.filterData();
    }

    deleteTask(e, id = null) {
        const taskId = id ? id : Number(e.target.getAttribute("data-id"));
        const updatedData = this.data.filter(task => task.id !== taskId);

        this.listUI(updatedData);
        this.data = updatedData;
        this.onDeleted(taskId);
        this.updateCount();
        this.filterData();
    }

    generalUI() {
        this.nodes.app = this.elementCreator({
            attributes: {
                class: "app"
            }
        });

        this.nodes.header = this.elementCreator({
            attributes: {
                class: "task-header"
            },
            container: this.nodes.app
        });

        this.nodes.title = this.elementCreator({
            type: "h1",
            markup: this.title,
            attributes: {
                class: "task-header-title"
            },
            container: this.nodes.header
        });

        this.nodes.list = this.elementCreator({
            attributes: {
                class: "task-list"
            },
            container: this.nodes.app
        });

        this.nodes.tools = this.elementCreator({
            attributes: {
                class: "task-tools"
            },
            container: this.nodes.header
        });

        this.nodes.form = this.elementCreator({
            type: "form",
            attributes: {
                class: "task-form"
            },
            events: {
                submit: { action: e => e.preventDefault(), api: true }
            },
            container: this.nodes.header
        });

        this.nodes.count = this.elementCreator({
            markup: this.count > 1 ? `${this.count} tasks` : `${this.count} task`,
            attributes: {
                class: "task-count"
            },
            container: this.nodes.tools
        });
    }

    formUI() {
        this.nodes.input = this.elementCreator({
            type: "input",
            attributes: {
                class: "task-input",
                placeholder: "Add a new task...",
                autofocus: "true"
            },
            container: this.nodes.form
        });

        this.nodes.button = this.elementCreator({
            type: "button",
            markup: "Add Task",
            attributes: {
                class: "task-button"
            },
            events: {
                click: { action: this.addTask, api: false }
            },
            container: this.nodes.form
        });
    }

    listUI(data = this.data) {
        this.nodes.list.innerHTML = "";

        if (data.length === 0) {
            this.emptyListUI();
            return;
        }

        data.forEach(task => {
            const item = this.elementCreator({
                attributes: {
                    class: `task-item${task.completed ? " is-completed" : ""}`
                },
                container: this.nodes.list
            });

            const checkbox = this.elementCreator({
                type: "input",
                attributes: {
                    class: "task-status",
                    type: "checkbox",
                    checked: task.completed ? task.completed : null,
                    "data-id": task.id
                },
                events: {
                    change: { action: this.toggleStatus, api: true }
                },
                container: item
            });

            const name = this.elementCreator({
                type: "label",
                markup: task.name,
                attributes: {
                    class: "task-name"
                },
                container: item
            });

            const button = this.elementCreator({
                type: "button",
                markup: "",
                attributes: {
                    class: "task-delete",
                    "data-id": task.id
                },
                events: {
                    click: { action: this.deleteTask, api: true }
                },
                container: item
            });
        });
    }

    init() {
        this.generalUI();
        this.formUI();
        this.listUI();
    }
}

const todoList = [
    {
        id: 1,
        name: "Morning walk",
        completed: true
    },
    {
        id: 2,
        name: "Meeting with client",
        completed: false
    }
];

const TodoApp = new Todo({
    data: todoList
});

TodoApp.init();