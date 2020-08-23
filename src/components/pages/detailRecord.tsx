import React, { useState, useEffect, ReactElement } from 'react';
import { useParams } from 'react-router-dom';
import { Record } from '../../@types/record';
import Statistic from '../statistic';

export default function (props: any): ReactElement | null {
  const { id }: { id: string } = useParams();
  const [record, setRecord] = useState<Record | null>(null);

  useEffect(() => {
    const idAsNumber: number = Number(id);
    const localStorageKey = localStorage.key(idAsNumber) as string;
    const record: Record = JSON.parse(
      localStorage.getItem(localStorageKey) as string
    ) as Record;
    setRecord(record);
  }, [id]);

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
