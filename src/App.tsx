import React, { useState, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Header, Nav } from './components/HeaderAndNav';
import Stopwatch from './pages/Stopwatch';
import MyRecords from './pages/MyRecords';
import DetailRecord from './pages/DetailRecord';
import StatisticOfUsers from './pages/StatisticOfUsers';
import CssBaseline from '@material-ui/core/CssBaseline';
import Container from '@material-ui/core/Container';
import Grid from '@material-ui/core/Grid';

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
    <div className="App" aria-live="assertive">
      <CssBaseline />
      <Container fixed>
        <Grid container>
          <Grid item xs={12}>
            <Header
              onMenuClicked={onMenuClicked}
              showMenuButton={isMediumWidth}
            />
          </Grid>

          <Grid item xs={12}>
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
          </Grid>

          <Grid item xs={12}>
            <footer
              onClick={() => {
                if (window.innerWidth < 600) {
                  setIsMenuOpened(false);
                }
              }}
            >
              test
            </footer>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}

export default App;
