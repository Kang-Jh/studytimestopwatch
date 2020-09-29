import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { Header } from './components/HeaderAndNav';
import Stopwatch from './pages/Stopwatch';
import MyRecords from './pages/MyRecords';
import DetailRecord from './pages/DetailRecord';
import StatisticOfUsers from './pages/StatisticOfUsers';
import { CssBaseline, Container, makeStyles, Toolbar } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

function App() {
  const classes = useStyles();

  return (
    <div className="App" aria-live="assertive">
      <CssBaseline />
      <div className={classes.root}>
        <Header />

        <div className={classes.content}>
          <Toolbar />
          <main>
            <Container>
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
            </Container>
          </main>

          <footer>test</footer>
        </div>
      </div>
    </div>
  );
}

export default App;
