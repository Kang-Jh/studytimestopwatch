import React, { ReactElement } from 'react';
import { Route, Switch } from 'react-router-dom';
import Header from './components/header';
import Stopwatch from './components/stopwatch';
import MyRecords from './components/myRecords';
import './App.css';

function App(): ReactElement {
  return (
    <div className="App" aria-live="assertive">
      <Header />
      <Switch>
        <Route path="/myRecords">
          <MyRecords />
        </Route>

        <Route path="/">
          <Stopwatch />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
