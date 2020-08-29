import React, { ReactElement } from 'react';
import { Route, Switch } from 'react-router-dom';
import Header from './components/header';
import Stopwatch from './components/pages/stopwatch';
import MyRecords from './components/pages/myRecords';
import DetailRecord from './components/pages/detailRecord';
import StatisticOfUsers from './components/pages/statisticOfUsers';
import './App.css';

function App(): ReactElement {
  return (
    <div className="App" aria-live="assertive">
      <Header />
      <Switch>
        <Route exact path="/myRecords/:id">
          <DetailRecord />
        </Route>

        <Route exact path="/myRecords">
          <MyRecords />
        </Route>

        <Route exact path="/statisticOfUsers">
          <StatisticOfUsers />
        </Route>

        <Route path="/">
          <Stopwatch />
        </Route>
      </Switch>
    </div>
  );
}

export default App;
