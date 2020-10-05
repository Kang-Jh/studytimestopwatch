import React from 'react';
import TimeDisplay from './TimeDisplay';
import { StudyRecord } from '../@types/studyRecord';
import {
  TableContainer,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  makeStyles,
} from '@material-ui/core';

const useStyles = makeStyles((theme) => ({
  caption: {
    padding: `0 !important`,
  },
  thead: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
  },
  tbody: {
    '& td:nth-child(1)': {
      width: '20%',
    },
    '& td:nth-child(2)': {
      width: '40%',
    },
    '& td:nth-child(3)': {
      width: '40%',
    },
  },
  td: {
    fontSize: `calc(1rem + 1vw)`,
    textAlign: 'center',
    borderBottom: 0,
  },
}));

export default function ({ record }: { record: StudyRecord }) {
  const classes = useStyles();

  return (
    <TableContainer component="article">
      <Table>
        <Typography
          variant="srOnly"
          component="caption"
          className={classes.caption}
        >
          교시당 공부시간 및 휴식시간
        </Typography>

        <TableHead className={classes.thead}>
          <TableRow>
            <TableCell scope="col">교시</TableCell>
            <TableCell scope="col">공부시간</TableCell>
            <TableCell scope="col">휴식시간</TableCell>
          </TableRow>
        </TableHead>

        <TableBody className={classes.tbody}>
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
              <TableRow key={period}>
                <TableCell className={classes.td}>{period}</TableCell>

                <TableCell className={classes.td}>
                  <TimeDisplay
                    hours={studyTimeHours as number}
                    minutes={studyTimeMinutes as number}
                    seconds={studyTimeSeconds as number}
                  />
                </TableCell>

                {/* restTime_hours가 undefined가 아니면 나머지 restTime들도 undefined가 아니므로 restTime_hours만 사용 */}
                {restTimeHours !== undefined ? (
                  <TableCell className={classes.td}>
                    <TimeDisplay
                      hours={restTimeHours}
                      minutes={restTimeMinutes as number}
                      seconds={restTimeSeconds as number}
                    />
                  </TableCell>
                ) : (
                  <TableCell className={classes.td}></TableCell>
                )}
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
