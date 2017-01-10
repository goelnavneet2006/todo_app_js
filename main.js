function returnTodoApp() {
  var TODOAPPKEY = "todoApp";

  function getLocalStorage () {
    var localStorageData = localStorage.getItem(TODOAPPKEY);
    if (!localStorageData) {
      return [];
    }
    return JSON.parse(localStorageData);
  };

  function setLocalStorage (list) {
    localStorage.setItem(TODOAPPKEY, JSON.stringify(list));
  };

  var todoApp = {};
  todoApp.todoList = [];

  todoApp.getTodoRows = function () {
    this.todoList = getLocalStorage();
    return this.todoList;
  };

  todoApp.addNewTodoRow = function () {
    var title = document.getElementById("title").value;
    var summary = document.getElementById("summary").value;
    var status = document.getElementById("status").value;
    var dueDate = document.getElementById("dueDate").value;

    var newRow = {
      "uniqueId": this.todoList.length,
      "title": title,
      "summary": summary,
      "status": status,
      "dueDate": dueDate,
      "doneTodoFlag": ((status == "Done") ? true : false)
    };

    this.todoList.push(newRow);
    setLocalStorage(this.todoList);

    this.clearAddNewTodoRow();
    this.showTodoRows();
  };

  todoApp.showTodoRows = function () {
    var todoRowsContainer = document.getElementById("todoRows");

    var finalHTML = "";
    var todoListLength = this.todoList.length;
    if (todoListLength) {
      for (var i = 0; i < todoListLength; i++) {
        var source = $("#todoRowTemplate").html();
        var template = Handlebars.compile(source);
        finalHTML += template(this.todoList[i]);
      }
    } else {
      finalHTML += "<h4>No entry so far.</h4>";
    }

    todoRowsContainer.innerHTML = finalHTML;

    var self = this;
    todoRows = todoRowsContainer.getElementsByClassName("row");
    for (var i = 0; i < todoRows.length; i++) {
      todoRows[i].addEventListener("dragstart", function (event) {
        self.todoRowDragStart(event);
      });
      todoRows[i].addEventListener("touchstart", function (event) {
        self.todoRowTouchStart(event);
      });
    }
  };

  todoApp.clearAddNewTodoRow = function () {
    var allInputs = document.getElementsByTagName("input");
    for (var i = 0; i < allInputs.length; i++) {
      allInputs[i].value = "";
    }
    var selectInput = document.getElementById("status");
    selectInput.value = "Due";
  };

  todoApp.deleteTodoRow = function (event) {
    var targetElement = event.target;
    if (targetElement.id == "deleteTodo") {
      this.todoList.splice(targetElement.parentNode.parentNode.id, 1);
      this.reIndexTodos();
      setLocalStorage(this.todoList);

      this.showTodoRows();
    }
  };

  todoApp.reIndexTodos = function () {
    var todoListLength = this.todoList.length;
    for (var i = 0; i < todoListLength; i++) {
      this.todoList[i].uniqueId = i;
    }
  };

  todoApp.initEvents = function () {
    var self = this;

    var addTodoButton = document.getElementById("addTodo");
    addTodoButton.addEventListener("click", function () {
      self.addNewTodoRow();
    });

    var clearTodoButton = document.getElementById("clearTodo");
    clearTodoButton.addEventListener("click", function () {
      self.clearAddNewTodoRow();
    });

    var todoRowsContainer = document.getElementById("todoRows");
    todoRowsContainer.addEventListener("click", function (event) {
      self.deleteTodoRow(event);
    });
    todoRowsContainer.addEventListener("touchend", function (event) {
      self.deleteTodoRow(event);
    });
    todoRowsContainer.addEventListener("dragover", function (event) {
      event.preventDefault();
    });
    todoRowsContainer.addEventListener("touchmove", function (event) {
      event.preventDefault();
    });
    todoRowsContainer.addEventListener("drop", function (event) {
      self.dropTodoRow(event);
    });
    todoRowsContainer.addEventListener("touchend", function (event) {
      self.dropTodoRow(event);
    });
  };

  todoApp.dropTodoRow = function (event) {
    event.preventDefault();

    var draggedElement = null;
    var draggedElementId = null;
    var droppedOverElement = null;

    if (event.dataTransfer) {
      draggedElementId = event.dataTransfer.getData("draggedElementId");
      draggedElement = document.getElementById(draggedElementId);
      droppedOverElement = event.target.parentNode;
    } else {
      draggedElement = this.draggedElement;
      draggedElementId = draggedElement.id;
      var changedTouch = event.changedTouches[0];
      droppedOverElement = document.elementFromPoint(changedTouch.clientX, changedTouch.clientY);
      droppedOverElement = droppedOverElement.parentNode;
    }

    if (droppedOverElement.parentNode == draggedElement) {
      return;
    }

    var draggedElementNextSibling = draggedElement.nextSibling;
    var draggedElementPreviousSibling = draggedElement.previousSibling;
    var droppedOverElementId = droppedOverElement.id;

    var todoRowsContainer = document.getElementById("todoRows");
    todoRowsContainer.insertBefore(draggedElement, droppedOverElement);
    if (draggedElementNextSibling) {
      todoRowsContainer.insertBefore(droppedOverElement, draggedElementNextSibling);
    } else {
      todoRowsContainer.insertAfter(droppedOverElement, draggedElementPreviousSibling);
    }

    var draggedElement = this.todoList[draggedElementId];
    this.todoList[draggedElementId] = this.todoList[droppedOverElementId];
    this.todoList[droppedOverElementId] = draggedElement;

    this.reIndexTodos();
    setLocalStorage(this.todoList);
    this.showTodoRows();
  };

  todoApp.todoRowDragStart = function (event) {
    event.dataTransfer.setData("draggedElementId", event.target.id);
  };

  todoApp.todoRowTouchStart = function (event) {
    this.draggedElement = event.currentTarget;
  };

  todoApp.init = function () {
    todoApp.getTodoRows();
    todoApp.showTodoRows();
    this.initEvents();
  };

  return todoApp;
}

// Init.
var todoApp = returnTodoApp();
todoApp.init();







