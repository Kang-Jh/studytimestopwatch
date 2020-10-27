import { useReducer } from 'react';
import { convertSecondsToTime, convertTimeToSeconds } from '../utils/time';
import { Time } from '../@types/time';
import { StudyRecord, PeriodRecord } from '../@types/studyRecord';

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

export default function useStudyRecord(): [
  StudyRecord,
  React.Dispatch<Partial<StopwatchActionParameter>>
] {
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

  return [record, setRecord];
}
