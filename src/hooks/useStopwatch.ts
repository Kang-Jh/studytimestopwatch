import { useState, useRef, useLayoutEffect } from 'react';
import { Time, TimeObject } from '../@types/time';
import {
  getNow,
  convertSecondsToTime,
  convertTimeToSeconds,
  convertMiliSecondsToSeconds,
} from '../utils/time';

const timeObject: TimeObject =
  typeof performance === 'object' ? performance : Date;
export default function useStopwatch(): {
  totalStudyTime: Time;
  totalRestTime: Time;
  isStarted: boolean;
  isResumed: boolean;
  setIsStarted: React.Dispatch<React.SetStateAction<boolean>>;
  setIsResumed: React.Dispatch<React.SetStateAction<boolean>>;
  currentStudyTime: Time;
  currentRestTime: Time;
  reset: () => void;
} {
  function reset() {
    setTotalStudyTime({ hours: 0, minutes: 0, seconds: 0 });
    setTotalRestTime({ hours: 0, minutes: 0, seconds: 0 });
    setIsStarted(false);
    setIsResumed(false);
  }

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

  // 리셋 이펙트
  useLayoutEffect(() => {
    if (!isStarted && !isResumed) {
      totalRestTimeRef.current = 0;
      totalRunningTimeRef.current = 0;
    }
  }, [isStarted, isResumed]);

  // useEffect 사용시 일시정지, 시작버튼을 빠르게 연속클릭할 시
  // 정지되어야 할 상황에서도 타이머가 계속 실행됨
  // 공부시간을 측정하기 위한 이펙트
  useLayoutEffect(() => {
    // 공부하기 버튼이 클릭되면 실행
    if (isStarted && isResumed) {
      let rAF: number;

      // 실행시간은 버튼이 클릭된 시간에서 마운트된 시간과 휴식 시간을 뺀 것
      // 초기값을 totalRunningTime으로 설정해주는 것은 공부와 휴식 버튼이 빠른 속도로 계속 클릭될 경우
      // 화면에 시간이 페인팅 되기 전에 이펙트가 클린업 되므로
      // timeRef들이 undefined로 바뀜
      // 0을 초기값으로 할 경우 totalTime 자체가 초기화 될 수 있음
      let totalRunningTime: number = totalRunningTimeRef.current;

      const buttonClickedTime = getNow(timeObject);
      const prevTotalRunningTime = totalRunningTimeRef.current;

      // idleTime은 버튼이 클릭된 시간에서 이전 총실행시간을 뺸 값으로
      // 현재 총실행시간을 측정하기 위한 변수
      const idleTime = buttonClickedTime - prevTotalRunningTime;

      rAF = requestAnimationFrame(timer);

      // 컴포넌트가 화면에 painting 될 때마다 실행될 함수
      function timer(): void {
        totalRunningTime = getNow(timeObject) - idleTime;

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

  // 휴식시간을 측정하기 위한 이펙트
  // 공부시간을 측정하는 이펙트와 로직은 동일
  useLayoutEffect(() => {
    // 시작된 후 쉬기 버튼이 클릭되었을 경우 휴식시간을 측정하기 위한 조건문
    if (isStarted && !isResumed) {
      let rAF: number;

      let totalRestTime: number = totalRestTimeRef.current;

      const buttonClickedTime: number = getNow(timeObject);
      const prevTotalRestTime = totalRestTimeRef.current;

      // idleTime은 클릭된 시간에서 이전 총휴식시간을 뺀 값으로
      // 현재 총휴식시간을 측정하기 위한 변수
      const idleTime = buttonClickedTime - prevTotalRestTime;

      rAF = requestAnimationFrame(timer);
      function timer(): void {
        const now = getNow(timeObject);
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

  return {
    totalStudyTime,
    totalRestTime,
    isStarted,
    isResumed,
    setIsStarted,
    setIsResumed,
    currentStudyTime,
    currentRestTime,
    reset,
  };
}
