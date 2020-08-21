import React, { useState, useEffect, ReactElement } from 'react';
import { useParams } from 'react-router-dom';
import { Record } from '../../@types/record';
import Statistic from '../statistic';

export default function (props: any): ReactElement | null {
  const { localStorageKey }: { localStorageKey: string } = useParams();
  const [record, setRecord] = useState<Record | null>(null);

  useEffect(() => {
    const record: Record = JSON.parse(
      localStorage.getItem(localStorageKey) as string
    ) as Record;
    setRecord(record);
  }, [localStorageKey]);

  if (record === null) {
    return null;
  }

  return (
    <div>
      <Statistic
        heading="통계"
        totalPeriod={record.periodRecords.length}
        totalStudyTime={record.totalStudyTime}
        totalRestTime={record.totalRestTime}
      />
    </div>
  );
}
