import React, { useState, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Header, Nav } from './components/HeaderAndNav/HeaderAndNav';
import Stopwatch from './pages/stopwatch';
import MyRecords from './pages/myRecords';
import DetailRecord from './pages/detailRecord';
import StatisticOfUsers from './pages/statisticOfUsers';
import './App.css';

function App() {
  const [isMenuOpened, setIsMenuOpened] = useState(
    window.innerWidth < 960 ? false : true
  );
  const [isMediumWidth, setIsMediumWidth] = useState(
    window.innerWidth < 960 ? true : false
  );

  const onMenuClicked = () => {
    setIsMenuOpened((state) => !state);
  };

  // resize effect
  useEffect(() => {
    let rAF: number;
    function resizeHandler() {
      cancelAnimationFrame(rAF);

      rAF = requestAnimationFrame(() => {
        if (window.innerWidth < 960) {
          setIsMediumWidth(true);
          setIsMenuOpened(false);
        } else {
          setIsMediumWidth(false);
          setIsMenuOpened(true);
        }
      });
    }

    window.addEventListener('resize', resizeHandler);

    return () => {
      cancelAnimationFrame(rAF);
      window.removeEventListener('resize', resizeHandler);
    };
  }, []);

  return (
    <div
      className={`App ${isMenuOpened ? 'App-menuOpened' : ''}`}
      aria-live="assertive"
    >
      <Header onMenuClicked={onMenuClicked} showMenuButton={isMediumWidth} />
      <Nav isMenuOpened={isMenuOpened} />
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
      <footer>test</footer>
    </div>
  );
}

export default App;
