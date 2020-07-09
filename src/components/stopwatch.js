import React, { useState, useLayoutEffect, useRef, useReducer } from 'react';

const timeObject = typeof performance === 'object' ? performance : Date;

const getNow = () => Math.floor(timeObject.now() / 1000);

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
  const { type, hours, minutes, seconds } = action;

  switch (type) {
    case 'reset':
      return [];
    case 'add':
      const newState = state.map((el) => el);
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
        const lastElement = newState[newState.length - 1];
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

        // 현재 타이머에 표시된 시간에서 마지막으로 표시된 시간을 뺀 값을 초로 표시한 값
        const net_studyTime =
          hours * 3600 +
          minutes * 60 +
          seconds -
          (lastElement.hours * 3600 +
            lastElement.minutes * 60 +
            lastElement.seconds);

        // 초로 표시된 시간값을 시, 분, 초로 변환
        const net_hours = getHours(net_studyTime);
        const net_minutes = getMinutes(net_studyTime, net_hours);
        const net_seconds = getSeconds(net_studyTime, net_hours, net_minutes);
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
    default:
      return state;
  }
};

export default function (props) {
  // getNow 함수를 이용하는 이유는 performance.now()를 사용할 수 없을 경우 Date.now()를 사용하기 위함
  const mountTimeRef = useRef(getNow()); // 컴포넌트가 마운트 되었을 때의 시간
  const runningTimeRef = useRef(mountTimeRef.current); // 타이머 실행시간을 위한 ref로 초기값은 마운트된 시간
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isResumed, setIsResumed] = useState(false);
  const [isReset, setIsReset] = useState(false);
  const [records, setRecords] = useReducer(recordsReducer, []);

  // useEffect 사용시 일시정지, 시작버튼을 빠르게 연속클릭할 시
  // 정지되어야 할 상황에서도 타이머가 계속 실행됨
  useLayoutEffect(() => {
    // 리셋버튼이 눌릴 시 타이머 실행시간을 초기화하기 위함
    if (!isStarted && isReset) {
      runningTimeRef.current = mountTimeRef.current;
    }
    // 시작 버튼이 클릭되면 실행
    if (isStarted) {
      let rAF;

      // 시작 버튼이 클릭된 시간에서 타이머가 실행된 시간을 뺌
      // 처음 클릭 시에는 컴포넌트가 마운트된 시간을 뺌
      let now = getNow();
      let runningTime = runningTimeRef.current;
      let elapsed = now - runningTime;

      // 컴포넌트가 화면에 painting 될 때마다 실행될 함수
      function timer() {
        // timer 함수가 실행될 때마다
        // 현재시간에서 elapsed를 빼줌으로써
        // 타이머가 실행된 시간만 계산하게 됨
        now = getNow() - elapsed;

        // 초로 표현된 시간값을 시, 분, 초값으로 변환
        const hours = getHours(now);
        const minutes = getMinutes(now, hours);
        const seconds = getSeconds(now, hours, minutes);

        setHours(hours);
        setMinutes(minutes);
        setSeconds(seconds);

        rAF = requestAnimationFrame(timer);
      }

      rAF = requestAnimationFrame(timer);

      return () => {
        // 러닝타임에 타이머가 실행된 시간을 저장
        runningTimeRef.current = now;
        cancelAnimationFrame(rAF);
      };
    }
  }, [isStarted, isReset]);

  return (
    <div className="Stopwatch">
      <div className="Stopwatch-display">
        <h2 className="Stopwatch-srOnlyHeader">총 공부시간</h2>
        <div className="Stopwatch-totalStudyTime">
          <span>
            {getDisplayTime(hours)}:{getDisplayTime(minutes)}:
            {getDisplayTime(seconds)}
          </span>
        </div>
      </div>

      <div className="buttonGroup">
        {isStarted || seconds || minutes || hours ? (
          <button
            type="button"
            onClick={() => {
              setHours(0);
              setMinutes(0);
              setSeconds(0);
              setIsStarted(false);
              setIsResumed(false);
              setIsReset(true);
              setRecords({ type: 'reset' });
            }}
          >
            리셋
          </button>
        ) : null}

        {isStarted ? (
          <button
            className="Stopwatch-pauseButton"
            type="button"
            onClick={() => {
              setIsStarted(false);
              setIsReset(false);
              setRecords({ type: 'add', hours, minutes, seconds });
            }}
          >
            일시정지
          </button>
        ) : (
          <button
            className="Stopwatch-startButton"
            type="button"
            onClick={() => {
              setIsStarted(true);
              setIsResumed(true);
              setIsReset(false);
            }}
          >
            {/* "시작"은 단 한 번만 나타나고 초기화 하기 전까지 "계속"이 나타남 */}
            {isResumed ? '계속' : '시작'}
          </button>
        )}
      </div>

      <table>
        <thead>
          <tr>
            <th>구간</th>
            <th>공부시간</th>
            <th>순공부시간</th>
          </tr>
        </thead>
        <tbody>
          {records.map(
            ({
              hours,
              minutes,
              seconds,
              net_hours,
              net_minutes,
              net_seconds,
              checkpoint,
            }) => (
              <tr key={checkpoint}>
                <td>{checkpoint}</td>
                <td>
                  <span>
                    {getDisplayTime(hours)}:{getDisplayTime(minutes)}:
                    {getDisplayTime(seconds)}
                  </span>
                </td>
                <td>
                  <span>
                    {getDisplayTime(net_hours)}:{getDisplayTime(net_minutes)}:
                    {getDisplayTime(net_seconds)}
                  </span>
                </td>
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
