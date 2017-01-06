import './index.html';
import './index.less';
import 'todomvc-app-css/index.css';
import dva from 'dva';
import asteroid from './common/asteroid';
import createReacteor from './utils/reacteor';

// 1. Initialize
const app = dva();

// 2. Plugins
app.use(createReacteor());

// 3. Model
['todo'].map(v => {
  let model = {
    namespace: v,
    state: {
      data: [],
      query: []
    },
    reducers: {
      '@getAllAsync'(state, {data}){
        state.data = data;
        state.loaded = true;
        return {...state}
      },
      '@findAsync'(state, {data}){
        state.query = data;
        state.loaded = true;
        return {...state}
      },
      '@addAsync'(state, {row}){
        state.data.push(row);
        return {...state};
      },
      '@delAsync'(state, {id}){
        state.data = state.data.filter(v=>(v._id!==id));
        return {...state};
      },
      '@updAsync'(state, {id, fields}){
        let index = state.data.findIndex(v=>(v._id===id));
        state.data[index] = {...state.data[index], ...fields};
        return {...state};
      }
    }
  };
  app.model(model);
});

// 4. Router
app.router(require('./router'));

// 5. Start
app.start('#root');

let {dispatch} = app._store;
// 6. Listen
asteroid.ddp.on("added", ({collection, id, fields}) => {
  if (app._store.getState()[collection].loaded)
    dispatch({type: collection+'/@addAsync', row: {_id: id, ...fields}});
});
asteroid.ddp.on('removed', ({collection, id}) => {
  dispatch({type: collection+'/@delAsync', id});
});
asteroid.ddp.on('changed', ({collection, id, fields}) => {
  dispatch({type: collection+'/@updAsync', id, fields});
});
