import React, { useState, useEffect } from 'react';
import { Route, Switch } from 'react-router-dom';
import { Header } from './components/HeaderAndNav';
import Stopwatch from './pages/Stopwatch';
import MyRecords from './pages/MyRecords';
import DetailRecord from './pages/DetailRecord';
import StatisticOfUsers from './pages/StatisticOfUsers';
import {
  CssBaseline,
  Container,
  makeStyles,
  Toolbar,
  Snackbar,
} from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import { Time } from './@types/time';

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
  const [fetchStatistic, setFetchStatistic] = useState(false);
  const [totalPeriod, setTotalPeriod] = useState(0);
  const [totalStudyTime, setTotalStudyTime] = useState<Time>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [totalRestTime, setTotalRestTime] = useState<Time>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [openServiceWorkerSnackbar, setOpenServiceWorkerSnackbar] = useState(
    false
  );
  const [openOfflineModeSnackbar, setOpenOfflineModeSnackbar] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      if (navigator.serviceWorker.controller && !navigator.onLine) {
        setOpenOfflineModeSnackbar(true);
      } else if (navigator.serviceWorker.controller && navigator.onLine) {
        setOpenServiceWorkerSnackbar(true);
      }
    }
  }, []);

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
                <StatisticOfUsers
                  statisticFetched={fetchStatistic}
                  totalPeriod={totalPeriod}
                  totalStudyTime={totalStudyTime}
                  totalRestTime={totalRestTime}
                  setStatisticFetched={setFetchStatistic}
                  setTotalPeriod={setTotalPeriod}
                  setTotalStudyTime={setTotalStudyTime}
                  setTotalRestTime={setTotalRestTime}
                />
              </Route>

              <Route path="/">
                <Stopwatch />
              </Route>
            </Switch>
          </Container>

          <footer className={classes.footer}></footer>
        </div>
      </div>

      <Snackbar
        open={openServiceWorkerSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={3000}
        onClose={(event, reason) => {
          if (reason === 'clickaway') {
            return;
          }

          setOpenServiceWorkerSnackbar(false);
        }}
      >
        <Alert
          severity="success"
          onClose={() => {
            setOpenServiceWorkerSnackbar(false);
          }}
        >
          오프라인 모드에서 실행가능합니다
        </Alert>
      </Snackbar>

      <Snackbar
        open={openOfflineModeSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        autoHideDuration={3000}
        onClose={(event, reason) => {
          if (reason === 'clickaway') {
            return;
          }

          setOpenOfflineModeSnackbar(false);
        }}
      >
        <Alert
          severity="info"
          onClose={() => {
            setOpenOfflineModeSnackbar(false);
          }}
        >
          오프라인 모드에서 실행중입니다
        </Alert>
      </Snackbar>
    </div>
  );
}

export default App;
