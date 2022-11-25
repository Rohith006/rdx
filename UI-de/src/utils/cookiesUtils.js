import reactCookies from 'react-cookies';

const saveToken = (token) => reactCookies.save('token', token, {path: '/'});

const removeToken = () => reactCookies.remove('token', {path: '/'});

const getToken = () => reactCookies.load('token');

export {saveToken, getToken, removeToken};
