import React, { useState, useEffect, ReactElement } from 'react';
import Statistic from '../statistic';
import { Time } from '../../@types/time';

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
    async function fetchStatOfUsers(): Promise<void> {
      try {
        const response = await fetch('http://localhost:4000/statisticOfUsers');
        const result = await response.json();
        const { totalPeriod, totalStudyTime, totalRestTime } = result;

        setTotalPeriod(totalPeriod);
        setTotalStudyTime(totalStudyTime);
        setTotalRestTime(totalRestTime);
      } catch (e) {
        console.error(e);
      }
    }

    fetchStatOfUsers();
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
