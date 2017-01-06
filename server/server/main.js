import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base'

// declare MongoDB collection here
//
// Read more: http://guide.meteor.com/collections.html
const collections = {
  'todo': new Meteor.Collection('todo')
};

Object.keys(collections).map(k=> {
  Meteor.publish(k, function () {
    return collections[k].find();
  });
});

// We can publish some data (here all)
// we will be able to subscribe to the data later in the client app
// remember that this is not secured, all can subscribe to all data from the client side, just demo purposes
//
// Read more: http://guide.meteor.com/data-loading.html
Meteor.publish('user', function () {
  return Meteor.users.find({_id: this.userId});
});

// We can also use server side methods and call them from our client app
// here we just fetch all documents from the collection
// again, remember that this is not secured, all can call it from the client side, just demo purposes
//
// Read more: http://guide.meteor.com/methods.html
Meteor.methods({
  getAll(namespace) {
    return collections[namespace].find().fetch();
  },
  find(namespace, query) {
    return collections[namespace].find(query).fetch();
  },
  insert(namespace, row) {
    return collections[namespace].insert(row);
  },
  remove(namespace, id) {
    if (typeof id === 'object')
      return collections[namespace].remove({_id: {$in: id}});
    return collections[namespace].remove({_id: id});
  },
  update(namespace, row) {
    let _id = row.id;
    delete row.id;
    return collections[namespace].update({_id}, {$set: row});
  }
});

// Example user - just a simple example without validation etc.
// Read more at: https://guide.meteor.com/accounts.html
Meteor.startup(() => {
});