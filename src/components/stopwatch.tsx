import React, { useState, useLayoutEffect, useRef, useReducer } from 'react';
import Modal from './modal';
import Time from '../@types/time';
import { Record, PeriodRecord } from '../@types/record';
import {
  getNow,
  getDisplayTime,
  getTime,
  miliSecondsToSeconds,
} from '../functions/time';
import '../styles/stopwatch.css';

// recordsReducer는 일시정지 버튼이 클릭될 때마다 클릭된 시간을 기록
// 또는 리셋 버튼이 클릭될 경우 모든 기록을 삭제
const recordReducer = (state: Record, action: any): Record => {
  const {
    type,
    hours,
    minutes,
    seconds,
    pauseTime,
    heading,
  }: {
    type: string;
    hours: number;
    minutes: number;
    seconds: number;
    pauseTime: number | null;
    heading: string;
  } = action;
  let newState: Record = { ...state };
  let lastPeriodRecord: PeriodRecord;

  switch (type) {
    case 'reset':
      return {
        date: state.date,
        periodRecords: [],
        heading: '',
      };
    case 'add':
      if (state.periodRecords.length === 0) {
        const periodRecords = [];
        // net이 붙은 prop들은 순공부시간을 의미
        // net이 붙지 않은 prop들은 일시정지가 눌렸을 때의 시간을 의미
        // net이 붙은 값들은 모두 이전 일시정지부터 얼마만큼 공부했는지를 나타냄
        // period는 교시를 나타냄
        periodRecords.push({
          period: 1,
          netStudyTimeHours: hours,
          netStudyTimeMinutes: minutes,
          netStudyTimeSeconds: seconds,
        });

        newState.periodRecords = periodRecords;
      } else {
        // 현재 타이머에 표시된 시간과 기록되는 시간이
        // 같지 않으면 isChanged는 true, 같으면 false
        const isChanged: boolean =
          (newState.totalStudyTime as Time).hours !== hours ||
          (newState.totalStudyTime as Time).minutes !== minutes ||
          (newState.totalStudyTime as Time).seconds !== seconds;

        // 변하지 않았으면 state를 return
        if (!isChanged) {
          return state;
        }

        const netStudytime: number =
          hours * 3600 +
          minutes * 60 +
          seconds -
          ((newState.totalStudyTime as Time).hours * 3600 +
            (newState.totalStudyTime as Time).minutes * 60 +
            (newState.totalStudyTime as Time).seconds);

        const {
          hours: netStudyTimeHours,
          minutes: netStudyTimeMinutes,
          seconds: netStudyTimeSeconds,
        }: Time = getTime(netStudytime);

        lastPeriodRecord =
          newState.periodRecords[newState.periodRecords.length - 1];
        const lastPeriod = lastPeriodRecord.period as number;

        const periodRecords = [...newState.periodRecords];
        periodRecords.push({
          period: lastPeriod + 1,
          netStudyTimeHours,
          netStudyTimeMinutes,
          netStudyTimeSeconds,
        });
        newState.periodRecords = periodRecords;
      }

      newState.totalStudyTime = {
        hours,
        minutes,
        seconds,
      };

      return newState;
    case 'restTime':
      if (pauseTime === null) {
        // 처음 공부하기 버튼이 클릭될 때
        return state;
      } else {
        let restTime: number = miliSecondsToSeconds(getNow()) - pauseTime;
        const {
          hours: restTimeHours,
          minutes: restTimeMinutes,
          seconds: restTimeSeconds,
        }: Time = getTime(restTime);

        // 마지막 교시 기록에 휴식시간이 존재하지 않으면
        // 휴식시간을 기록에 추가
        // 이미 존재하면 휴식시간을 수정하지 않음
        lastPeriodRecord =
          newState.periodRecords[newState.periodRecords.length - 1];
        if (lastPeriodRecord && lastPeriodRecord.restTimeHours === undefined) {
          lastPeriodRecord = {
            ...lastPeriodRecord,
            restTimeHours,
            restTimeMinutes,
            restTimeSeconds,
          };
        }

        newState.periodRecords[
          newState.periodRecords.length - 1
        ] = lastPeriodRecord;

        // 총 휴식시간이 존재하는 경우 이전 총 휴식시간에 이번 교시 휴식시간을 더함
        // 존재하지 않을 경우 이번 교시 휴식시간을 총 휴식시간으로 설정
        if (newState.totalRestTime) {
          newState.totalRestTime = {
            hours:
              newState.totalRestTime.hours +
              (lastPeriodRecord.restTimeHours as number),
            minutes:
              newState.totalRestTime.minutes +
              (lastPeriodRecord.restTimeMinutes as number),
            seconds:
              newState.totalRestTime.seconds +
              (lastPeriodRecord.restTimeSeconds as number),
          };
        } else if (!newState.totalRestTime) {
          newState.totalRestTime = {
            hours: restTimeHours,
            minutes: restTimeMinutes,
            seconds: restTimeSeconds,
          };
        }

        return newState;
      }
    case 'heading':
      newState = { ...newState, heading };
      return newState;
    default:
      return state;
  }
};

// TODO 휴식시간을 따로 표시해주는 타이머 구현하기
export default function (props: any) {
  // 컴포넌트가 마운트 되었을 때의 시간으로
  // 공부시간 측정의 기준값
  const mountTimeRef = useRef(getNow());
  const runningTimeRef = useRef(mountTimeRef.current); // 타이머 실행시간을 위한 ref로 초기값은 마운트된 시간
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [restHours, setRestHours] = useState(0);
  const [restMinutes, setRestMinutes] = useState(0);
  const [restSeconds, setRestSeconds] = useState(0);
  const [pauseTime, setPauseTime] = useState<number | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isResumed, setIsResumed] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [record, setRecord] = useReducer(recordReducer, {
    heading: '',
    date: new Date(),
    periodRecords: [],
  });
  const [localStorageKey, setLocalStorageKey] = useState<string | null>(null);

  // useEffect 사용시 일시정지, 시작버튼을 빠르게 연속클릭할 시
  // 정지되어야 할 상황에서도 타이머가 계속 실행됨
  // 공부시간을 측정하기 위한 이펙트
  useLayoutEffect(() => {
    // 리셋버튼이 눌릴 시 타이머 실행시간을 초기화하기 위함
    if (!isStarted && isReset) {
      runningTimeRef.current = mountTimeRef.current;
    }

    // 공부하기 버튼이 클릭되면 실행
    if (isStarted && isResumed) {
      let rAF: number;

      // 시작 버튼이 클릭된 시간에서 타이머가 실행된 시간을 뺌
      // 처음 클릭 시에는 컴포넌트가 마운트된 시간이 빠짐 왜냐하면 실행시간의 초기값이 마운트시간이기 때문
      const buttonClickedTime: number = getNow();
      const prevRunningTime: number = runningTimeRef.current;
      const elapsed: number = buttonClickedTime - prevRunningTime;
      let runningTime: number;

      rAF = requestAnimationFrame(timer);

      // 컴포넌트가 화면에 painting 될 때마다 실행될 함수
      function timer(): void {
        // timer 함수가 실행될 때마다
        // 현재시간에서 elapsed를 빼줌으로써
        // 타이머가 실행된 시간만 계산하게 됨
        runningTime = getNow() - elapsed;
        const nowAsSec: number = miliSecondsToSeconds(runningTime);
        // 초로 표현된 시간값을 시, 분, 초값으로 변환
        const { hours, minutes, seconds }: Time = getTime(nowAsSec);

        // 위에서 구한 시, 분, 초값을 state에 저장
        setHours(hours);
        setMinutes(minutes);
        setSeconds(seconds);

        rAF = requestAnimationFrame(timer);
      }

      return () => {
        // 러닝타임 레퍼런스에 타이머가 실행된 시간을 저장
        runningTimeRef.current = runningTime;
        cancelAnimationFrame(rAF);
      };
    }
  }, [isStarted, isReset, isResumed]);

  // 휴식시간을 측정하기 위한 이펙트
  // 공부시간을 측정하는 이펙트와 거의 동일
  useLayoutEffect(() => {
    // 시작된 후 쉬기 버튼이 클릭되었을 경우 휴식시간을 측정하기 위한 조건문
    if (isStarted && !isResumed) {
      let rAF: number;

      const buttonClickedTime: number = getNow();

      rAF = requestAnimationFrame(timer);
      function timer(): void {
        const restTime: number = getNow() - buttonClickedTime;
        const restTimeAsSec: number = miliSecondsToSeconds(restTime);

        const {
          hours: restHours,
          minutes: restMinutes,
          seconds: restSeconds,
        }: Time = getTime(restTimeAsSec);

        setRestHours(restHours);
        setRestMinutes(restMinutes);
        setRestSeconds(restSeconds);

        rAF = requestAnimationFrame(timer);
      }

      return () => {
        cancelAnimationFrame(rAF);
      };
    }
  }, [isStarted, isResumed]);

  return (
    <main className="Stopwatch">
      <h2 className="srOnly">스톱워치</h2>

      <section>
        {isStarted && !isResumed ? (
          <>
            <h3 className="Stopwatch-sectionHeader">휴식중...</h3>

            <div className="Stopwatch-stopwatchDisplay">
              {getDisplayTime(restHours)}:{getDisplayTime(restMinutes)}:
              {getDisplayTime(restSeconds)}
            </div>
          </>
        ) : (
          <>
            {/* 초기 상태 또는 리셋 상태일 경우 스크린 리더들에게만 보이는 헤딩을 보여줌 */}
            {/* 공부하기가 클릭된 경우 공부중... 이라는 헤딩을 보여줌  */}
            {isStarted ? (
              <h3 className="Stopwatch-sectionHeader">공부중...</h3>
            ) : (
              <h3 className="srOnly">스톱워치 디스플레이</h3>
            )}

            <div className="Stopwatch-stopwatchDisplay">
              {getDisplayTime(hours)}:{getDisplayTime(minutes)}:
              {getDisplayTime(seconds)}
            </div>
          </>
        )}

        <div>
          {isStarted || seconds || minutes || hours ? (
            <button
              className="Stopwatch-button Stopwatch-background-white"
              type="button"
              onClick={() => {
                setHours(0);
                setMinutes(0);
                setSeconds(0);
                setRestHours(0);
                setRestMinutes(0);
                setRestSeconds(0);
                setIsStarted(false);
                setIsResumed(false);
                setIsReset(true);
                setPauseTime(null);
                setRecord({ type: 'reset' });
              }}
            >
              리셋
            </button>
          ) : null}

          {isResumed ? (
            <button
              className="Stopwatch-button Stopwatch-background-blue"
              type="button"
              onClick={() => {
                setIsResumed(false);
                setIsReset(false);
                setPauseTime(miliSecondsToSeconds(getNow()));
                setRecord({ type: 'add', hours, minutes, seconds });
              }}
            >
              쉬기
            </button>
          ) : (
            <button
              className="Stopwatch-button Stopwatch-background-blue"
              type="button"
              onClick={() => {
                setIsStarted(true);
                setIsResumed(true);
                setIsReset(false);
                // 휴식시간은 공부하기 버튼이 클릭될 때 측정됨
                setRecord({
                  type: 'restTime',
                  pauseTime,
                });
              }}
            >
              공부하기
            </button>
          )}
        </div>
      </section>

      <section className="Stopwatch-studyRecords-section">
        <h3 className="srOnly">공부기록</h3>

        <div className="textAlign-right">
          {/* 저장하기 버튼은 저장하기 modal을 여는 역할을 함 */}
          {/* 실제로 저장하는 것이 아님 */}
          <button
            className="Stopwatch-button"
            onClick={() => {
              // 한 번이라도 스톱워치가 공부시간을 측정하지 않은 경우
              if (record.periodRecords.length === 0 && !isStarted) {
                alert('공부 기록이 존재하지 않습니다');
                return;
              }

              if (isResumed) {
                // 현재 공부시간을 측정 중인 경우
                // 공부시간을 기록하고
                // 일시정지 시간에 현재 시간을 저장
                setRecord({ type: 'add', hours, minutes, seconds });
                setPauseTime(miliSecondsToSeconds(getNow()));
              } else {
                // 현재 휴식시간을 측정 중인 경우
                // 휴식시간을 기록하고
                // 일시정지 시간을 null로 저장
                // 일시정지 시간을 null로 저장함으로써
                // 공부하기 버튼이 다시 클릭됐을 때 마지막 휴식시간을 변경하지 않음
                setRecord({ type: 'restTime', pauseTime });
                setPauseTime(null);
              }
              setIsStarted(false);
              setIsResumed(false);
              setIsOpen(true);
            }}
          >
            저장하기
          </button>
        </div>

        <table className="Stopwatch-table">
          <thead>
            <tr>
              <th scope="col">교시</th>
              <th scope="col">공부시간</th>
              <th scope="col">휴식시간</th>
            </tr>
          </thead>

          <tbody>
            {record.periodRecords.map(
              ({
                period,
                netStudyTimeHours,
                netStudyTimeMinutes,
                netStudyTimeSeconds,
                restTimeHours,
                restTimeMinutes,
                restTimeSeconds,
              }) => (
                <tr key={period}>
                  <td>{period}</td>

                  <td>
                    <span>
                      {getDisplayTime(netStudyTimeHours as number)}:
                      {getDisplayTime(netStudyTimeMinutes as number)}:
                      {getDisplayTime(netStudyTimeSeconds as number)}
                    </span>
                  </td>

                  {/* restTime_hours가 undefined가 아니면 나머지 restTime들도 undefined가 아니므로 restTime_hours만 사용 */}
                  {restTimeHours !== undefined && (
                    <td>
                      <span>
                        {getDisplayTime(restTimeHours)}:
                        {getDisplayTime(restTimeMinutes as number)}:
                        {getDisplayTime(restTimeSeconds as number)}
                      </span>
                    </td>
                  )}
                </tr>
              )
            )}
          </tbody>

          <tfoot>
            <tr>
              <th scope="row">총합</th>
              {record.totalStudyTime && (
                <td>
                  {getDisplayTime(record.totalStudyTime.hours)}:
                  {getDisplayTime(record.totalStudyTime.minutes)}:
                  {getDisplayTime(record.totalStudyTime.seconds)}
                </td>
              )}
              {record.totalRestTime && (
                <td>
                  {getDisplayTime(record.totalRestTime.hours)}:
                  {getDisplayTime(record.totalRestTime.minutes)}:
                  {getDisplayTime(record.totalRestTime.seconds)}
                </td>
              )}
            </tr>
          </tfoot>
        </table>
      </section>

      <Modal isOpen={isOpen}>
        <form
          className="Stopwatch-saveRecordsForm"
          onSubmit={(e) => {
            e.preventDefault();
            let key: string;
            if (localStorageKey === null) {
              key = `${record.date} ${record.heading}`;
              localStorage.setItem(key, JSON.stringify(record));
              setLocalStorageKey(key);
            } else {
              key = `${record.date} ${record.heading}`;
              localStorage.removeItem(localStorageKey);
              localStorage.setItem(key, JSON.stringify(record));
              setLocalStorageKey(key);
            }
          }}
        >
          <h3>공부기록 저장</h3>

          <div className="Stopwatch-saveRecordsForm-inputDiv">
            <label htmlFor="heading">제목</label>
            <input
              type="text"
              id="heading"
              value={record.heading}
              onChange={(e) =>
                setRecord({ type: 'heading', heading: e.target.value })
              }
            />
          </div>

          <div className="Stopwatch-saveRecordsForm-buttonDiv">
            <button type="submit">저장</button>
            <button
              type="button"
              onClick={() => {
                setRecord({ type: 'heading', heading: '' });
                setIsOpen(false);
              }}
            >
              취소
            </button>
          </div>
        </form>
      </Modal>
    </main>
  );
}
