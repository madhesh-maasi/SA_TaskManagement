import * as React from "react";
import { useEffect, useState } from "react";
import { ITaskList, ITask } from "../../../../Interface/interface";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Avatar } from "primereact/avatar";
import styles from "./TaskList.module.scss";
interface TaskListProps {
  taskData: ITaskList;
}
const TaskList = (props: TaskListProps): JSX.Element => {
  const [taskData, setTaskData] = useState<ITaskList>([]);

  // Handler Functions for column templates. . .
  const handlerPerformerTemplate = (rowData: ITask): JSX.Element => {
    return (
      <div className={styles.tablePerformer}>
        <Avatar label={rowData.Performer.Title.charAt(0)} />
        {rowData.Performer.Title}
      </div>
    );
  };
  const handlerCategoryTemplate = (rowData: ITask): JSX.Element => {
    return <div className={styles.tableCategory}>{rowData.Category.Title}</div>;
  };
  const handlerStatusTemplate = (rowData: ITask): JSX.Element => {
    return (
      <div
        style={{
          backgroundColor:
            rowData.Status === "In Progress"
              ? "#DDE6F6"
              : rowData.Status === "Overdue"
              ? "#F6E7DD"
              : rowData.Status === "Awaiting Approval"
              ? "#F2F6DD"
              : rowData.Status === "Completed" || rowData.Status === "Approved"
              ? "#D4EDDA"
              : "#F8D7DA",
          color:
            rowData.Status === "In Progress"
              ? "#3D7E9A"
              : rowData.Status === "Overdue"
              ? "#856404"
              : rowData.Status === "Awaiting Approval"
              ? "#556B2F"
              : rowData.Status === "Completed" || rowData.Status === "Approved"
              ? "#155724"
              : "#721C24",
          padding: "0.3rem 0.5rem",
          borderRadius: "0.3rem",
          display: "inline-block",
        }}
      >
        {rowData.Status}
      </div>
    );
  };
  const handlerTaskDescriptionTemplate = (rowData: ITask): JSX.Element => {
    return (
      <div title={rowData?.TaskDescription}>
        {rowData.TaskDescription && rowData.TaskDescription?.length > 81
          ? rowData?.TaskDescription.slice(0, 81) + ". . ."
          : rowData?.TaskDescription}
      </div>
    );
  };
  const handlerTaskAction = (rowData: ITask): JSX.Element => {
    return (
      <div className={styles.actionIcons}>
        <i
          style={{ color: "#3362B5" }}
          className="pi pi-pencil"
          onClick={() => {
            console.log(`${rowData.ID} Edit Task`);
          }}
        />
        <i
          style={{ color: "#B53E33" }}
          className="pi pi-trash"
          onClick={() => {
            console.log(`${rowData.ID} Delete Task`);
          }}
        />
      </div>
    );
  };
  // Component Lifecycle
  useEffect(() => {
    setTaskData([...props.taskData]);
  }, [props.taskData]);
  return (
    <div>
      {taskData?.length > 0 ? (
        <DataTable value={taskData} className={styles.taskListTable}>
          <Column style={{ width: "4%" }} field="Title" header="No" />
          <Column style={{ width: "14%" }} field="TaskName" header="Name" />
          <Column
            style={{ width: "12%" }}
            field="Category"
            header="Category"
            body={handlerCategoryTemplate}
          />
          <Column
            style={{ width: "30%" }}
            field="TaskDescription"
            header="Description"
            body={handlerTaskDescriptionTemplate}
          />
          <Column
            style={{ width: "10%" }}
            field="Performer"
            header="Assigned to"
            body={handlerPerformerTemplate}
          />
          <Column
            style={{ width: "10%" }}
            field="StartDate"
            header="Start date"
          />
          <Column style={{ width: "10%" }} field="EndDate" header="End date" />
          <Column
            style={{ width: "16%" }}
            field="Status"
            header="Status"
            body={handlerStatusTemplate}
          />
          <Column style={{ width: "6%" }} header="" body={handlerTaskAction} />
        </DataTable>
      ) : (
        ""
      )}
    </div>
  );
};

export default TaskList;
