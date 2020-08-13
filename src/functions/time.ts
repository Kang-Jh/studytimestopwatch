import Time from '../@types/time';

// performance가 존재하지 않으면 Date로 대체
const timeObject: any = typeof performance === 'object' ? performance : Date;
// getNow 함수를 이용하는 이유는 performance.now()를 사용할 수 없을 경우 Date.now()를 사용하기 위함
export const getNow: () => number = () => timeObject.now();
export const miliSecondsToSeconds: (miliseconds: number) => number = (
  miliseconds: number
): number => Math.floor(miliseconds / 1000);

// getTime는 초로 표현된 시간값을 입력값으로 받아
// 몇 시간, 몇 분, 몇 초인지를 구할 수 있게 해줌
export const getTime: (timeAsSec: number) => Time = (
  timeAsSec: number
): Time => {
  const hours: number = Math.floor(timeAsSec / 3600);
  const minutes: number = Math.floor((timeAsSec - hours * 3600) / 60);
  const seconds: number = timeAsSec - hours * 3600 - minutes * 60;

  return {
    hours,
    minutes,
    seconds,
  };
};

// 입력값이 10보다 작으면 앞에 0을 붙인 문자열을 return
// 입력값이 10 이상이면 입력값을 그대로 return
// 이로써 화면에 표시되는 시(또는 분 또는 초)가
// 10보다 작을 경우 앞에 0을 붙인 값이 화면에 표시됨
export const getDisplayTime: (number: number) => string | number = (number) => {
  return number < 10 ? `0${number}` : number;
};
