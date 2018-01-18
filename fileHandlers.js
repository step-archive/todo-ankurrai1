const fs = require('fs');

let validUsers = [{
    userName: 'ankurrai',
    password: 'ankur'
  },
  {
    userName: 'yogi',
    password: 'yogi'
  }
];

let session = {};

//-------------------------------helpers------------------------------------//

const getContentType = function(filePath) {
  let fileExt = filePath.split(".").slice(-1)[0];
  let headers = {
    "pdf": "application/pdf",
    "js": "text/js",
    "html": "text/html",
    "css": "text/css",
    "jpg": "image/jpg",
    "gif": "image/gif"
  };
  return headers[fileExt];
};

const getAllTodo = function(userName) {
  let content = fs.readFileSync('./data/data.json', 'utf8');
  let users = JSON.parse(content);
  let todos = users[userName] || {};
  return todos;
};

const validateUser = function(req, resp) {
  if (!req.cookies.sessionid)
    redirectInvalidUser(resp)
};

const redirectInvalidUser = function(resp) {
  resp.setHeader('Set-Cookie', `message=login failed; Max-Age=5`);
  resp.redirect('login');
};

const setCookie = function(resp, user) {
  let sessionid = new Date().getTime();
  user.sessionid = sessionid;
  resp.setHeader('Set-Cookie', [`sessionid=${sessionid}`, `user=${user.userName}`]);
};

const getValidUser = function(req) {
  let userName = req.body.userName;
  let password = req.body.password;
  return validUsers.find(ValidUser => {
    return ValidUser.userName == userName && ValidUser.password == password;
  });
};

const hasAskedForToDo = (req) => {
  return req.method == 'GET' && req.url.startsWith('/todo_');
}

const serveTodo = function(req, title) {
  let userName = req.cookies[' user'] || '';
  let todos = getAllTodo(userName);
  console.log(todos);
  let todo = todos[title];
  resp.serve(todo);
};

//-----------------------------handlers----------------------------------//

const serveLanding = function(req, resp) {
  let data = fs.readFileSync('./public/login.html', 'utf8');
  data = data.replace('loginFailedMessage', req.cookies.message || '');
  resp.setHeader('Content-Type', 'text/html');
  resp.serve(data);
}

const serveRegularFile = function(req, resp) {
  let filePath = req.url;
  fs.readFile(`./public${filePath}`, (error, data) => {
    if (error) return resp.respondWithError();
    resp.setHeader('Content-Type', getContentType(filePath))
    resp.serve(data);
  });
};

const serveHomePage = function(req, resp) {
  let data = fs.readFileSync(`./public/home.html`, 'utf8')
  let userName = req.cookies[' user'] || '';
  data = data.replace('user', userName);
  resp.serve(data);
};

const handleLogin = function(req, resp) {
  let user = getValidUser(req);
  if (!user) {
    redirectInvalidUser(resp);
    return;
  }
  setCookie(resp, user);
  resp.redirect('home');
};

const logoutUser = function(req, resp) {
  resp.setHeader('Set-Cookie', [`sessionid=0; Max-Age=0`, `user=''; Max-Age=0`]);
  resp.redirect('login');
};

const handleNewTodo = function(req, resp) {
  validateUser(req, resp)
  let fileContent = fs.readFileSync('./public/newTodo.html', 'utf8');
  resp.serve(fileContent)
};

const storeNewTodo = function(req, resp) {
  validateUser(req, resp);
  console.log(req.body);
};

const respondWithTodo = function(req, resp) {
  let userName = req.cookies[' user'] || '';
  let todoId = req.cookies[' todoId'] || '';
  let todos = getAllTodo(userName);
  let todo =todos.find((todo)=>todo.id==todoId);
  todo=JSON.stringify(todo);
  resp.serve(todo);
};

const respondWithTodos = function(req, resp) {
  let userName = req.cookies[' user'] || '';
  let todos = getAllTodo(userName);
  let todoAsString = JSON.stringify(todos);
  resp.serve(todoAsString);
};

const setTitle = function(req, resp) {
  let requstUrl = req.url
  if (hasAskedForToDo(req)) {
    let todoId = requstUrl.substr(requstUrl.lastIndexOf("_") + 1);
    resp.setHeader('Set-Cookie', `todoId=${todoId}; Max-Age=10`);
    resp.redirect('todoToEdit');
  }
};

const respondEditPage = function(req, resp) {
  let todoEditPage = fs.readFileSync('./public/editTodo.html', 'utf8');
  resp.serve(todoEditPage)
};

module.exports = {
  handleNewTodo,
  serveHomePage,
  logoutUser,
  serveLanding,
  handleLogin,
  serveRegularFile,
  storeNewTodo,
  setTitle,
  respondEditPage,
  respondWithTodos,
  respondWithTodo,
}
