import axios from 'axios';
import reactCookies from 'react-cookies';
import jwtDecode from 'jwt-decode';
import requestToken from '../utils/requestToken';
import {
  AUTH_REQUEST_PENDING,
  AUTH_REQUEST_FULFILLED,
  SIGN_UP,
  SIGN_IN,
  SIGN_IN_AS,
  SIGN_IN_VIA_TOKEN,
  LOG_OUT,
  ACCEPT_AGREEMENT,
  CREATE_BILLING_DETAILS, GENERATE_ADVERTISER_KEY, AUTH_REQUEST_FULFILLED_ERROR,
} from '../constants/auth';
import {GENERATE_PUBLISHER_KEY} from '../constants/auth';
import {NotificationManager} from 'react-notifications';
import {SET_KEY_BY_ADMIN, ADVERTISER, PUBLISHER, SET_API_KEY_TO_ADVERTISER_BY_ADMIN} from '../constants/user';

axios.defaults.baseURL = __INTERNAL_API_URL__;

export const signUp = (data, history) => (dispatch) => {
  dispatch({
    type: AUTH_REQUEST_PENDING,
  });

  return axios.post('/auth/signup', data)
      .then((response) => {
        const {data: {token, user, billingDetails}} = response;

        /*
    requestToken.set(token);
    reactCookies.save('token', token, {path: '/'});

    dispatch({
      type: SIGN_UP,
      data: {
        user,
        billingDetails,
      },
    });
    */
        dispatch({
          type: AUTH_REQUEST_FULFILLED,
        });
        history.push('/thank-you-page');
      });
};

export const signIn = (data, history) => (dispatch) => {
  dispatch({
    type: AUTH_REQUEST_PENDING,
  });
  return axios.post('/auth/signin', data)
      .then((response) => {
        const {data: {token, user, billingDetails}} = response;
        requestToken.set(token);
        reactCookies.save('token', token, {path: '/'});
        dispatch({
          type: SIGN_IN,
          data: {
            user,
            billingDetails,
          },
        });
        dispatch({
          type: AUTH_REQUEST_FULFILLED,
        });
        switch (user.role) {
          case ADVERTISER:
          case PUBLISHER:
            if (user.isAcceptedAgreement) {
              history.push('/dashboard');
            } else {
              history.push('/agreement-page');
            }
            break;
          default:
            history.push('/dashboard');
        }
      });
};

export const signInAs = (admin, account, history) => (dispatch) => {
  window.localStorage.routeBackToAdmin = location.pathname;

  dispatch({type: AUTH_REQUEST_PENDING});

  const data = {
    adminEmail: admin.email,
    password: 'fake-password',
    account: {role: account.role, email: account.email},
  };

  return axios.post('/auth/signin-as', data).then((response) => {
    const {data: {token, user, billingDetails}} = response;

    requestToken.set(token);
    reactCookies.save('token', token, {path: '/'});

    // const url = `${location.protocol}//${location.hostname}${(location.port ? ':' + location.port : '')}`;
    // window.location.href = `${url}/advertiser/dashboard`;

    dispatch({
      type: SIGN_IN_AS,
      data: {user, billingDetails},
    });
    dispatch({type: AUTH_REQUEST_FULFILLED});
    if (user.isAcceptedAgreement) {
      history.push('/dashboard');
    } else {
      history.push('/agreement-page');
    }
  });
};

export const signInViaToken = () => (dispatch) => {
  if (reactCookies.load('token')) {
    dispatch({
      type: AUTH_REQUEST_PENDING,
    });

    const token = reactCookies.load('token');
    requestToken.set(token);

    const userId = jwtDecode(token).sub;
    const role = jwtDecode(token).role;
    const loginAs = !!jwtDecode(token).idAdmin;

    axios.post('/auth/get-user', {id: userId, role, loginAs}).then((response) => {
      const {data} = response;
      dispatch({type: SIGN_IN_VIA_TOKEN, data});
      dispatch({type: AUTH_REQUEST_FULFILLED});
    }).catch((e) => {
      console.error(e.message);
      dispatch({
        type: AUTH_REQUEST_FULFILLED_ERROR,
      });
    });
  }
};

export const logout = (history) => (dispatch) => {
  requestToken.delete();
  reactCookies.remove('token', {path: '/'});
  dispatch({type: LOG_OUT});
  history.push('/login');
};

export const backToAdmin = (auth, history) => async (dispatch) => {
  const tokenJwf = reactCookies.load('token');
  const adminId = jwtDecode(tokenJwf).idAdmin;
  const role = auth.currentUser.role;
  const route = role === ADVERTISER ? '/advertisers' : '/publishers';
  history.push(route);
  dispatch({
    type: AUTH_REQUEST_PENDING,
  });
  const {data} = await axios.post('/auth/back-to-admin', {adminId});
  const {token, user, billingDetails} = data;
  requestToken.set(token);
  reactCookies.save('token', token, {path: '/'});

  dispatch({
    type: SIGN_IN,
    data: {user, billingDetails},
  });
  dispatch({type: AUTH_REQUEST_FULFILLED});
};

export const acceptAgreement = (data, history) => (dispatch) => {
  dispatch({
    type: AUTH_REQUEST_PENDING,
  });
  axios.post('/user/accept-agreement', data).then(() => {
    dispatch({
      type: ACCEPT_AGREEMENT,
    });
    dispatch({
      type: AUTH_REQUEST_FULFILLED,
    });
    history.push('/dashboard');
  });
};

export const createBillingDetails = (data) => (dispatch) => {
  return axios.post('/database/create/billing-details', data).then(({data}) => {
    dispatch({
      type: CREATE_BILLING_DETAILS,
      data: {
        billingDetails: data,
      },
    });
  });
};

export const generatePublisherKey = (id) => (dispatch) => {
  if (_.isNumber(id)) {
    return axios.get(`/user/generate-api-key?pubId=${id}`)
        .then(({data}) => {
          dispatch({
            type: SET_KEY_BY_ADMIN,
            data,
          });
          NotificationManager.success('Key generated');
          return data;
        })
        .catch((e) => {
          console.log(e);
        });
  } else {
    axios.get('/user/generate-api-key')
        .then(({data}) => {
          dispatch({
            type: GENERATE_PUBLISHER_KEY,
            data,
          });
          NotificationManager.success('Key generated');
        })
        .catch((e) => {
          console.log(e);
        });
  }
};

export const generateAdvertiserApiKey = (id) => (dispatch) => {
  if (_.isNumber(id)) {
    axios.put(`/advertiser/generate-api-key/${id}`)
        .then(({data}) => {
          dispatch({
            type: SET_API_KEY_TO_ADVERTISER_BY_ADMIN,
            data,
          });
          NotificationManager.success('Key generated');
        })
        .catch((e) => {
          console.log(e);
        });
  }
};
