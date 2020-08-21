import React, { ReactElement } from 'react';
import { Time } from '../@types/time';
import {
  convertTimeAsKorean,
  convertSecondsToTime,
  convertTimeToSeconds,
} from '../functions/time';

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
  const averageStudyTime: Time = convertSecondsToTime(
    Math.round(convertTimeToSeconds(totalStudyTime) / totalPeriod)
  );
  const averageRestTime: Time = convertSecondsToTime(
    Math.round(convertTimeToSeconds(totalRestTime) / totalPeriod)
  );
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
