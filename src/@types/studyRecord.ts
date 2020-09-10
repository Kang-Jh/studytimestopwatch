import { Time } from './time';

export interface StudyRecord {
  id?: string;
  localKey?: number;
  heading: string;
  date: string;
  periodRecords: Partial<PeriodRecord>[];
  totalStudyTime: Time;
  totalRestTime: Time;
}

export interface PeriodRecord {
  period: number;
  netStudyTimeHours: number;
  netStudyTimeMinutes: number;
  netStudyTimeSeconds: number;
  restTimeHours: number;
  restTimeMinutes: number;
  restTimeSeconds: number;
}
