let chai = require('chai');
let assert = chai.assert;
let request = require('./requestSimulator.js');
process.env.COMMENT_STORE = "./testStore.json";
let app = require('../app.js');
let th = require('./testHelper.js');

describe('app', () => {
  describe('GET /bad', () => {
    it('resonds with 404', done => {
      request(app, {
        method: 'GET',
        url: '/bad'
      }, (res) => {
        assert.equal(res.statusCode, 404);
        done();
      })
    })
  })

  describe('GET /', () => {
    it('should serve login.html', done => {
      request(app, {
        method: 'GET',
        url: '/'
      }, (res) => {
        th.status_is_ok(res);
        th.body_contains(res, 'TODO APP');
        done();
      })
    })
  })

  describe('GET /login.html', () => {
    it('should take logged out user to login page', done => {
      request(app, {
        method: 'GET',
        url: '/login'
      }, res => {
        th.status_is_ok(res);
        th.content_type_is(res, 'text/html');
        th.body_contains(res, 'TODO APP');
        done();
      })
    })

    it('should give user\'s home page for a logged in user',done=>{
      request(app, {
        method: 'GET',
        url: '/login',
        headers: {cookie:"sessionid=1516430776870; user=ankurrai"}
      }, res => {
        th.should_be_redirected_to(res,'home');
        done();
      })
    })
  })

  describe('GET /image/todo.jpg', () => {
    it('serves the image', done => {
      request(app, {
        method: 'GET',
        url: '/image/todo.jpg'
      }, res => {
        th.status_is_ok(res);
        th.content_type_is(res, 'image/jpg');
        done();
      })
    })
  })

  describe('GET /script/showTodoList.js', () => {
    it('serves the list of todo page', done => {
      request(app, {
        method: 'GET',
        url: '/script/showTodoList.js',
        headers: {cookie:"sessionid=1516430776870; user=ankurrai"}
      }, res => {
        th.status_is_ok(res);
        th.content_type_is(res, 'text/js');
        th.body_contains(res, 'getAllTodo');
        done();
      })
    })
  })
  describe('GET /loginPage.html', () => {
    it('serves the login page', done => {
      request(app, {
        method: 'GET',
        url: '/login'
      }, res => {
        th.status_is_ok(res);
        th.body_contains(res, 'Name :');
        done();
      })
    })
  })

  describe('POST /login', () => {
    it('redirects to loginPage for valid user', done => {
      request(app, {
        method: 'POST',
        url: '/login',
        body: 'userName=ankurrai&password=ankur'
      },
      res => {
        th.should_be_redirected_to(res, 'home');
        th.should_not_have_cookie(res, 'message');
        done();
      })
    })
    it('redirects to login.html with message for invalid user', done => {
      request(app, {
        method: 'POST',
        url: '/login',
        body: 'username=badUser'
      }, res => {
        th.should_be_redirected_to(res, 'login');
        th.should_have_expiring_cookie(res, 'message', 'login failed');
        done();
      })
    })
  })

  describe('GET unpermitted files',function () {
    it('should not allow unlogged user to access unpermitted files',done=>{
      request(app, {
        method: 'GET',
        url: '/home.html',
      }, res => {
        th.should_be_redirected_to(res,'login');
        // th.should_have_expiring_cookie(res, 'message', 'Kindly login for more access');
        done();
      })
    })
  })
})
