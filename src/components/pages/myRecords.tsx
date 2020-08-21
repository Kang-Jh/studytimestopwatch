import React, { useState, useReducer, useEffect, ReactElement } from 'react';
import { Record, PeriodRecord } from '../../@types/record';
import { Time } from '../../@types/time';
import '../../styles/myRecords.css';
import {
  convertSecondsToTime,
  convertTimeToSeconds,
  convertTimeAsKorean,
} from '../../functions/time';
import { Link } from 'react-router-dom';
import Statistic from '../statistic';

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
  const [dates, setDates] = useState<string[]>([]);
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

  // effect to init states
  useEffect(() => {
    let records: Record[] = [];
    let dates: string[] = [];
    if (localStorage.length === 0) {
      return;
    }

    for (let i = 0; i < localStorage.length; i++) {
      const key: string = localStorage.key(i) as string;
      const record: Record = JSON.parse(
        localStorage.getItem(key) as string
      ) as Record;
      records.push({ ...record, key });

      // dates에 record의 날짜가 포함되어있지 않으면
      // dates에 날짜를 포함시킴
      if (!dates.includes(record.date)) {
        dates.push(record.date);
      }
    }

    let totalPeriod: number = 0;
    let totalStudyTime: number = 0;
    let totalRestTime: number = 0;
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

    // 날짜를 오름차순으로 정렬
    dates.sort();
    setRecords({ type: 'init', records });
    setDates(dates);
    setTotalPeriod(totalPeriod);
    setTotalStudyTime(convertSecondsToTime(totalStudyTime));
    setTotalRestTime(convertSecondsToTime(totalRestTime));
  }, []);

  return (
    <main className="MyRecords">
      <Statistic
        heading="전체 통계"
        totalPeriod={totalPeriod}
        totalStudyTime={totalStudyTime}
        totalRestTime={totalRestTime}
      />

      <div>
        <h2>공부 기록 목록</h2>
        <ol>
          {/* 날짜를 기준으로 기록을 분류 */}
          {dates.map((date) => (
            <li key={date}>
              {date}
              <ul>
                {/* 기록에서 같은 날짜인 것들만 필터링 해서 렌더링 */}
                {records
                  .filter((record) => date === record.date)
                  .map((record, index) => (
                    <li key={index}>
                      <h3>{record.heading}</h3>
                      <div>{record.date}</div>
                      <div>
                        공부시간 {convertTimeAsKorean(record.totalStudyTime)}
                      </div>
                      <div>
                        휴식시간 {convertTimeAsKorean(record.totalRestTime)}
                      </div>
                      <Link to={`/myRecords/${record.key}`}>세부 기록</Link>
                    </li>
                  ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </main>
  );
}
