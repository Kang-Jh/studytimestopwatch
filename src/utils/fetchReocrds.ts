import { StudyRecord } from '../@types/studyRecord';
import { Time } from '../@types/time';

export async function postStudyRecordsOfAllUsers(record: StudyRecord) {
  try {
    const response = await fetch(
      'http://localhost:4000/api/studyRecordsOfAllUsers',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(record),
      }
    );
    const json = await response.json();
    return json;
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
    'http://localhost:4000/api/statisticOfAllUsers',

    {
      signal,
      headers: {
        Accept: 'application/json',
      },
    }
  );
  const json = await response.json();
  const { totalPeriod, totalStudyTime, totalRestTime } = json;

  return {
    totalPeriod,
    totalStudyTime,
    totalRestTime,
  };
}
