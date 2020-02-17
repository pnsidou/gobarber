import React from 'react';
import { Switch, Route } from 'react-router-dom';

import SignIn from '../pages/SignIn';
import SignUp from '../pages/SignUp';

import Dashboard from '../pages/Dashboard';
import Profile from '../pages/Profile';

export default function Routes() {
  return (
    <Switch>
      <Route path="/" exact compoment={SignIn} />
      <Route path="/register" compoment={SignUp} />

      <Route path="/dashboard" compoment={Dashboard} />
      <Route path="/profile" compoment={Profile} />
    </Switch>
  );
}
