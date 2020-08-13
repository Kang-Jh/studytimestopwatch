import React, { useState, useEffect, ReactElement } from 'react';
import { Record } from '../@types/record';
import '../styles/myRecords.css';

export default function (props: any): ReactElement {
  const [records, setRecords] = useState<Record[]>([]);

  useEffect(() => {
    let records: Record[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key: string = localStorage.key(i) as string;
      const record: Record = JSON.parse(localStorage.getItem(key) as string);

      records.push(record);
    }
    setRecords(records);
  }, []);

  return (
    <main className="myRecords">
      {records.map(
        ({ heading, date, periodRecords, totalStudyTime, totalRestTime }) => (
          <>
            <h3>{heading}</h3>
            <div>{date}</div>
            <div>
              {periodRecords.map(
                ({
                  period,
                  netStudyTimeHours,
                  netStudyTimeMinutes,
                  netStudyTimeSeconds,
                  restTimeHours,
                  restTimeMinutes,
                  restTimeSeconds,
                }) => (
                  <>
                    <h4>{period}</h4>
                  </>
                )
              )}
            </div>
          </>
        )
      )}
    </main>
  );
}
