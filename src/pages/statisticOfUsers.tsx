import React, { useState, useEffect, ReactElement } from 'react';
import Statistic from '../components/statistic';
import { getStatisticOfAllUsers } from '../utils/fetchReocrds';
import { Time } from '../@types/time';

export default function (): ReactElement {
  const [totalPeriod, setTotalPeriod] = useState(0);
  const [totalStudyTime, setTotalStudyTime] = useState<Time>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [totalRestTime, setTotalRestTime] = useState<Time>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    getStatisticOfAllUsers().then((fetchResult) => {
      const { totalPeriod, totalStudyTime, totalRestTime } = fetchResult;
      setTotalPeriod(totalPeriod);
      setTotalStudyTime(totalStudyTime);
      setTotalRestTime(totalRestTime);
    });
  }, []);

  return (
    <main className="StatsticOfUsers">
      <Statistic
        heading="전체유저 통계"
        totalPeriod={totalPeriod}
        totalStudyTime={totalStudyTime}
        totalRestTime={totalRestTime}
      />
    </main>
  );
}
