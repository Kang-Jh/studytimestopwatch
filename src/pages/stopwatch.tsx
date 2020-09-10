import React, { useState, useLayoutEffect, useRef, useReducer } from 'react';
import Modal from '../components/modal';
import TimeDisplay from '../components/timeDisplay';
import StudyRecordTable from '../components/studyRecordTable';
import { Time, Day } from '../@types/time';
import { StudyRecord, PeriodRecord } from '../@types/studyRecord';
import {
  getNow,
  getDayAsKorean,
  convertSecondsToTime,
  convertTimeToSeconds,
  convertMiliSecondsToSeconds,
} from '../utils/time';
import { postStudyRecordsOfAllUsers } from '../utils/fetchReocrds';
import '../styles/stopwatch.css';

interface StopwatchActionParameter {
  type: string;
  hours?: number;
  minutes?: number;
  seconds?: number;
  heading?: string;
}
// recordsReducer는 일시정지 버튼이 클릭될 때마다 클릭된 시간을 기록
// 또는 리셋 버튼이 클릭될 경우 모든 기록을 삭제
const recordReducer = (
  state: StudyRecord,
  {
    type,
    hours = 0,
    minutes = 0,
    seconds = 0,
    heading = '',
  }: StopwatchActionParameter
): StudyRecord => {
  let newState: StudyRecord = { ...state };
  let lastPeriodRecord: Partial<PeriodRecord>;
  let periodRecords: Partial<PeriodRecord>[];

  switch (type) {
    case 'reset':
      return {
        date: state.date,
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
      if (state.periodRecords.length === 0) {
        periodRecords = [];
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
          state.totalStudyTime.hours !== hours ||
          state.totalStudyTime.minutes !== minutes ||
          state.totalStudyTime.seconds !== seconds;

        // 변하지 않았으면 state를 return
        if (!isChanged) {
          return state;
        }

        const netStudytime: number =
          convertTimeToSeconds({ hours, minutes, seconds }) -
          convertTimeToSeconds({
            hours: state.totalStudyTime.hours,
            minutes: state.totalStudyTime.minutes,
            seconds: state.totalStudyTime.seconds,
          });

        const {
          hours: netStudyTimeHours,
          minutes: netStudyTimeMinutes,
          seconds: netStudyTimeSeconds,
        }: Time = convertSecondsToTime(netStudytime);

        lastPeriodRecord = state.periodRecords[state.periodRecords.length - 1];
        const lastPeriod = lastPeriodRecord.period as number;

        periodRecords = [...state.periodRecords];
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
      periodRecords = [...state.periodRecords];

      // 마지막 교시 기록에 휴식시간이 존재하지 않으면
      // 휴식시간을 기록에 추가
      // 이미 존재하면 휴식시간을 수정하지 않음
      lastPeriodRecord = periodRecords[periodRecords.length - 1];
      if (lastPeriodRecord && lastPeriodRecord.restTimeHours === undefined) {
        lastPeriodRecord = {
          ...lastPeriodRecord,
          restTimeHours: hours,
          restTimeMinutes: minutes,
          restTimeSeconds: seconds,
        };

        // 총 휴식시간이 존재하는 경우 이전 총 휴식시간에 이번 교시 휴식시간을 더함
        // 존재하지 않을 경우 이번 교시 휴식시간을 총 휴식시간으로 설정
        const lastTotalRestTime: Time = state.totalRestTime;
        let newTotalRestTime: Time = convertSecondsToTime(
          convertTimeToSeconds(lastTotalRestTime) +
            convertTimeToSeconds({
              hours: hours,
              minutes: minutes,
              seconds: seconds,
            })
        );
        newState.totalRestTime = newTotalRestTime;
      }

      periodRecords[periodRecords.length - 1] = lastPeriodRecord;
      newState.periodRecords = periodRecords;

      return newState;
    case 'heading':
      newState = { ...newState, heading };
      return newState;
    default:
      return state;
  }
};

export default function (props: any) {
  const mountTimeRef = useRef(getNow());
  const runningTimeRef = useRef(0);
  const [studyTime, setStudyTime] = useState<Time>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [restTime, setRestTime] = useState<Time>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isStarted, setIsStarted] = useState(false);
  const [isResumed, setIsResumed] = useState(false);
  const [record, setRecord] = useReducer(recordReducer, {
    heading: '',
    date: `${new Date().getFullYear()}년 ${new Date().getMonth()}월 ${new Date().getDate()}일 ${getDayAsKorean(
      new Date().getDay() as Day
    )}요일`,
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
  const [isModalOpened, setIsModalOpened] = useState(false);
  const localStorageKeyRef = useRef('');

  // 리셋 이펙트로 실행시간 ref를 초기화
  useLayoutEffect(() => {
    // 리셋버튼이 클릭되면 runningTime을 초기화
    // 리셋버튼의 이벤트 핸들러에서 실행시간을 초기화할 경우(공부중 상태일 때)
    // 공부시간 측정 이펙트가 언마운트될 때 실행되는 로직에 의해 실행시간이 공부시간이 됨
    if (!isStarted && !isResumed) {
      runningTimeRef.current = 0;
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
      let runningTime: number;

      const buttonClickedTime: number = getNow();
      const prevRunningTime: number = runningTimeRef.current;
      const mountTime: number = mountTimeRef.current;

      // idleTime(휴식시간)은 버튼이 클릭된 시간에서 이전 실행시간과 마운트 시간을 뺸 것
      const idleTime: number = buttonClickedTime - prevRunningTime - mountTime;

      rAF = requestAnimationFrame(timer);

      // 컴포넌트가 화면에 painting 될 때마다 실행될 함수
      function timer(): void {
        // timer 함수가 실행될 때마다
        // 현재시간에서 elapsed를 빼줌으로써
        // 타이머가 실행된 시간만 계산하게 됨
        runningTime = getNow() - idleTime - mountTime;
        const nowAsSec: number = convertMiliSecondsToSeconds(runningTime);
        // 초로 표현된 시간값을 시, 분, 초값으로 변환
        const { hours, minutes, seconds }: Time = convertSecondsToTime(
          nowAsSec
        );

        // 위에서 구한 시, 분, 초값을 state에 저장
        setStudyTime({ hours, minutes, seconds });

        rAF = requestAnimationFrame(timer);
      }

      return () => {
        // 러닝타임 레퍼런스에 타이머가 실행된 시간을 저장
        runningTimeRef.current = runningTime;
        cancelAnimationFrame(rAF);
      };
    }
  }, [isStarted, isResumed]);

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
        const restTimeAsSec: number = convertMiliSecondsToSeconds(restTime);

        const {
          hours: restHours,
          minutes: restMinutes,
          seconds: restSeconds,
        }: Time = convertSecondsToTime(restTimeAsSec);

        setRestTime({
          hours: restHours,
          minutes: restMinutes,
          seconds: restSeconds,
        });

        rAF = requestAnimationFrame(timer);
      }

      return () => {
        cancelAnimationFrame(rAF);
      };
    }
  }, [isStarted, isResumed]);

  return (
    <main className="Stopwatch">
      <h2 className="srOnly">스톱워치 및 공부기록</h2>

      <article>
        <h3 className="srOnly">스톱워치</h3>
        {isStarted && !isResumed ? (
          <>
            <h4 className="Stopwatch-sectionHeader">휴식중...</h4>

            <div className="Stopwatch-stopwatchDisplay">
              <TimeDisplay
                hours={restTime.hours}
                minutes={restTime.minutes}
                seconds={restTime.seconds}
              />
            </div>
          </>
        ) : (
          <>
            {/* 초기 상태 또는 리셋 상태일 경우 스크린 리더들에게만 보이는 헤딩을 보여줌 */}
            {/* 공부하기가 클릭된 경우 공부중... 이라는 헤딩을 보여줌  */}
            {isStarted ? (
              <h4 className="Stopwatch-sectionHeader">공부중...</h4>
            ) : (
              <h4 className="srOnly">스톱워치 디스플레이</h4>
            )}

            <div className="Stopwatch-stopwatchDisplay">
              <TimeDisplay
                hours={studyTime.hours}
                minutes={studyTime.minutes}
                seconds={studyTime.seconds}
              />
            </div>
          </>
        )}

        <div>
          {/* 타이머가 한 번이라도 측정되었거나 기록이 저장되었으면 리셋 버튼을 표시 */}
          {(isStarted || localStorageKeyRef.current) && (
            <button
              className="Stopwatch-button Stopwatch-background-white"
              type="button"
              onClick={() => {
                localStorageKeyRef.current = '';
                setStudyTime({ hours: 0, minutes: 0, seconds: 0 });
                setRestTime({ hours: 0, minutes: 0, seconds: 0 });
                setIsStarted(false);
                setIsResumed(false);
                setRecord({ type: 'reset' });
              }}
            >
              리셋
            </button>
          )}

          {isResumed ? (
            <button
              className="Stopwatch-button Stopwatch-background-blue"
              type="button"
              onClick={() => {
                setIsResumed(false);
                setRecord({
                  type: 'studyTime',
                  hours: studyTime.hours,
                  minutes: studyTime.minutes,
                  seconds: studyTime.seconds,
                });
                setRestTime({ hours: 0, minutes: 0, seconds: 0 });
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
                // 휴식시간은 공부하기 버튼이 클릭될 때 측정됨
                setRecord({
                  type: 'restTime',
                  hours: restTime.hours,
                  minutes: restTime.minutes,
                  seconds: restTime.seconds,
                });
              }}
            >
              공부하기
            </button>
          )}
        </div>
      </article>

      <div className="Stopwatch-studyRecords-section">
        <StudyRecordTable record={record} />

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
                // 현재 공부시간을 측정 중인 경우 공부시간을 기록
                // 기록 후 휴식시간을 계속 측정
                setRecord({
                  type: 'studyTime',
                  hours: studyTime.hours,
                  minutes: studyTime.minutes,
                  seconds: studyTime.seconds,
                });
                setIsResumed(false);
              } else {
                // 현재 휴식시간을 측정 중인 경우
                // 휴식시간을 기록 후 타이머를 멈춤
                setRecord({
                  type: 'restTime',
                  hours: restTime.hours,
                  minutes: restTime.minutes,
                  seconds: restTime.seconds,
                });
                setIsStarted(false);
                setIsResumed(false);
              }
              setIsModalOpened(true);
            }}
          >
            저장하기
          </button>
        </div>
      </div>

      <Modal isOpened={isModalOpened}>
        <form
          className="Stopwatch-saveRecordsForm"
          onSubmit={(e) => {
            e.preventDefault();
            let key: string;
            if (localStorageKeyRef.current === '') {
              // 만약 스톱워치 사용중 저장한 적이 없으면
              // 로컬 스토리지에 저장된 아이템의 개수에 1을 더해서 키값으로 설정
              key = `${localStorage.length + 1}. ${record.heading}`;
              localStorage.setItem(
                key,
                JSON.stringify({ ...record, localKey: localStorage.length + 1 })
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

            setIsModalOpened(false);
            setRecord({ type: 'heading', heading: '' });
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
                setIsModalOpened(false);
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
