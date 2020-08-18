import { Time } from './time';

export interface Record {
  heading: string;
  date: Date;
  periodRecords: PeriodRecord[];
  totalStudyTime: Time;
  totalRestTime: Time;
}

export interface PeriodRecord {
  period?: number;
  netStudyTimeHours?: number;
  netStudyTimeMinutes?: number;
  netStudyTimeSeconds?: number;
  restTimeHours?: number;
  restTimeMinutes?: number;
  restTimeSeconds?: number;
}
