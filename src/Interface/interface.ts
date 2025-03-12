/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @rushstack/no-new-null */
export interface ITenantDetail {
  webURL: string;
  tenantURL: string;
}
export interface ICurrentUserDetails {
  Id: number;
  Title: string;
  Email: string;
  isApprover: boolean;
}
export interface IPersonField {
  ID: number;
  Title: string;
  EMail: string;
}

export interface ICategory {
  Title?: string;
  ID?: string;
  code?: string;
  name?: string;
}
export interface IRecurrenceLookUp {
  Title: string;
  ID: string;
}

export interface IListName {
  Category: string;
  Recurrence: string;
  Tasks: string;
}

export interface ITask {
  ID: number;
  Title: string;
  TaskName: string;
  TaskDescription: string;
  Category: ICategory;
  Allocator: IPersonField;
  Performer: IPersonField;
  StartDate: string | undefined | any;
  EndDate: string | undefined | any;
  CompletionDate: string | undefined;
  IsApproval: boolean;
  IsRecurrence: boolean;
  Recurrence: IRecurrenceLookUp | undefined;
  RecurrenceType?: string;
  RecurrenceDay?: string;
  RecurrenceDate?: number;
  IsCustomer: boolean;
  CustomerName: string;
  CustomerNo: string;
  PerformerComments: string;
  ApprovalComments: string;
  Status: string;
  Approver?: IPersonField;
}

export type ITaskList = ITask[];

export interface IRecurrence {
  Title: string;
  StartDate: string | undefined | any;
  EndDate: string | undefined | any;
  Rec_Type: object;
  Rec_Day: object;
  Rec_Date: number;
  Rec_Status: object;
  IsApproval: boolean;
  Approver: IPersonField;
  Performer: IPersonField;
  Allocator: IPersonField;
  TaskDescription: string;
  Category: ICategory;
  NextTaskDate?: string;
  ID: number;
}
export type IRecurrenceList = IRecurrence[];
