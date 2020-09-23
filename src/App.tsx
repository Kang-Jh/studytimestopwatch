import React, { useState, ReactElement } from 'react';
import { Route, Switch } from 'react-router-dom';
import HeaderAndNav from './components/HeaderAndNav/HeaderAndNav';
import Stopwatch from './pages/stopwatch';
import MyRecords from './pages/myRecords';
import DetailRecord from './pages/detailRecord';
import StatisticOfUsers from './pages/statisticOfUsers';
import './App.css';

function App(): ReactElement {
  const [isMenuOpened, setIsMenuOpened] = useState(false);

  const onMenuClicked = () => {
    setIsMenuOpened((state) => !state);
  };

  return (
    <div className="App" aria-live="assertive">
      <HeaderAndNav isMenuOpened={isMenuOpened} onMenuClicked={onMenuClicked} />
      <main
        onClick={() => {
          if (window.innerWidth < 600) {
            setIsMenuOpened(false);
          }
        }}
      >
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
      </main>
    </div>
  );
}

export default App;
