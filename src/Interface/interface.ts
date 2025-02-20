/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @rushstack/no-new-null */

export interface IPersonField {
  ID: number;
  Title: string;
  EMail: string;
}

export interface ICategory {
  Title: string;
}

export interface IListName {
  Category: string;
  Recurrence: string;
  Tasks: string;
}

export interface ITask {
  ID: string;
  TaskName: string;
  TaskDescription: string;
  Category: string;
  Allocator: string;
  Performer: string;
  StartDate: string;
  EndDate: string;
  CompletionDate: string;
  IsApproval: string;
  Recurrence: string;
  IsCustomer: string;
  CustomerName: string;
  CustomerNo: string;
  PerformerComments: string;
  ApprovalComments: string;
  Status: string;
}

export type ITaskList = ITask[];

export interface IConfig_RecurrenceList {
  TaskName: string;
  StartDate: string | null;
  EndDate: string | null;
  Type: object;
  Day: object;
  Date: number;
  Status: object;
}
