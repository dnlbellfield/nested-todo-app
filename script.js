  var ENTER_KEY = 13;
	var ESCAPE_KEY = 27;

  var helper = {
    createId: function() {
      var i;
      var random;
      var id = '';
  
      for (var i = 0; i < 12; i++) {
        random = Math.random() * 8 | 0;
        if (i === 4 || i === 8) {
            id += '-';
        }
        id += (random).toString();
    }
      return id;
    },
    
    pluralize: function (count, word) {
			return count === 1 ? word : word + 's';
		},
    store: function (name, data) {
			if (arguments.length > 1) {
				return localStorage.setItem(name, JSON.stringify(data));
			} else {
				var store = localStorage.getItem(name);
				return (store && JSON.parse(store)) || [];
			}
		}

  };

  var App = {
    
    init: function() {
      this.todos = helper.store("todos-daniel");
      this.store(); // new method, replaces util.store("todos-jquery", this.todos) in render();
      this.bindEvents();
      this.render();
      
    },
    //runs helper method store, which saves data, use with render to save then display
    store: function() {
      helper.store("todos-daniel", this.todos);
    },
    bindEvents: function () { //bind event to HTML element 
      
      var todoList = document.getElementById('todo-list');
      
			document.getElementById('new-todo').addEventListener('keyup', this.create.bind(this));
			document.getElementById('toggle-all').addEventListener('change', this.toggleAll.bind(this));
      document.getElementById('footer').addEventListener('click', function (event) {
      var clearCompletedButton = document.getElementById('clear-completed');
        if (event.target === clearCompletedButton) {
          this.destroyCompleted();
        }
      }.bind(this));
  
			todoList.addEventListener('change', function (event) {
        if (event.target.className === 'toggle') {
          this.toggle(event);
        }
      }.bind(this));
      //desktop
      todoList.addEventListener('dblclick', function (event) {
        if (event.target.localName === 'label') {
          this.edit(event);
        }
      }.bind(this));
      //mobile
      todoList.addEventListener('click', function (event) {
        if (event.target.localName === 'label') {
          this.edit(event);
        }
      }.bind(this));
      
      todoList.addEventListener('keyup', function (event) {
        if (event.target.className === 'edit') {
          this.editKeyup(event);
        }
      }.bind(this));
      
      todoList.addEventListener('focusout', function (event) {
        if (event.target.className === 'edit') {
          this.update(event);
        }
      }.bind(this));
      
       todoList.addEventListener('click', function (event) {
        if (event.target.className === 'destroy') {
          this.destroy(event);
        }
      }.bind(this));
      
		},
    render: function () {
			var todos = this.getFilteredTodos();
      var newTodoTemplate = "";
      
      todos.forEach( function (todo, position) {
        var id = todos[position].id;
        var title = todos[position].title;
        var completed = todos[position].completed;
        // newTodo = newTodo + (new template with string interpolation)
        newTodoTemplate +=
      `<li ${completed ? "class = completed" : ""} data-id = ${id}>` +
      "<div class = 'view'>" +
      `<input class = toggle type = checkbox ${completed ? "checked" : ""}>` +
      `<label>${title}</label>` +
      "<button class='destroy'></button>" +
      "</div>" +
      `<input class = edit value=${title}>` +
      "</li>";
        
      }, this);
      // assign 'text'/innerhtml of todoList Ul with our newTodo 
			document.getElementById('todo-list').innerHTML = newTodoTemplate;
  
      
			//$('#main').toggle(todos.length > 0);
      if (todos.length > 0) {
        document.getElementById('main').style.display = "block";
      } else {
        document.getElementById('main').style.display = "none";
      };
			document.getElementById('toggle-all').checked = this.getActiveTodos().length === 0;
			this.renderFooter();
			document.getElementById('new-todo').focus();
		
		},
		renderFooter: function () {
			var todoCount = this.todos.length;
			var activeTodoCount = this.getActiveTodos().length;
		  var activeTodoWord = helper.pluralize(activeTodoCount, 'item');
			var completedTodos = todoCount - activeTodoCount;
			var filter = this.filter;
			var template = `<span id="todo-count"><strong>${activeTodoCount}</strong> ${activeTodoWord} left on your todo list</span>` +
			`${completedTodos ? "<button id=clear-completed>Clear completed</button>" : ""}`;
      
      if (todoCount > 0) {
        document.getElementById('footer').innerHTML = template;
        document.getElementById('footer').style.display = "block";
      } else {
        document.getElementById('footer').style.display = "none";
      };
		},
		toggleAll: function (e) {
			var isChecked = e.target.checked;

			this.todos.forEach(function (todo) {
				todo.completed = isChecked;
			});
      this.store();
			this.render();
		},
		getActiveTodos: function () {
			return this.todos.filter(function (todo) {
				return !todo.completed;
			});
		},
		getCompletedTodos: function () {
			return this.todos.filter(function (todo) {
				return todo.completed;
			});
		},
		getFilteredTodos: function () {
			if (this.filter === 'active') {
				return this.getActiveTodos();
			}

			if (this.filter === 'completed') {
				return this.getCompletedTodos();
			}

			return this.todos;
		},
		destroyCompleted: function () {
			this.todos = this.getActiveTodos();
			this.filter = 'all';
			this.store();
      this.render();
      
		},
		// accepts an element from inside the `.item` div and
		// returns the corresponding index in the `todos` array
		indexFromEl: function (el) {
			var id = el.closest('li').dataset.id;
			var todos = this.todos;
			var i = todos.length;

			while (i--) {
				if (todos[i].id === id) {
					return i;
				}
			}
		},
		create: function (e) {
			var input = e.target;
			var val = input.value.trim();

			if (e.which !== ENTER_KEY || !val) {
				return;
			}

			this.todos.push({
				id: helper.createId(),
				title: val,
				completed: false
			});

			input.value = '';
      this.store();
			this.render();
		},
		toggle: function (e) {
			var i = this.indexFromEl(e.target);
			this.todos[i].completed = !this.todos[i].completed;
      this.store();
			this.render();
		},
		edit: function (e) {
			var ourLi = e.target.closest('li');
      
      ourLi.classList.add('editing');
      
      var input = ourLi.querySelector('.edit');
      
			input.focus();
		},
		editKeyup: function (e) {
      var todo = e.target;
      
			if (e.which === ENTER_KEY) {
				todo.blur();
			}

			if (e.which === ESCAPE_KEY) {
				todo.dataset.abort = true; 
        todo.blur();
			}
		},
		update: function (e) {
			var el = e.target;
			var val = el.value.trim();

			if (!val) {
				this.destroy(e);
				return;
			}

			if (el.dataset.abort) {
				el.dataset.abort = false;
			} else {
				this.todos[this.indexFromEl(el)].title = val;
			}
      this.store();
			this.render();
		},
		destroy: function (e) {
			this.todos.splice(this.indexFromEl(e.target), 1);
      this.store();
			this.render();
		}


  };
  
  App.init();
		