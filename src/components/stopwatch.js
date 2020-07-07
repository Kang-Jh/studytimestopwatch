import React, { useState, useLayoutEffect, useRef } from 'react';

const timeObject = typeof performance === 'object' ? performance : Date;

const getNow = () => Math.floor(timeObject.now() / 1000);
const getCurrentHours = (now) => Math.floor(now / 3600);
const getCurrentMinutes = (now, hours) => Math.floor((now - hours * 3600) / 60);
const getCurrentSeconds = (now, hours, minutes) =>
  now - hours * 3600 - minutes * 60;

export default function (props) {
  // getNow 함수를 이용하는 이유는 performance.now()를 사용할 수 없을 경우 Date.now()를 사용하기 위함
  const mountTimeRef = useRef(getNow()); // 컴포넌트가 마운트 되었을 때의 시간
  const runningTimeRef = useRef(mountTimeRef.current); // 타이머 실행시간을 위한 ref로 초기값은 마운트된 시간
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [isStarted, setIsStarted] = useState(false);
  const [isReset, setIsReset] = useState(false);

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
        const hours = getCurrentHours(now);
        const minutes = getCurrentMinutes(now, hours);
        const seconds = getCurrentSeconds(now, hours, minutes);

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
    <div>
      <div>
        {hours < 10 ? `0${hours}` : hours} :{' '}
        {minutes < 10 ? `0${minutes}` : minutes} :{' '}
        {seconds < 10 ? `0${seconds}` : seconds}
      </div>

      {isStarted || seconds || minutes || hours ? (
        <button
          type="button"
          onClick={() => {
            setHours(0);
            setMinutes(0);
            setSeconds(0);
            setIsStarted(false);
            setIsReset(true);
          }}
        >
          리셋
        </button>
      ) : null}

      {isStarted ? (
        <button
          type="button"
          onClick={() => {
            setIsStarted(false);
            setIsReset(false);
          }}
        >
          일시정지
        </button>
      ) : (
        <button
          type="button"
          onClick={() => {
            setIsStarted(true);
            setIsReset(false);
          }}
        >
          시작
        </button>
      )}
    </div>
  );
}
