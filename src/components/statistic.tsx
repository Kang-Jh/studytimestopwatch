import React, { ReactElement } from 'react';
import { Time } from '../@types/time';
import {
  convertTimeAsKorean,
  convertSecondsToTime,
  convertTimeToSeconds,
} from '../utils/time';

interface StatisticProps {
  heading?: string;
  totalPeriod: number;
  totalStudyTime: Time;
  totalRestTime: Time;
}

export default function ({
  heading = '통계',
  totalPeriod,
  totalStudyTime,
  totalRestTime,
}: StatisticProps): ReactElement {
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
    <article>
      <h2>{heading}</h2>

      <article>
        <span>총 교시 </span>
        <span>{totalPeriod}</span>
      </article>

      <article>
        <span>총 공부시간 </span>
        <span>{convertTimeAsKorean(totalStudyTime)}</span>
      </article>

      <article>
        <span>총 휴식시간 </span>
        <span>{convertTimeAsKorean(totalRestTime)}</span>
      </article>

      <article>
        <span>교시당 공부시간 </span>
        <span>{convertTimeAsKorean(averageStudyTime)}</span>
      </article>

      <article>
        <span>교시당 휴식시간 </span>
        <span>{convertTimeAsKorean(averageRestTime)}</span>
      </article>
    </article>
  );
}
