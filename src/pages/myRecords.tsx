import React, { useState, useEffect, ReactElement } from 'react';
import { StudyRecord } from '../@types/studyRecord';
import { Time } from '../@types/time';
import '../styles/myRecords.css';
import {
  convertSecondsToTime,
  convertTimeToSeconds,
  convertTimeAsKorean,
} from '../utils/time';
import { Link } from 'react-router-dom';
import Statistic from '../components/statistic';

export default function (props: any): ReactElement {
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const dates = [...new Set(records.map((record) => record.date))].sort();
  const totalPeriod: number = (records as any[]).reduce(
    (prevTotalPeriod: number, record: StudyRecord): number => {
      return prevTotalPeriod + record.periodRecords.length;
    },
    0
  );
  const totalStudyTime: Time = convertSecondsToTime(
    (records as any[]).reduce(
      (timeAsSec: number, record: StudyRecord): number => {
        return timeAsSec + convertTimeToSeconds(record.totalStudyTime);
      },
      0
    )
  );
  const totalRestTime: Time = convertSecondsToTime(
    (records as any[]).reduce(
      (timeAsSec: number, record: StudyRecord): number => {
        return timeAsSec + convertTimeToSeconds(record.totalRestTime);
      },
      0
    )
  );

  // effect to init states
  useEffect(() => {
    let records: StudyRecord[] = [];
    if (localStorage.length === 0) {
      return;
    }

    for (let i = 0; i < localStorage.length; i++) {
      const key: string = localStorage.key(i) as string;
      const record: StudyRecord = JSON.parse(
        localStorage.getItem(key) as string
      ) as StudyRecord;
      // id is started from 1, not 0
      records.push({ ...record, id: i + 1 });
    }

    setRecords(records);
  }, []);

  return (
    <main className="MyRecords">
      <div>
        <button
          onClick={() => {
            localStorage.clear();
            setRecords([]);
          }}
        >
          리셋
        </button>
      </div>
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
                      <Link to={`/myRecords/${record.id}`}>세부 기록</Link>
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
