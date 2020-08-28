import React, { useState, useEffect, ReactElement } from 'react';
import Statistic from '../statistic';
import StudyRecordTable from '../studyRecordTable';
import { useParams } from 'react-router-dom';
import { StudyRecord } from '../../@types/studyRecord';

export default function (props: any): ReactElement | null {
  const { id }: { id: string } = useParams();
  const [record, setRecord] = useState<StudyRecord | null>(null);

  useEffect(() => {
    const idAsNumber: number = Number(id);
    // id는 1부터 시작하지만 index는 0부터 시작하므로 idAsNumber - 1
    const localStorageKey = localStorage.key(idAsNumber - 1) as string;
    const record: StudyRecord = JSON.parse(
      localStorage.getItem(localStorageKey) as string
    ) as StudyRecord;
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

      <StudyRecordTable record={record} />
    </div>
  );
}
