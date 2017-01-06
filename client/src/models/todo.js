/**
 * Created by fangf on 2017/1/5.
 */

export default {
  namespace: 'todo',
  state: {
    data: []
  },
  reducers: {
    del(state, {index}){
      state.tasks.splice(index,1);
      return {...state};
    },
    upd(state, {index, text}){
      state.tasks[index].text = text;
      return {...state};
    },
    check(state, {index}){
      state.tasks[index].completed = !state.tasks[index].completed;
      return {...state};
    }
  }
}
