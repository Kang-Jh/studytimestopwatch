import React, { useState, useLayoutEffect, useRef, useReducer } from 'react';
import TimeDisplay from '../components/TimeDisplay';
import StudyRecordTable from '../components/StudyRecordTable';
import { Time } from '../@types/time';
import { StudyRecord, PeriodRecord } from '../@types/studyRecord';
import {
  getNow,
  convertSecondsToTime,
  convertTimeToSeconds,
  convertMiliSecondsToSeconds,
} from '../utils/time';
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

interface StopwatchActionParameter {
  type: string;
  totalStudyTime: Time;
  totalRestTime: Time;
  heading: string;
}

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

// recordsReducer는 일시정지 버튼이 클릭될 때마다 클릭된 시간을 기록
// 또는 리셋 버튼이 클릭될 경우 모든 기록을 삭제
const recordReducer = (
  state: StudyRecord,
  {
    type,
    totalStudyTime,
    totalRestTime,
    heading = '',
  }: Partial<StopwatchActionParameter>
): StudyRecord => {
  let newState: StudyRecord = { ...state };
  let lastPeriodRecord: Partial<PeriodRecord>;
  let newPeriodRecords: Partial<PeriodRecord>[] = [...state.periodRecords];

  switch (type) {
    case 'reset':
      return {
        date: new Date(),
        periodRecords: [],
        heading: '',
        totalStudyTime: {
          hours: 0,
          minutes: 0,
          seconds: 0,
        },
        totalRestTime: {
          hours: 0,
          minutes: 0,
          seconds: 0,
        },
      };
    case 'studyTime':
      if (newPeriodRecords.length === 0) {
        newPeriodRecords.push({
          period: 1,
          studyTimeHours: (totalStudyTime as Time).hours,
          studyTimeMinutes: (totalStudyTime as Time).minutes,
          studyTimeSeconds: (totalStudyTime as Time).seconds,
        });
      } else {
        const lastTotalStudyTime = state.totalStudyTime;
        const {
          hours: studyTimeHours,
          minutes: studyTimeMinutes,
          seconds: studyTimeSeconds,
        } = convertSecondsToTime(
          convertTimeToSeconds(totalStudyTime as Time) -
            convertTimeToSeconds(lastTotalStudyTime)
        );

        newPeriodRecords.push({
          period: state.periodRecords.length + 1,
          studyTimeHours,
          studyTimeMinutes,
          studyTimeSeconds,
        });
      }

      newState.totalStudyTime = totalStudyTime as Time;
      newState.periodRecords = newPeriodRecords;

      return newState;
    case 'restTime':
      const {
        hours: restTimeHours,
        minutes: restTimeMinutes,
        seconds: restTimeSeconds,
      } = convertSecondsToTime(
        convertTimeToSeconds(totalRestTime as Time) -
          convertTimeToSeconds(state.totalRestTime)
      );
      // 마지막 교시 기록에 휴식시간이 존재하지 않으면
      // 휴식시간을 기록에 추가
      // 이미 존재하면 휴식시간을 수정하지 않음
      lastPeriodRecord = newPeriodRecords[newPeriodRecords.length - 1];
      if (lastPeriodRecord && lastPeriodRecord.restTimeHours === undefined) {
        lastPeriodRecord = {
          ...lastPeriodRecord,
          restTimeHours,
          restTimeMinutes,
          restTimeSeconds,
        };
      }

      newPeriodRecords[newPeriodRecords.length - 1] = lastPeriodRecord;
      newState.periodRecords = newPeriodRecords;
      newState.totalRestTime = totalRestTime as Time;

      return newState;
    case 'heading':
      newState = { ...newState, heading };
      return newState;
    default:
      return state;
  }
};

export default function (props: any) {
  const classes = useStyles();
  const localStorageKeyRef = useRef('');
  const totalRunningTimeRef = useRef(0);
  const totalRestTimeRef = useRef(0);

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
  const [isStarted, setIsStarted] = useState(false);
  const [isResumed, setIsResumed] = useState(false);
  const [record, setRecord] = useReducer(recordReducer, {
    heading: '',
    date: new Date(),
    periodRecords: [],
    totalStudyTime: {
      hours: 0,
      minutes: 0,
      seconds: 0,
    },
    totalRestTime: {
      hours: 0,
      minutes: 0,
      seconds: 0,
    },
  });
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [showTotalTime, setShowTotalTime] = useState(false);

  const currentStudyTime =
    !isStarted && !isResumed
      ? totalStudyTime
      : convertSecondsToTime(
          convertTimeToSeconds(totalStudyTime) -
            convertMiliSecondsToSeconds(totalRunningTimeRef.current)
        );
  const currentRestTime =
    !isStarted && !isResumed
      ? totalRestTime
      : convertSecondsToTime(
          convertTimeToSeconds(totalRestTime) -
            convertMiliSecondsToSeconds(totalRestTimeRef.current)
        );

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

  // 리셋 이펙트
  useLayoutEffect(() => {
    if (!isStarted && !isResumed) {
      totalRestTimeRef.current = 0;
      totalRunningTimeRef.current = 0;
    }
  }, [isStarted, isResumed]);

  // FIXME 현재공부시간과 총공부시간 동기화
  // useEffect 사용시 일시정지, 시작버튼을 빠르게 연속클릭할 시
  // 정지되어야 할 상황에서도 타이머가 계속 실행됨
  // 공부시간을 측정하기 위한 이펙트
  useLayoutEffect(() => {
    // 공부하기 버튼이 클릭되면 실행
    if (isStarted && isResumed) {
      let rAF: number;

      // 실행시간은 버튼이 클릭된 시간에서 마운트된 시간과 휴식 시간을 뺀 것
      let totalRunningTime: number;

      const buttonClickedTime = getNow();
      const prevTotalRunningTime = totalRunningTimeRef.current;

      // idleTime은 버튼이 클릭된 시간에서 이전 총실행시간을 뺸 값으로
      // 현재 총실행시간을 측정하기 위한 변수
      const idleTime = buttonClickedTime - prevTotalRunningTime;

      rAF = requestAnimationFrame(timer);

      // 컴포넌트가 화면에 painting 될 때마다 실행될 함수
      function timer(): void {
        totalRunningTime = getNow() - idleTime;

        const totalRunningTimeAsSec = convertMiliSecondsToSeconds(
          totalRunningTime
        );

        // 초로 표현된 시간값을 시, 분, 초값으로 변환
        const {
          hours: totalHours,
          minutes: totalMinutes,
          seconds: totalSeconds,
        } = convertSecondsToTime(totalRunningTimeAsSec);

        setTotalStudyTime({
          hours: totalHours,
          minutes: totalMinutes,
          seconds: totalSeconds,
        });

        rAF = requestAnimationFrame(timer);
      }

      return () => {
        // 러닝타임 레퍼런스에 타이머가 실행된 시간을 저장
        totalRunningTimeRef.current = totalRunningTime;
        cancelAnimationFrame(rAF);
      };
    }
  }, [isStarted, isResumed]);

  // FIXME 현재휴식시간과 총휴식시간 동기화
  // 휴식시간을 측정하기 위한 이펙트
  // 공부시간을 측정하는 이펙트와 로직은 동일
  useLayoutEffect(() => {
    // 시작된 후 쉬기 버튼이 클릭되었을 경우 휴식시간을 측정하기 위한 조건문
    if (isStarted && !isResumed) {
      let rAF: number;

      let totalRestTime: number;

      const buttonClickedTime: number = getNow();
      const prevTotalRestTime = totalRestTimeRef.current;

      // idleTime은 클릭된 시간에서 이전 총휴식시간을 뺀 값으로
      // 현재 총휴식시간을 측정하기 위한 변수
      const idleTime = buttonClickedTime - prevTotalRestTime;

      rAF = requestAnimationFrame(timer);
      function timer(): void {
        const now = getNow();
        totalRestTime = now - idleTime;

        const totalRestTimeAsSec = convertMiliSecondsToSeconds(totalRestTime);

        const {
          hours: totalHours,
          minutes: totalMinutes,
          seconds: totalSeconds,
        } = convertSecondsToTime(totalRestTimeAsSec);

        setTotalRestTime({
          hours: totalHours,
          minutes: totalMinutes,
          seconds: totalSeconds,
        });

        rAF = requestAnimationFrame(timer);
      }

      return () => {
        totalRestTimeRef.current = totalRestTime;
        cancelAnimationFrame(rAF);
      };
    }
  }, [isStarted, isResumed]);

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
                setTotalStudyTime({ hours: 0, minutes: 0, seconds: 0 });
                setTotalRestTime({ hours: 0, minutes: 0, seconds: 0 });
                setIsStarted(false);
                setIsResumed(false);
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
