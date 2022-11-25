import axios from 'axios';

export default {
  set: (token) => {
    axios.defaults.headers.common['authorization'] = token;
  },
  delete: () => {
    delete axios.defaults.headers.common['authorization'];
  },
};
