import React, { useState, useReducer, useEffect, ReactElement } from 'react';
import { Record, PeriodRecord } from '../@types/record';
import { Time } from '../@types/time';
import '../styles/myRecords.css';
import {
  convertSecondsToTime,
  convertTimeToSeconds,
  getDisplayTime,
} from '../functions/time';

interface MyRecordsActionParameter {
  type: string;
  records?: Record[];
}

const recordsReducer = (
  state: Record[],
  { type, records = [] }: MyRecordsActionParameter
): Record[] => {
  const newState: Record[] = [...state];
  switch (type) {
    case 'init':
      return records;
    default:
      return [];
  }
};

export default function (props: any): ReactElement {
  const [records, setRecords] = useReducer(recordsReducer, []);
  const [totalPeriod, setTotalPeriod] = useState(0);
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
  const [avgStudyTime, setAvgStudyTime] = useState<Time>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [avgRestTime, setAvgRestTime] = useState<Time>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  // effect to init records
  useEffect(() => {
    let records: Record[] = [];
    if (localStorage.length === 0) {
      return;
    }

    for (let i = 0; i < localStorage.length; i++) {
      const key: string = localStorage.key(i) as string;
      const record: Record = JSON.parse(
        localStorage.getItem(key) as string
      ) as Record;

      records.push(record);
    }

    let totalPeriod: number = 0;
    let totalStudyTime: number = 0;
    let totalRestTime: number = 0;
    let avgStudyTime: number;
    let avgRestTime: number;
    for (let record of records) {
      const periodRecords: PeriodRecord[] = record.periodRecords;
      totalPeriod += periodRecords.length;
      // totalStudyTime은 항상 record에 항상 존재함
      totalStudyTime += convertTimeToSeconds(record.totalStudyTime as Time);
      // totalRestTime의 경우 1교시 공부중에 저장한 경우
      // totalRestTIme이 존재하지 않음
      totalRestTime += convertTimeToSeconds(
        record.totalRestTime
          ? record.totalRestTime
          : { hours: 0, minutes: 0, seconds: 0 }
      );
    }

    avgStudyTime = Math.round(totalStudyTime / totalPeriod);
    avgRestTime = Math.round(totalRestTime / totalPeriod);
    setRecords({ type: 'init', records });
    setTotalPeriod(totalPeriod);
    setTotalStudyTime(convertSecondsToTime(totalStudyTime));
    setTotalRestTime(convertSecondsToTime(totalRestTime));
    setAvgStudyTime(convertSecondsToTime(avgStudyTime));
    setAvgRestTime(convertSecondsToTime(avgRestTime));
  }, []);

  return (
    <main className="MyRecords">
      <div className="MyRecords-statistic">
        <h2>통계</h2>

        <div>
          <span>총 교시</span>
          <span>{totalPeriod}</span>
        </div>

        <div>
          <span>총 공부시간</span>
          <span>
            {getDisplayTime(totalStudyTime.hours)}:
            {getDisplayTime(totalStudyTime.minutes)}:
            {getDisplayTime(totalStudyTime.seconds)}
          </span>
        </div>

        <div>
          <span>총 휴식시간</span>
          <span>
            {getDisplayTime(totalRestTime.hours)}:
            {getDisplayTime(totalRestTime.minutes)}:
            {getDisplayTime(totalRestTime.seconds)}
          </span>
        </div>

        <div>
          <span>교시당 공부시간</span>
          <span>
            {getDisplayTime(avgStudyTime.hours)}:
            {getDisplayTime(avgStudyTime.minutes)}:
            {getDisplayTime(avgStudyTime.seconds)}
          </span>
        </div>

        <div>
          <span>교시당 휴식시간</span>
          <span>
            {getDisplayTime(avgRestTime.hours)}:
            {getDisplayTime(avgRestTime.minutes)}:
            {getDisplayTime(avgRestTime.seconds)}
          </span>
        </div>
      </div>
    </main>
  );
}
