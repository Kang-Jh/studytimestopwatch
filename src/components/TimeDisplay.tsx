import React from 'react';
import { Time } from '../@types/time';

// 입력값이 10보다 작으면 앞에 0을 붙인 문자열을 return
// 입력값이 10 이상이면 입력값을 그대로 return
// 이로써 화면에 표시되는 시(또는 분 또는 초)가
// 10보다 작을 경우 앞에 0을 붙인 값이 화면에 표시됨
function getDisplayTime(number: number): string {
  return number < 10 ? `0${number}` : `${number}`;
}

export default function ({ hours, minutes, seconds }: Time) {
  return (
    <span className="inline-block">
      {getDisplayTime(hours)}:{getDisplayTime(minutes)}:
      {getDisplayTime(seconds)}
    </span>
  );
}
