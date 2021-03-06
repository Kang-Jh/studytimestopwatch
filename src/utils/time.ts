import { Time, TimeObject } from '../@types/time';

// getNow 함수를 이용하는 이유는 performance.now()를 사용할 수 없을 경우 Date.now()를 사용하기 위함
export const getNow = (timeObject: TimeObject): number => timeObject.now();
export const convertMiliSecondsToSeconds = (miliseconds: number): number =>
  Math.floor(miliseconds / 1000);

// getTime는 초로 표현된 시간값을 입력값으로 받아
// 몇 시간, 몇 분, 몇 초인지를 구할 수 있게 해줌
export const convertSecondsToTime = (sec: number): Time => {
  const hours: number = Math.floor(sec / 3600);
  const minutes: number = Math.floor((sec - hours * 3600) / 60);
  const seconds: number = sec - hours * 3600 - minutes * 60;

  return {
    hours,
    minutes,
    seconds,
  };
};

export const convertTimeToSeconds = (time: Time): number => {
  const hours = time.hours;
  const minutes = time.minutes;
  const seconds = time.seconds;

  return hours * 3600 + minutes * 60 + seconds;
};

export const convertTimeAsKorean = (time: Time): string => {
  const { hours, minutes, seconds } = time;

  return `${hours}시간 ${minutes}분 ${seconds}초`;
};
/**
 * get day
 * @param {Day} number - Day as a number. 0 represent Sunday, 6 Represent Saturday
 * @return {string} Present a day as a Korean word
 */
export const getDayAsKorean = (number: number): string => {
  if (number === 0) {
    return '일';
  }

  if (number === 1) {
    return '월';
  }

  if (number === 2) {
    return '화';
  }

  if (number === 3) {
    return '수';
  }

  if (number === 4) {
    return '목';
  }

  if (number === 5) {
    return '금';
  }

  if (number === 6) {
    return '토';
  }

  throw new Error('올바른 인자가 아닙니다');
};

/**
 * return Korean date format string from date object
 * @param date {Date}
 * @return {string}
 */
export function getDateAsKorean(date: Date): string {
  return `${date.getFullYear()}년 ${
    date.getMonth() + 1
  }월 ${date.getDate()}일 ${getDayAsKorean(date.getDay())}요일`;
}
