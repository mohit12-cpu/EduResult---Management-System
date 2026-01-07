
export enum UserRole {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER',
  STUDENT = 'STUDENT'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  username: string;
  password?: string;
}

export interface Student extends User {
  classId: string;
  rollNumber: string;
}

export interface Teacher extends User {
  subjectIds: string[];
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  maxMarks: number;
}

export interface Class {
  id: string;
  name: string;
}

export interface Mark {
  studentId: string;
  subjectId: string;
  theory: number;
  practical: number;
  total: number;
  grade: string;
  status: 'PASS' | 'FAIL';
}

export interface Attendance {
  studentId: string;
  classId: string;
  subjectId: string;
  workingDays: number;
  presentDays: number;
  percentage: number;
}

export interface Database {
  users: User[];
  students: Student[];
  teachers: Teacher[];
  subjects: Subject[];
  classes: Class[];
  marks: Mark[];
  attendance: Attendance[];
  settings: {
    isResultsPublished: boolean;
    scheduledPublication?: string;
  };
}
