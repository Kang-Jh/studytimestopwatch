import React, { useEffect } from 'react';
import Statistic from '../components/Statistic';
import { getStatisticOfAllUsers } from '../utils/fetchReocrds';
import { Time } from '../@types/time';
import { Typography } from '@material-ui/core';

export default function ({
  statisticFetched,
  totalPeriod,
  totalStudyTime,
  totalRestTime,
  setStatisticFetched,
  setTotalPeriod,
  setTotalStudyTime,
  setTotalRestTime,
}: {
  statisticFetched: boolean;
  totalPeriod: number;
  totalStudyTime: Time;
  totalRestTime: Time;
  setStatisticFetched: React.Dispatch<React.SetStateAction<boolean>>;
  setTotalPeriod: React.Dispatch<React.SetStateAction<number>>;
  setTotalStudyTime: React.Dispatch<React.SetStateAction<Time>>;
  setTotalRestTime: React.Dispatch<React.SetStateAction<Time>>;
}) {
  useEffect(() => {
    if (statisticFetched) {
      return;
    }

    const abortController = new AbortController();
    const signal = abortController.signal;
    getStatisticOfAllUsers(signal)
      .then((fetchResult) => {
        const { totalPeriod, totalStudyTime, totalRestTime } = fetchResult;
        setStatisticFetched(true);
        setTotalPeriod(totalPeriod);
        setTotalStudyTime(totalStudyTime);
        setTotalRestTime(totalRestTime);
      })
      .catch(console.error);

    return () => {
      abortController.abort();
    };
  }, [
    statisticFetched,
    setStatisticFetched,
    setTotalPeriod,
    setTotalStudyTime,
    setTotalRestTime,
  ]);

  return (
    <div>
      <Typography component="p" variant="body1">
        전체유저 통계는 실시간 업데이트 되지 않고 일 단위로 업데이트 됩니다
      </Typography>
      <Statistic
        heading="전체유저 통계"
        totalPeriod={totalPeriod}
        totalStudyTime={totalStudyTime}
        totalRestTime={totalRestTime}
      />
    </div>
  );
}
