import React, { useState, useEffect } from 'react';
import Statistic from '../components/Statistic';
import StudyRecordTable from '../components/StudyRecordTable';
import { useParams } from 'react-router-dom';
import { StudyRecord } from '../@types/studyRecord';
import { getDateAsKorean } from '../utils/time';
import { Typography, makeStyles } from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  heading: {
    marginBottom: theme.spacing(5),
  },
  date: {
    marginBottom: theme.spacing(3),
  },
}));

export default function (props: any) {
  const classes = useStyles();
  const { id }: { id: string } = useParams();
  const [record, setRecord] = useState<StudyRecord | null>(null);

  useEffect(() => {
    const idAsNumber: number = Number(id);
    // id는 1부터 시작하지만 index는 0부터 시작하므로 idAsNumber - 1
    const localStorageKey = localStorage.key(idAsNumber - 1) as string;
    const record: StudyRecord = JSON.parse(
      localStorage.getItem(localStorageKey) as string
    ) as StudyRecord;
    record.date = new Date(record.date);
    setRecord(record);
  }, [id]);

  if (record === null) {
    return null;
  }

  return (
    <div>
      <Typography
        variant="h4"
        component="h2"
        align="center"
        className={classes.heading}
      >
        {record.heading}
      </Typography>

      <Typography
        variant="body1"
        component="p"
        align="right"
        className={classes.date}
      >
        {getDateAsKorean(record.date)}
      </Typography>

      <Statistic
        totalPeriod={record.periodRecords.length}
        totalStudyTime={record.totalStudyTime}
        totalRestTime={record.totalRestTime}
      />

      <StudyRecordTable record={record} />
    </div>
  );
}
