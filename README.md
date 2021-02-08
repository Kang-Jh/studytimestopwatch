# 공부용 스톱워치

홈페이지 [https://www.studytimestopwatch.com]

## 사용된 프레임워크 및 라이브러리

- material-ui
- react
- react-router
- typescript

## 시간 측정의 원리

시간을 측정하기 위해 Performance(Performance를 지원하지 않는 경우 Date)를 사용하였습니다.

전체 시간의 측정 원리는 다음과 같습니다.

1. 페이지가 렌더링 되었을 때 전체 공부시간을 0으로 초기화 합니다.
2. 공부(또는 휴식) 버튼이 클릭될 때 버튼 클릭 시간과 prevTotalTime을 측정한 후 각각 변수에 저장합니다.
3. 버튼 클릭 시간에서 prevTotalTime을 뺀 값을 idleTime(유휴 시간)이라는 변수에 저장해주면 이후 이를 이용해 전체시간을 측정할 수 있게 됩니다. 이는 특정 시점에서의 시간 - 유휴 시간 = 전체 공부(또는 휴식)시간이라는 공식을 사용하기 위함입니다.
4. requestAnimationFrame을 이용하여 매 Painting마다 공식을 이용하여 전체 시간을 측정해줍니다.
5. 휴식(또는 공부) 버튼이 클릭되면 최근 전체 시간을 totalTimeRef에 저장해주면서 requestAnimationFrame을 취소해주는 clean-up이 실행되면서 휴식(또는 공부) 상태로 변하게 됩니다.
6. 현재 시간의 측정 원리는 최근 전체 시간에서 이전 전체 시간을 빼줌으로써 구해집니다.

## totalTimeState가 아닌 totalTimeRef를 사용한 이유

state를 사용할 경우 값이 변할 때마다 다시 렌더링되지만 ref를 사용할 경우 렌더링되지 않기 때문입니다. 이는 Effect들의 재실행을 초래합니다.

또한 이는 리액트의 의도와도 맞는 것으로 state는 값이 변할 경우 이것이 UI에 어떤 식으로든 즉각 반영이 되어야 할 경우에 사용하지만 ref의 경우 값이 변하더라도 UI에 늦게 반영되더라도 상관없을 경우 사용하기 때문입니다.

## 기록 원리

useReducer를 사용하여 기록을 관리합니다. 기록은 StudyRecord 타입을 지니며 StudyRecord에는 전체 공부시간, 전체 휴식시간, 교시당 공부기록(PeriodRecord[]) 등으로 구성되어 있습니다.

PeriodRecord는 교시(period), 공부(휴식) 시간을 시, 분, 초로 따로 기록하고 있습니다.

공부 버튼이 클릭될 경우 휴식 시간을 기록하게 되고, 휴식 버튼이 클릭될 경우 공부 시간이 기록됩니다.
