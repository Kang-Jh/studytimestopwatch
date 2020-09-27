import React, { useState, useLayoutEffect, useRef, useReducer } from 'react';
import Modal from '../../components/Modal/Modal';
import TimeDisplay from '../../components/TimeDisplay/TimeDisplay';
import StudyRecordTable from '../../components/StudyRecordTable/StudyRecordTable';
import { Time } from '../../@types/time';
import { StudyRecord, PeriodRecord } from '../../@types/studyRecord';
import {
  getNow,
  convertSecondsToTime,
  convertTimeToSeconds,
  convertMiliSecondsToSeconds,
} from '../../utils/time';
import { postStudyRecordsOfAllUsers } from '../../utils/fetchReocrds';
import './Stopwatch.css';

interface StopwatchActionParameter {
  type: string;
  totalStudyTime: Time;
  totalRestTime: Time;
  heading: string;
}
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
  const [isModalOpened, setIsModalOpened] = useState(false);
  const localStorageKeyRef = useRef('');

  // 리셋 이펙트
  useLayoutEffect(() => {
    if (!isStarted && !isResumed) {
      localStorageKeyRef.current = '';
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
    <div className="Stopwatch">
      <h2 className="srOnly">스톱워치 및 공부기록</h2>

      <section>
        <h3 className="srOnly">스톱워치</h3>
        <div className="Stopwatch-stopwatch">
          {isStarted && !isResumed ? (
            <>
              <h4>휴식중...</h4>

              <div>
                <TimeDisplay
                  hours={totalRestTime.hours}
                  minutes={totalRestTime.minutes}
                  seconds={totalRestTime.seconds}
                />
              </div>
            </>
          ) : (
            <>
              {/* 초기 상태 또는 리셋 상태일 경우 스크린 리더들에게만 보이는 헤딩을 보여줌 */}
              {/* 공부하기가 클릭된 경우 공부중... 이라는 헤딩을 보여줌  */}
              {isStarted ? (
                <h4>공부중...</h4>
              ) : (
                <h4 className="srOnly">스톱워치 디스플레이</h4>
              )}

              <div>
                <TimeDisplay
                  hours={totalStudyTime.hours}
                  minutes={totalStudyTime.minutes}
                  seconds={totalStudyTime.seconds}
                />
              </div>
            </>
          )}
        </div>

        <div>
          {/* 타이머가 한 번이라도 측정되었거나 기록이 저장되었으면 리셋 버튼을 표시 */}
          {(isStarted || localStorageKeyRef.current) && (
            <button
              className="button Stopwatch-button"
              type="button"
              onClick={() => {
                setTotalStudyTime({ hours: 0, minutes: 0, seconds: 0 });
                setTotalRestTime({ hours: 0, minutes: 0, seconds: 0 });
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
              className="button primary color-white Stopwatch-button"
              type="button"
              onClick={() => {
                setIsResumed(false);
                setRecord({
                  type: 'studyTime',
                  totalStudyTime,
                });
              }}
            >
              쉬기
            </button>
          ) : (
            <button
              className="button primary color-white Stopwatch-button"
              type="button"
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
              공부하기
            </button>
          )}
        </div>
      </section>

      <section className="Stopwatch-studyRecords-section">
        <h3 className="srOnly">공부기록</h3>
        <div className="Stopwatch-studyRecords-saveBtn textAlign-right">
          {/* 저장하기 버튼은 저장하기 modal을 여는 역할을 함 */}
          {/* 실제로 저장하는 것이 아님 */}
          <button
            className="button primary"
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
                setIsStarted(false);
                setIsResumed(false);
              }
              setIsModalOpened(true);
            }}
          >
            저장하기
          </button>
        </div>

        <StudyRecordTable record={record} />
      </section>

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
    </div>
  );
}
