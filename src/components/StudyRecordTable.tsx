import React from 'react';
import TimeDisplay from './TimeDisplay';
import { StudyRecord } from '../@types/studyRecord';

export default function ({ record }: { record: StudyRecord }) {
  return (
    <div>
      <table className="StudyRecordTable-table">
        <caption className="srOnly">교시당 공부시간 및 휴식시간</caption>
        <thead className="srOnly">
          <tr>
            <th scope="col">교시</th>
            <th scope="col">공부시간</th>
            <th scope="col">휴식시간</th>
          </tr>
        </thead>

        <tbody>
          {record.periodRecords.map(
            ({
              period,
              studyTimeHours,
              studyTimeMinutes,
              studyTimeSeconds,
              restTimeHours,
              restTimeMinutes,
              restTimeSeconds,
            }) => (
              <tr key={period}>
                <td>{period}</td>

                <td>
                  <TimeDisplay
                    hours={studyTimeHours as number}
                    minutes={studyTimeMinutes as number}
                    seconds={studyTimeSeconds as number}
                  />
                </td>

                {/* restTime_hours가 undefined가 아니면 나머지 restTime들도 undefined가 아니므로 restTime_hours만 사용 */}
                {restTimeHours !== undefined && (
                  <td>
                    <TimeDisplay
                      hours={restTimeHours}
                      minutes={restTimeMinutes as number}
                      seconds={restTimeSeconds as number}
                    />
                  </td>
                )}
              </tr>
            )
          )}
        </tbody>
      </table>
    </div>
  );
}
