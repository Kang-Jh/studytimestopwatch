import React, { useState, useEffect } from 'react';
import { StudyRecord } from '../@types/studyRecord';
import { Time } from '../@types/time';
import {
  convertSecondsToTime,
  convertTimeToSeconds,
  convertTimeAsKorean,
  getDateAsKorean,
} from '../utils/time';
import { Link as RouterLink } from 'react-router-dom';
import Statistic from '../components/Statistic';
import {
  Button,
  makeStyles,
  Grid,
  List,
  ListItem,
  ListItemText,
  Link,
  Collapse,
  Typography,
} from '@material-ui/core';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';

const useStyles = makeStyles((theme) => ({
  flex: {
    display: 'flex',
    alignItems: 'center',
  },
  columnDirection: {
    flexDirection: 'column',
  },
  textRight: {
    textAlign: 'right',
  },
}));

export default function (props: any) {
  const classes = useStyles();
  const [records, setRecords] = useState<StudyRecord[]>([]);
  const dates = [
    ...new Set(records.map((record) => getDateAsKorean(record.date))),
  ].sort();
  const [openRecord, setOpenRecord] = useState('');
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
      const record = JSON.parse(
        localStorage.getItem(key) as string
      ) as StudyRecord;
      record.date = new Date(record.date);
      // id is started from 1, not 0
      records.push(record);
    }

    setRecords(records);
  }, []);

  return (
    <Grid container justify="center" alignItems="center">
      <Grid item xs={12} md={7} className={classes.textRight}>
        <Button
          size="large"
          variant="contained"
          color="secondary"
          onClick={() => {
            localStorage.clear();
            setRecords([]);
          }}
        >
          리셋
        </Button>
      </Grid>

      <Grid item xs={12} md={7}>
        <Statistic
          heading="내 통계"
          totalPeriod={totalPeriod}
          totalStudyTime={totalStudyTime}
          totalRestTime={totalRestTime}
        />
      </Grid>

      <Grid item xs={12} md={7}>
        <Typography variant="srOnly" component="h2">
          공부 기록 목록
        </Typography>
        <List component="ol">
          {/* 날짜를 기준으로 기록을 분류 */}
          {dates.map((date) => (
            <ListItem
              className={classes.columnDirection}
              component="li"
              button
              key={date}
              onClick={() => {
                if (openRecord === date) {
                  setOpenRecord('');
                } else {
                  setOpenRecord(date);
                }
              }}
            >
              <div className={classes.flex}>
                <ListItemText>{date}</ListItemText>
                {openRecord === date ? <ExpandLess /> : <ExpandMore />}
              </div>

              <Collapse component="div" in={openRecord === date} timeout="auto">
                <List>
                  {/* 기록에서 같은 날짜인 것들만 필터링 해서 렌더링 */}
                  {records
                    .filter((record) => date === getDateAsKorean(record.date))
                    .map((record) => (
                      <ListItem
                        className={classes.columnDirection}
                        key={(record.localKey as number).toString()}
                      >
                        <ListItemText>{record.heading}</ListItemText>
                        <ListItemText>
                          공부시간 {convertTimeAsKorean(record.totalStudyTime)}
                        </ListItemText>
                        <ListItemText>
                          휴식시간 {convertTimeAsKorean(record.totalRestTime)}
                        </ListItemText>
                        <ListItemText>
                          <Link
                            component={RouterLink}
                            to={`/myRecords/${record.id}`}
                          >
                            세부 기록
                          </Link>
                        </ListItemText>
                      </ListItem>
                    ))}
                </List>
              </Collapse>
            </ListItem>
          ))}
        </List>
      </Grid>
    </Grid>
  );
}
