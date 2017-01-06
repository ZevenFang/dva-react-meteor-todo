import asteriod from '../common/asteroid';

function createReacteor(opts = {}) {

  let onAction = ({ getState }) => (next) => (action) => {
    let _action = action.type.split('/');
    let namespace = _action[0];
    let type = _action[1];
    if (_action.length===2) {
      switch (type) {
        case '@getAll':
          asteriod.call('getAll', namespace).then(data=>{
            next({type: namespace+'/@getAllAsync', data});
          });
          break;
        case '@find':
          asteriod.call('find', namespace, action.query).then(data=>{
            next({type: namespace+'/@findAsync', data});
          });
          break;
        case '@add':
          asteriod.call('insert', namespace, action.row);
          break;
        case '@del':
          asteriod.call('remove', namespace, action.id);
          break;
        case '@upd':
          asteriod.call('update', namespace, action.row);
          break;
      }
    }
    next(action);
  };

  return {
    onAction
  };

}

export default createReacteor;
