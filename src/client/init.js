'use strict';
require('./style/main.styl');
require('./polyfill.js');

window.hasVal = (val) => {
  return typeof val !== 'undefined' && val !== null;
};
window.$ = require('utils/dom.js').$;

Element.prototype.requestPointerLock = Element.prototype.requestPointerLock || Element.prototype.mozRequestPointerLock;
document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;

const $window = $(window);
$window.on('keydown.general', evt =>{
  window.CTRL_KEY = evt.ctrlKey;
  window.ALT_KEY = evt.altKey;
}).on('keyup.general', evt => {
    window.CTRL_KEY = evt.ctrlKey;
  window.ALT_KEY = evt.altKey;
});

const React = require('react');
const ReactDOM = require('react-dom');
const {Router, Route, browserHistory } = require('react-router');
const {Provider} = require('react-redux');

const store = require('./store.js').store;
const Home = require('./routes/Home');
const Editor = require('./routes/Editor'); 
console.log('init');
ReactDOM.render((
  <Provider store={store}>
    <Router history={browserHistory }>
      <Route path="/" component={Home} />
      <Route path="/editor(/:id)" component={Editor} />
    </Router>
  </Provider>
), document.getElementById('root'));