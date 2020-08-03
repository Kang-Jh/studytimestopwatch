import React, { useState, useLayoutEffect, useRef, useReducer } from 'react';
import Modal from './modal';
import '../styles/stopwatch.css';

// performance가 존재하지 않으면 Date로 대체
const timeObject = typeof performance === 'object' ? performance : Date;
const getNow = () => timeObject.now();
const miliSecondsToSeconds = (miliseconds) => Math.floor(miliseconds / 1000);

// getHours, getMinutes, getSeconds는 초로 표현된 시간값과
// 여기서 구해진 시, 분을을 입력값으로 받아
// 몇 시간, 몇 분, 몇 초인지를 구할 수 있게 해줌
const getHours = (timeAsSec) => Math.floor(timeAsSec / 3600);
const getMinutes = (timeAsSec, hours) =>
  Math.floor((timeAsSec - hours * 3600) / 60);
const getSeconds = (timeAsSec, hours, minutes) =>
  timeAsSec - hours * 3600 - minutes * 60;

// 입력값이 10보다 작으면 앞에 0을 붙인 문자열을 return
// 입력값이 10 이상이면 입력값을 그대로 return
// 이로써 화면에 표시되는 시(또는 분 또는 초)가
// 10보다 작을 경우 앞에 0을 붙인 값이 화면에 표시됨
const getDisplayTime = (number) => {
  return number < 10 ? `0${number}` : number;
};

// recordsReducer는 일시정지 버튼이 클릭될 때마다 클릭된 시간을 기록
// 또는 리셋 버튼이 클릭될 경우 모든 기록을 삭제
const recordsReducer = (state, action) => {
  const { type, hours, minutes, seconds, pauseTime } = action;
  let newState;
  let lastElement;

  switch (type) {
    case 'reset':
      return [];
    case 'add':
      newState = state.map((el) => el);
      if (newState.length === 0) {
        // net이 붙은 prop들은 순공부시간을 의미
        // net이 붙지 않은 prop들은 일시정지가 눌렸을 때의 시간을 의미
        // net이 붙은 값들은 모두 이전 일시정지부터 얼마만큼 공부했는지를 나타냄
        // checkpoint는 기록순서를 나타냄
        newState.push({
          checkpoint: 1,
          hours,
          minutes,
          seconds,
          net_hours: hours,
          net_minutes: minutes,
          net_seconds: seconds,
        });
      } else {
        newState = state.map((el) => el);
        lastElement = newState[newState.length - 1];
        // 현재 타이머에 표시된 시간과 기록되는 시간이
        // 같지 않으면 isChanged는 true, 같으면 false
        const isChanged =
          lastElement.hours !== hours ||
          lastElement.minutes !== minutes ||
          lastElement.seconds !== seconds
            ? true
            : false;

        // 변하지 않았으면 state를 return
        if (!isChanged) {
          return state;
        }

        const net_studytime =
          hours * 3600 +
          minutes * 60 +
          seconds -
          (lastElement.hours * 3600 +
            lastElement.minutes * 60 +
            lastElement.seconds);
        const net_hours = getHours(net_studytime);
        const net_minutes = getMinutes(net_studytime, net_hours);
        const net_seconds = getSeconds(net_studytime, net_hours, net_minutes);
        newState.push({
          checkpoint: lastElement.checkpoint + 1,
          hours,
          minutes,
          seconds,
          net_hours,
          net_minutes,
          net_seconds,
        });
      }

      return newState;
    case 'restTime':
      if (pauseTime === null) {
        return state;
      }

      newState = state.map((el) => el);

      let restTime = miliSecondsToSeconds(getNow()) - pauseTime;
      const restTime_hours = getHours(restTime);
      const restTime_minutes = getMinutes(restTime, restTime_hours);
      const restTime_seconds = getSeconds(
        restTime,
        restTime_hours,
        restTime_minutes
      );

      // 마지막 기록에 휴식 시, 분, 초를 추가
      lastElement = newState[newState.length - 1];
      lastElement = {
        ...lastElement,
        restTime_hours,
        restTime_minutes,
        restTime_seconds,
      };

      newState[newState.length - 1] = lastElement;

      return newState;
    default:
      return state;
  }
};

// TODO 휴식시간을 따로 표시해주는 타이머 구현하기
export default function (props) {
  // getNow 함수를 이용하는 이유는 performance.now()를 사용할 수 없을 경우 Date.now()를 사용하기 위함
  const mountTimeRef = useRef(getNow()); // 컴포넌트가 마운트 되었을 때의 시간
  const runningTimeRef = useRef(mountTimeRef.current); // 타이머 실행시간을 위한 ref로 초기값은 마운트된 시간
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [restHours, setRestHours] = useState(0);
  const [restMinutes, setRestMinutes] = useState(0);
  const [restSeconds, setRestSeconds] = useState(0);
  const [pauseTime, setPauseTime] = useState(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isResumed, setIsResumed] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [heading, setHeading] = useState('');
  const [records, setRecords] = useReducer(recordsReducer, []);

  // useEffect 사용시 일시정지, 시작버튼을 빠르게 연속클릭할 시
  // 정지되어야 할 상황에서도 타이머가 계속 실행됨
  // 공부시간을 측정하기 위한 이펙트
  useLayoutEffect(() => {
    // 리셋버튼이 눌릴 시 타이머 실행시간을 초기화하기 위함
    if (!isStarted && isReset) {
      runningTimeRef.current = mountTimeRef.current;
    }

    // 공부하기 버튼이 클릭되면 실행
    if (isStarted & isResumed) {
      let rAF;

      // 시작 버튼이 클릭된 시간에서 타이머가 실행된 시간을 뺌
      // 처음 클릭 시에는 컴포넌트가 마운트된 시간이 빠짐 왜냐하면 실행시간의 초기값이 마운트시간이기 때문
      const buttonClickedTime = getNow();
      const prevRunningTime = runningTimeRef.current;
      const elapsed = buttonClickedTime - prevRunningTime;
      let runningTime;
      // 컴포넌트가 화면에 painting 될 때마다 실행될 함수
      function timer() {
        // timer 함수가 실행될 때마다
        // 현재시간에서 elapsed를 빼줌으로써
        // 타이머가 실행된 시간만 계산하게 됨
        runningTime = getNow() - elapsed;
        const nowAsSec = miliSecondsToSeconds(runningTime);
        // 초로 표현된 시간값을 시, 분, 초값으로 변환
        const hours = getHours(nowAsSec);
        const minutes = getMinutes(nowAsSec, hours);
        const seconds = getSeconds(nowAsSec, hours, minutes);

        setHours(hours);
        setMinutes(minutes);
        setSeconds(seconds);

        rAF = requestAnimationFrame(timer);
      }

      rAF = requestAnimationFrame(timer);

      return () => {
        // 러닝타임 레퍼런스에 타이머가 실행된 시간을 저장
        runningTimeRef.current = runningTime;
        cancelAnimationFrame(rAF);
      };
    }
  }, [isStarted, isReset, isResumed]);

  // 휴식시간을 측정하기 위한 이펙트
  useLayoutEffect(() => {
    // 시작된 후 일시정지 버튼이 클릭되었을 경우 휴식시간을 측정하기 위한 조건문
    if (isStarted && !isResumed) {
      let rAF;

      const buttonClickedTime = getNow();
      function timer() {
        const restTime = getNow() - buttonClickedTime;
        const restTimeAsSec = miliSecondsToSeconds(restTime);

        const restHours = getHours(restTimeAsSec);
        const restMinutes = getMinutes(restTimeAsSec, restHours);
        const restSeconds = getSeconds(restTimeAsSec, restHours, restMinutes);

        setRestHours(restHours);
        setRestMinutes(restMinutes);
        setRestSeconds(restSeconds);

        rAF = requestAnimationFrame(timer);
      }

      rAF = requestAnimationFrame(timer);

      return () => {
        cancelAnimationFrame(rAF);
      };
    }
  }, [isStarted, isResumed]);

  return (
    <main className="Stopwatch-main">
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

        <div className="Stopwatch-buttonGroup">
          {isStarted || seconds || minutes || hours ? (
            <button
              className="Stopwatch-resetButton"
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
                setRecords({ type: 'reset' });
              }}
            >
              리셋
            </button>
          ) : null}

          {isResumed ? (
            <button
              className="Stopwatch-pauseButton"
              type="button"
              onClick={() => {
                setIsResumed(false);
                setIsReset(false);
                setPauseTime(miliSecondsToSeconds(getNow()));
                setRecords({ type: 'add', hours, minutes, seconds });
              }}
            >
              휴식하기
            </button>
          ) : (
            <button
              className="Stopwatch-startButton"
              type="button"
              onClick={() => {
                setIsStarted(true);
                setIsResumed(true);
                setIsReset(false);
                // 휴식시간은 공부하기 버튼이 클릭될 때 측정됨
                setRecords({
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

        <div className="Stopwatch-saveButton-div">
          <button
            onClick={() => {
              // 한 번이라도 스톱워치가 공부시간을 측정하지 않은 경우
              if (!isStarted) {
                alert('공부 기록이 존재하지 않습니다');
                return;
              }

              if (isResumed) {
                // 현재 공부시간을 측정 중인 경우
                // 공부시간을 기록하고
                // 일시정지 시간에 현재 시간을 저장
                setRecords({ type: 'add', hours, minutes, seconds });
                setPauseTime(miliSecondsToSeconds(getNow()));
              } else {
                // 현재 휴식시간을 측정 중인 경우
                // 휴식시간을 기록하고
                // 일시정지 시간을 null로 저장
                // 일시정지 시간을 null로 저장함으로써
                // 공부하기 버튼이 다시 클릭됐을 때 마지막 휴식시간을 변경하지 않음
                setRecords({ type: 'restTime', pauseTime });
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

        <table>
          <thead>
            <tr>
              <th>교시</th>
              <th>공부시간</th>
              <th>휴식시간</th>
            </tr>
          </thead>

          <tbody>
            {records.map(
              ({
                net_hours,
                net_minutes,
                net_seconds,
                checkpoint,
                restTime_hours,
                restTime_minutes,
                restTime_seconds,
              }) => (
                <tr key={checkpoint}>
                  <td>{checkpoint}</td>

                  <td>
                    <span>
                      {getDisplayTime(net_hours)}:{getDisplayTime(net_minutes)}:
                      {getDisplayTime(net_seconds)}
                    </span>
                  </td>

                  {/* restTime_hours가 undefined가 아니면 나머지 restTime들도 undefined가 아니므로 restTime_hours만 사용 */}
                  {restTime_hours !== undefined && (
                    <td>
                      <span>
                        {getDisplayTime(restTime_hours)}:
                        {getDisplayTime(restTime_minutes)}:
                        {getDisplayTime(restTime_seconds)}
                      </span>
                    </td>
                  )}
                </tr>
              )
            )}
          </tbody>
        </table>
      </section>

      <Modal isOpen={isOpen}>
        <section>
          <h3 className="srOnly">공부기록 저장하기</h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
          >
            <div>
              <label htmlFor="heading">제목</label>
              <input
                type="text"
                id="heading"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
              />
            </div>
            <div>
              <button type="submit">저장</button>
              <button
                type="button"
                onClick={() => {
                  setHeading('');
                  setIsOpen(false);
                }}
              >
                취소
              </button>
            </div>
          </form>
        </section>
      </Modal>
    </main>
  );
}
