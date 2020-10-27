import React, { useState, useRef } from 'react';
import useStopwatch from '../hooks/useStopwatch';
import useStudyRecord from '../hooks/useStudyRecord';
import TimeDisplay from '../components/TimeDisplay';
import StudyRecordTable from '../components/StudyRecordTable';
import { postStudyRecordsOfAllUsers } from '../utils/fetchReocrds';
import {
  Button,
  Switch,
  Typography,
  Grid,
  Dialog,
  TextField,
  makeStyles,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  textCenter: {
    textAlign: 'center',
  },
  textRight: {
    textAlign: 'right',
  },
  timeDisplay: {
    marginBottom: theme.spacing(10),
  },
  switch: {
    marginBottom: theme.spacing(5),
  },
  displayedLabel: {
    fontSize: `calc(2rem + 1vw)`,
  },
  displayedTime: {
    fontSize: `calc(2.5rem + 5vw)`,
  },
  buttonGap: {
    margin: theme.spacing(0, 1),
  },
}));

// TODO 공부시간과 휴식시간에 포모도로 타이머 도입하기
export default function (props: any) {
  const classes = useStyles();
  const localStorageKeyRef = useRef('');

  const {
    totalStudyTime,
    totalRestTime,
    isStarted,
    setIsStarted,
    isResumed,
    setIsResumed,
    currentStudyTime,
    currentRestTime,
    reset,
  } = useStopwatch({
    timeObject: typeof performance === 'object' ? performance : Date,
  });

  const [record, setRecord] = useStudyRecord();

  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [showTotalTime, setShowTotalTime] = useState(false);

  const displayedStudyTimeHeading = !isStarted
    ? '스톱워치 초기상태 또는 정지상태'
    : showTotalTime
    ? '누적 공부시간'
    : '이번교시 공부시간';
  const displayedRestTimeHeading = showTotalTime
    ? '누적 휴식시간'
    : '이번교시 휴식시간';
  const displayedHeading =
    isStarted && !isResumed
      ? displayedRestTimeHeading
      : displayedStudyTimeHeading;

  const displayedStudyTime = showTotalTime ? totalStudyTime : currentStudyTime;
  const displayedRestTime = showTotalTime ? totalRestTime : currentRestTime;
  const displayedTime = isResumed ? displayedStudyTime : displayedRestTime;

  const displayedLabel = isStarted
    ? isResumed
      ? '공부중...'
      : '휴식중...'
    : null;

  return (
    <Grid container justify="center" alignItems="center">
      <Typography variant="srOnly" component="h2">
        스톱워치 및 공부기록
      </Typography>

      {/* 스톱워치 디스플레이 아티클 */}
      <Grid
        item
        component="article"
        xs={12}
        md={7}
        className={classes.timeDisplay}
      >
        <Typography variant="srOnly" component="h3">
          스톱워치 디스플레이
        </Typography>

        {/* 스톱워치 디스플레이 상태 스위치 */}
        <Typography component="div" className={classes.switch}>
          <Grid
            component="label"
            container
            alignItems="center"
            justify="flex-end"
            spacing={1}
          >
            <Grid item>이번교시</Grid>
            <Grid item>
              <Switch
                checked={showTotalTime}
                onChange={() => {
                  setShowTotalTime((state) => !state);
                }}
                inputProps={{ 'aria-label': 'Display state checkbox' }}
                color="primary"
              />
            </Grid>
            <Grid item>누적</Grid>
          </Grid>
        </Typography>

        {/* 스톱워치 디스플레이 시간 및 상태 표시 */}
        <div>
          <Typography variant="srOnly" component="h4">
            {displayedHeading}
          </Typography>

          <div>
            <Typography
              align="center"
              component="div"
              className={classes.displayedLabel}
            >
              {displayedLabel}
            </Typography>
            <Typography
              align="center"
              component="div"
              className={classes.displayedTime}
            >
              <TimeDisplay
                hours={displayedTime.hours}
                minutes={displayedTime.minutes}
                seconds={displayedTime.seconds}
              />
            </Typography>
          </div>
        </div>

        {/* 스톱워치 디스플레이 버튼 */}
        <div className={classes.textCenter}>
          {/* 타이머가 한 번이라도 측정되었거나 기록이 저장되었으면 리셋 버튼을 표시 */}
          {(isStarted || localStorageKeyRef.current) && (
            <Button
              className={classes.buttonGap}
              size="large"
              variant="contained"
              color="secondary"
              onClick={() => {
                localStorageKeyRef.current = '';
                reset();
                setRecord({ type: 'reset' });
              }}
            >
              리셋
            </Button>
          )}

          {isResumed ? (
            <Button
              className={classes.buttonGap}
              size="large"
              variant="contained"
              color="primary"
              onClick={() => {
                setIsResumed(false);
                setRecord({
                  type: 'studyTime',
                  totalStudyTime,
                });
              }}
            >
              휴식
            </Button>
          ) : (
            <Button
              className={classes.buttonGap}
              size="large"
              variant="contained"
              color="primary"
              onClick={() => {
                setIsStarted(true);
                setIsResumed(true);
                // 휴식시간은 공부하기 버튼이 클릭될 때 측정됨
                setRecord({
                  type: 'restTime',
                  totalRestTime,
                });
              }}
            >
              공부
            </Button>
          )}
        </div>
      </Grid>

      {/* 공부기록 섹션 */}
      <Grid item component="section" xs={12} md={7}>
        <Typography variant="srOnly" component="h3">
          공부기록
        </Typography>
        <div className={classes.textRight}>
          {/* 저장하기 버튼은 저장하기 modal을 여는 역할을 함 */}
          {/* 실제로 저장하는 것이 아님 */}
          <Button
            size="large"
            variant="contained"
            color="primary"
            onClick={() => {
              // 한 번이라도 스톱워치가 공부시간을 측정하지 않은 경우
              if (record.periodRecords.length === 0 && !isStarted) {
                alert('공부 기록이 존재하지 않습니다');
                return;
              }

              if (isResumed) {
                // 현재 공부시간을 측정 중인 경우 공부시간을 기록
                // 기록 후 휴식시간을 계속 측정
                setRecord({
                  type: 'studyTime',
                  totalStudyTime,
                });
                setIsResumed(false);
              } else {
                // 현재 휴식시간을 측정 중인 경우
                // 휴식시간을 기록 후 타이머를 멈춤
                setRecord({
                  type: 'restTime',
                  totalRestTime,
                });
              }
              setOpenSaveDialog(true);
            }}
          >
            저장
          </Button>
        </div>

        <StudyRecordTable record={record} />
      </Grid>

      <Dialog
        open={openSaveDialog}
        onClose={() => {
          setOpenSaveDialog(false);
        }}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle disableTypography id="form-dialog-title">
          <Typography variant="h6" component="h3">
            공부기록 저장
          </Typography>
        </DialogTitle>
        <DialogContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              let key: string;
              if (localStorageKeyRef.current === '') {
                // 만약 스톱워치 사용중 저장한 적이 없으면
                // 로컬 스토리지에 저장된 아이템의 개수에 1을 더해서 키값으로 설정
                key = `${localStorage.length + 1}. ${record.heading}`;
                localStorage.setItem(
                  key,
                  JSON.stringify({
                    ...record,
                    localKey: localStorage.length + 1,
                  })
                );
                localStorageKeyRef.current = key;
              } else {
                // 스톱워치 사용중 저장한 적이 있으면
                // 로컬스토리지에 저장된 아이템 개수를 기준으로 키값 설정
                // 왜냐하면 현재 존재하는 마지막 아이템을 지운 후
                // 다시 새 아이템을 로컬 스토리지에 저장할 것이므로
                key = `${localStorage.length}. ${record.heading}`;
                localStorage.removeItem(localStorageKeyRef.current);
                localStorage.setItem(
                  key,
                  JSON.stringify({ ...record, localKey: localStorage.length })
                );
                localStorageKeyRef.current = key;
              }

              postStudyRecordsOfAllUsers(record);

              setOpenSaveDialog(false);
              setRecord({ type: 'heading', heading: '' });
            }}
          >
            <TextField
              autoFocus
              id="saveRecordHeading"
              label="제목"
              type="text"
              onChange={(e) =>
                setRecord({ type: 'heading', heading: e.target.value })
              }
            />

            <DialogActions>
              <Button
                onClick={() => {
                  setRecord({ type: 'heading', heading: '' });
                  setOpenSaveDialog(false);
                }}
              >
                취소
              </Button>
              <Button type="submit">저장</Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>
    </Grid>
  );
}
