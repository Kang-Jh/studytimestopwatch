import React, { useState } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Header, Nav } from './components/HeaderAndNav/HeaderAndNav';
import Stopwatch from './pages/stopwatch';
import MyRecords from './pages/myRecords';
import DetailRecord from './pages/detailRecord';
import StatisticOfUsers from './pages/statisticOfUsers';
import './App.css';

function App() {
  const [isMenuOpened, setIsMenuOpened] = useState(false);

  const onMenuClicked = () => {
    setIsMenuOpened((state) => !state);
  };

  return (
    <div className="App" aria-live="assertive">
      <Header onMenuClicked={onMenuClicked} />
      <Nav isMenuOpened={isMenuOpened} onMenuClicked={onMenuClicked} />
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
