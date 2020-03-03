import { Alert } from 'react-native';
import { takeLatest, call, put, all } from 'redux-saga/effects';

import api from '~/services/api';
//import history from '~/services/history';
import { signInSuccess, signFailure } from './actions';

export function* signIn({ payload }) {
  try {
    const { email, password } = payload;

    const response = yield call(api.post, 'sessions', { email, password });

    const { token, user } = response.data;

    if (user.provider) {
      Alert.alert(
        'Falha na autenticação',
        'Usuário não é prestador de serviço'
      );
      yield put(signFailure());
      return;
    }

    api.defaults.headers.Authorization = `Bearer: ${token}`;

    yield put(signInSuccess(token, user));

    //history.push('/dashboard');
  } catch (err) {
    yield put(signFailure());
    Alert.alert(
      'Falha na autenticação',
      'Houve um erro no login,  Verifique seus dados.'
    );
  }
}

export function* signUp({ payload }) {
  try {
    const { name, email, password } = payload;

    yield call(api.post, 'users', {
      name,
      email,
      password,
    });

    //history.push('/');
  } catch (err) {
    Alert.alert(
      'Falha no cadastro',
      'Houve um erro no cadastro,  verifique seus dados'
    );

    yield put(signFailure);
  }
}

function setToken({ payload }) {
  if (!payload) return;

  const { token } = payload.auth;

  if (token) {
    api.defaults.headers.Authorization = `Bearer: ${token}`;
  }
}

export function signOut() {
  //history.push('/');
}

export default all([
  takeLatest('persist/REHYDRATE', setToken),
  takeLatest('@auth/SIGN_IN_REQUEST', signIn),
  takeLatest('@auth/SIGN_UP_REQUEST', signUp),
  takeLatest('@auth/SIGN_OUT', signOut),
]);