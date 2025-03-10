import * as React from "react";
import { useEffect, useState } from "react";
import SpServices from "../../../../Services/SPServices/SpServices";
import { Config } from "../../../../Config/config";
import { ITaskList, ITask } from "../../../../Interface/interface";
import TotalTasks from "./TotalTasks/TotalTasks";
import styles from "./Reports.module.scss";
interface ReportsProps {
  // Define the props here if there are any
  context: any;
  currentUser: any;
}

const Reports = (props: ReportsProps): JSX.Element => {
  const [tasks, setTasks] = useState<ITaskList>([]);
  // Handler to get all the tasks
  const handlerGetAllTasks = async (): Promise<void> => {
    await SpServices.SPReadItems({
      Listname: Config.ListName.Tasks,
      Select:
        "*,Performer/Title,Performer/EMail,Allocator/Title,Allocator/EMail,Category/Title,Category/ID,Approver/Title,Approver/EMail,Recurrence/ID,Recurrence/Title",
      Expand: "Performer,Allocator,Category,Approver,Recurrence",
      Orderby: "ID",
      Orderbydecorasc: false,
    })
      .then((response) => {
        console.log(response);
        const taskList: ITaskList = [];
        response.map((li: ITask) => {
          return {
            ID: li.ID,
            Title: li.Title,
            TaskName: li.TaskName,
            TaskDescription: li.TaskDescription,
            Category: { code: li?.Category?.ID, name: li?.Category?.Title },
            Allocator: li.Allocator,
            Performer: li.Performer,
            StartDate: new Date(li.StartDate).toLocaleDateString(),
            EndDate: new Date(li.EndDate).toLocaleDateString(),
            CompletionDate: li.CompletionDate
              ? new Date(li.CompletionDate).toLocaleDateString()
              : undefined,
            IsApproval: li.IsApproval,
            Recurrence: li.Recurrence
              ? { ID: li.Recurrence?.ID, Title: li.Recurrence?.Title }
              : undefined,
            IsRecurrence: li?.Recurrence ? true : false,
            IsCustomer: li.IsCustomer,
            CustomerName: li.CustomerName,
            CustomerNo: li.CustomerNo,
            PerformerComments: li.PerformerComments,
            ApprovalComments: li.ApprovalComments,
            Status: li.Status,
            Approver: li.Approver,
          };
        });
        console.log(taskList);
        setTasks([...taskList]);
      })
      .catch((error) => {
        console.log(error);
      });
  };

  useEffect(() => {
    handlerGetAllTasks().catch((error) => console.log(error));
  }, []);
  return (
    <div className={styles.ReportContainer}>
      <TotalTasks tasks={tasks} />
    </div>
  );
};
export default Reports;
