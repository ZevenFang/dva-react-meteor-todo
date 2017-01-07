import { createReacteor } from '../utils/reacteor';

// Connect to a Meteor backend
const reacteor = createReacteor({host: 'localhost', port: '3000'});

export default reacteor;
