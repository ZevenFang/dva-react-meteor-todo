import { createClass } from 'asteroid';

const Asteroid = createClass();
// Connect to a Meteor backend
const asteroid = new Asteroid({
  endpoint: 'ws://localhost:3000/websocket',
});

// if you want realitme updates in all connected clients
// subscribe to the publication
asteroid.subscribe('todo');
asteroid.subscribe('user');

export default asteroid;
