const express = require('express');
const cors = require('cors');

const { v4: uuid } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  let { username } = request.headers;
  let user = users.find(user => user.username === username);
  
  if (!user) return response.status(404).json({ error: "User does not exist" });
  
  request.user = user;
  
  return next();
};

function checksDoesntExistUsername(request, response, next) {
  let { username } = request.body;

  if (users.some(user => user.username === username))
    return response.status(400).json({ error: "Username already exists" });
  
  return next();
};

function checksExistsTodo(request, response, next) {
  let { user } = request;
  let { id } = request.params;

  let todo = user.todos.find(todo => todo.id == id);

  if(!todo) return response.status(404).json({ error: "Todo does not exist" });

  request.todo = todo;

  return next();
};

app.post('/users', checksDoesntExistUsername, (request, response) => {
  let { username, name } = request.body;
  let user = {
    id: uuid(),
    username,
    name,
    todos: []
  };

  users.push(user);

  return response.status(201).send(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  let { todos } = request.user;
  return response.status(200).send(todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  let { user } = request;
  let { title, deadline } = request.body;
  let todo = {
    id: uuid(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  };

  user.todos.push(todo);

  return response.status(201).send(todo);
});

app.put('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  let { todo } = request;
  let { title, deadline } = request.body;

  todo.title = title;
  todo.deadline = deadline;

  return response.status(200).send(todo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  let { todo } = request;
  
  todo.done = true;

  return response.status(200).send(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, checksExistsTodo, (request, response) => {
  let { user, todo } = request;

  user.todos.splice(todo, 1);

  return response.status(204).send(); 
});

module.exports = app;