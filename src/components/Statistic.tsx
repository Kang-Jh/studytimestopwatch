import React from 'react';
import { Time } from '../@types/time';
import {
  convertTimeAsKorean,
  convertSecondsToTime,
  convertTimeToSeconds,
} from '../utils/time';
import { Typography, Grid, makeStyles } from '@material-ui/core';

interface StatisticProps {
  heading?: string;
  totalPeriod: number;
  totalStudyTime: Time;
  totalRestTime: Time;
}

const useStyles = makeStyles((theme) => ({
  heading: {
    marginBottom: theme.spacing(4),
  },
}));

export default function ({
  heading,
  totalPeriod,
  totalStudyTime,
  totalRestTime,
}: StatisticProps) {
  const classes = useStyles();
  let initialAverageTime: Time = { hours: 0, minutes: 0, seconds: 0 };
  let averageStudyTime: Time;
  let averageRestTime: Time;

  // 총 공부한 교시가 0교시일 경우
  // 교시당 공부시간과 휴식시간은 모두 0시간 0분 0초
  // 공부한 교시가 1교시 이상일 경우
  // 교시당 공부시간과 휴식시간을 계산함
  if (totalPeriod === 0) {
    averageStudyTime = initialAverageTime;
    averageRestTime = initialAverageTime;
  } else {
    averageStudyTime = convertSecondsToTime(
      Math.round(convertTimeToSeconds(totalStudyTime) / totalPeriod)
    );

    averageRestTime = convertSecondsToTime(
      Math.round(convertTimeToSeconds(totalRestTime) / totalPeriod)
    );
  }

  return (
    <Grid container component="article" justify="center" spacing={2}>
      {heading ? (
        <Grid item xs={12} className={classes.heading}>
          <Typography variant="h5" component="h2" align="center">
            {heading}
          </Typography>
        </Grid>
      ) : null}

      <Grid item xs={12}>
        <Typography variant="body1" component="div" align="center">
          총 교시
        </Typography>

        <Typography variant="body1" component="div" align="center">
          {totalPeriod}교시
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant="body1" component="div" align="center">
          총 공부시간
        </Typography>

        <Typography variant="body1" component="div" align="center">
          {convertTimeAsKorean(totalStudyTime)}
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant="body1" component="div" align="center">
          총 휴식시간
        </Typography>

        <Typography variant="body1" component="div" align="center">
          {convertTimeAsKorean(totalRestTime)}
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant="body1" component="div" align="center">
          교시당 공부시간
        </Typography>

        <Typography variant="body1" component="div" align="center">
          {convertTimeAsKorean(averageStudyTime)}
        </Typography>
      </Grid>

      <Grid item xs={12} md={6}>
        <Typography variant="body1" component="div" align="center">
          교시당 휴식시간
        </Typography>

        <Typography variant="body1" component="div" align="center">
          {convertTimeAsKorean(averageRestTime)}
        </Typography>
      </Grid>
    </Grid>
  );
}
