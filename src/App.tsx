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
    minHeight: '100vh',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    padding: theme.spacing(3),
  },
  main: {
    marginBottom: theme.spacing(2),
  },
  footer: {
    padding: theme.spacing(3, 2),
    marginTop: 'auto',
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
          <Container component="main" className={classes.main}>
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

          <footer className={classes.footer}>test</footer>
        </div>
      </div>
    </div>
  );
}

export default App;
