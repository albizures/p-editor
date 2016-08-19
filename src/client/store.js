const { createStore, combineReducers, compose, applyMiddleware } = require('redux');
const thunk = require('redux-thunk').default;

const Editor = require('./routes/Editor/ducks');
const Home = require('./routes/Home/ducks');

function sprites(state = [], action) {
  switch (action.type) {
    case 'ADD_SPRITE':
      return state.concat([action.sprite]);
    case 'ADD_SPRITES':
      return state.concat(action.sprites);
    default:
      return state;
  }
}


const reducers = combineReducers({
  Editor : Editor.reducer,
  Home : Home.reducer
});


const initialState = {
  Editor : Editor.initialState,
  Home : Home.initialState
};

const store = exports.store = createStore(
  reducers,
  initialState,
  compose(
    applyMiddleware(thunk),
    window.devToolsExtension && window.devToolsExtension()
  )
);




