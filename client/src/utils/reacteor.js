import { createClass } from 'asteroid';

export function createReacteor(opt = {}) {

  const Asteroid = createClass();
  let reacteor = null;
  if (opt.config)
    reacteor = new Asteroid(opt.config);
  else {
    let protocol = opt.protocol || 'ws';
    let host = opt.host || 'localhost';
    let port = opt.port || '3000';
    reacteor = new Asteroid({
      endpoint: `${protocol}://${host}:${port}/websocket`
    });
  }

  reacteor.createModels = function(...models) {
    let app = models.shift();
    // models.unshift('@@meteor');
    models.map((m,i) => {
      let model = {
        namespace: m,
        state: {
          data: [],
          query: []
        },
        effects: {
          *'@getAll'(action,{put}){
            let data = yield reacteor.call('getAll', m);
            yield put({type: '@getAllAsync', data});
          },
          *'@find'({query},{put}){
            let data = yield reacteor.call('find', m, query);
            yield put({type: '@findAsync', data});
          },
          '@add'({row}){
            reacteor.call('insert', m, row);
          },
          '@del'({id}){
            reacteor.call('remove', m, id);
          },
          '@upd'({row}){
            reacteor.call('update', m, row);
          }
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
        },
        subscriptions: {
          setup({ dispatch }) {
            reacteor.subscribe(m);
            if (i === 0) {
              reacteor.get = function (collection) {
                let type = collection===m? '@getAll':collection+'/@getAll';
                dispatch({type});
              };
              reacteor.find = function (collection) {
                let type = collection===m? '@find':collection+'/@find';
                dispatch({type});
              };
              reacteor.insert = function (collection, row) {
                let type = collection===m? '@add':collection+'/@add';
                dispatch({type, row});
              };
              reacteor.remove = function (collection, id) {
                let type = collection===m? '@del':collection+'/@del';
                dispatch({type, id});
              };
              reacteor.update = function (collection, row) {
                let type = collection===m? '@upd':collection+'/@upd';
                dispatch({type, row});
              };
              reacteor.ddp.on("added", ({collection, id, fields}) => {
                if (app._store.getState()[collection].loaded)
                  dispatch({type: '@addAsync', row: {_id: id, ...fields}});
              });
              reacteor.ddp.on('removed', ({id}) => {
                dispatch({type: '@delAsync', id});
              });
              reacteor.ddp.on('changed', ({id, fields}) => {
                dispatch({type: '@updAsync', id, fields});
              });
            }
          }
        }
      };
      app.model(model);
    });
  };

  return reacteor;

}
