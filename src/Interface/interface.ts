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

export interface ITaskList {
  ID: number;
  TaskNamme: string;
  TaskDescription: string;
  Category: any;
  Allocator: IPersonField | null;
  Performer: IPersonField | null;
  StartDate: string | null;
  EndDate: string | null;
  CompletionDate: string | null;
  IsApproval: boolean;
  Recurrence: any;
  IsCustomer: boolean;
  CustomerName: string | null;
  CustomerNo: string | null;
  PerformerComments: string | null;
  ApprovalComments: string | null;
  Status: any;
}

export interface IConfig_RecurrenceList {
  TaskName: string;
  StartDate: string | null;
  EndDate: string | null;
  Type: object;
  Day: object;
  Date: number;
  Status: object;
}
