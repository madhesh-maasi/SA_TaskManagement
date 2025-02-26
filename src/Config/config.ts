/* eslint-disable @typescript-eslint/no-namespace */
import { ITenantDetail } from "../Interface/interface";
export namespace Config {
  export const TenantDetail: ITenantDetail = {
    webURL: `${window.location.origin}${window.location.pathname
      .split("/", 3)
      .join("/")}`,
    tenantURL: `${window.location.origin}`,
  };
  export const RecurrenceType = ["Daily", "Weekly", "Monthly"];
  export const Days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  export const Dates = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24, 25, 26, 27, 28, 29, 30, 31,
  ];
  export const ListName = {
    Category: "Category",
    Tasks: "Tasks",
    Config_Recurrence: "Config_Recurrence",
  };
}
