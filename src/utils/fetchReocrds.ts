import { StudyRecord } from '../@types/studyRecord';
import { Time } from '../@types/time';

export async function postStudyRecordsOfAllUsers(record: StudyRecord) {
  try {
    await fetch('https://api.studytimestopwatch.com/studyRecordsOfAllUsers', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(record),
    });

    return;
  } catch (e) {
    console.error(e);
  }
}

export async function getStatisticOfAllUsers(
  signal: AbortSignal
): Promise<{
  totalPeriod: number;
  totalStudyTime: Time;
  totalRestTime: Time;
}> {
  const response = await fetch(
    'https://api.studytimestopwatch.com/statisticOfAllUsers',
    {
      signal,
      mode: 'cors',
      headers: {
        Accept: 'application/json',
      },
    }
  );

  if (response.ok) {
    const json = await response.json();
    const {
      totalPeriod,
      totalRestTime,
      totalStudyTime,
    }: {
      totalPeriod: number;
      totalRestTime: Time;
      totalStudyTime: Time;
    } = json;
    return { totalPeriod, totalRestTime, totalStudyTime };
  } else {
    return {
      totalPeriod: 0,
      totalRestTime: { hours: 0, minutes: 0, seconds: 0 },
      totalStudyTime: { hours: 0, minutes: 0, seconds: 0 },
    };
  }
}
