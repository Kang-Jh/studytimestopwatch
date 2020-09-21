import React, { ReactElement } from 'react';
import { Route, Switch } from 'react-router-dom';
import HeaderAndNav from './components/HeaderAndNav/HeaderAndNav';
import Stopwatch from './pages/stopwatch';
import MyRecords from './pages/myRecords';
import DetailRecord from './pages/detailRecord';
import StatisticOfUsers from './pages/statisticOfUsers';
import './App.css';

function App(): ReactElement {
  return (
    <div className="App" aria-live="assertive">
      <HeaderAndNav />
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
