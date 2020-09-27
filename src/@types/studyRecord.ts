import { Time } from './time';

export interface StudyRecord {
  id?: string;
  localKey?: number;
  heading: string;
  date: Date;
  periodRecords: Partial<PeriodRecord>[];
  totalStudyTime: Time;
  totalRestTime: Time;
}

export interface PeriodRecord {
  period: number;
  studyTimeHours: number;
  studyTimeMinutes: number;
  studyTimeSeconds: number;
  restTimeHours: number;
  restTimeMinutes: number;
  restTimeSeconds: number;
}
