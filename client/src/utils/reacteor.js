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
    models.map(m => {
      let model = {
        namespace: m,
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
      reacteor.subscribe(m);
    });
  };

  reacteor.listen = function(app) {
    let {dispatch} = app._store;
    reacteor.ddp.on("added", ({collection, id, fields}) => {
      if (app._store.getState()[collection].loaded)
        dispatch({type: collection+'/@addAsync', row: {_id: id, ...fields}});
    });
    reacteor.ddp.on('removed', ({collection, id}) => {
      dispatch({type: collection+'/@delAsync', id});
    });
    reacteor.ddp.on('changed', ({collection, id, fields}) => {
      dispatch({type: collection+'/@updAsync', id, fields});
    });
  };

  reacteor.onReacteor = function() {
    let onAction = ({ getState }) => (next) => (action) => {
      let _action = action.type.split('/');
      let namespace = _action[0];
      let type = _action[1];
      if (_action.length===2) {
        switch (type) {
          case '@getAll':
            reacteor.call('getAll', namespace).then(data=>{
              next({type: namespace+'/@getAllAsync', data});
            });
            break;
          case '@find':
            reacteor.call('find', namespace, action.query).then(data=>{
              next({type: namespace+'/@findAsync', data});
            });
            break;
          case '@add':
            reacteor.call('insert', namespace, action.row);
            break;
          case '@del':
            reacteor.call('remove', namespace, action.id);
            break;
          case '@upd':
            reacteor.call('update', namespace, action.row);
            break;
        }
      }
      next(action);
    };
    return {
      onAction
    };
  };

  return reacteor;

}
