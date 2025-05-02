import * as React from "react";
import { useEffect, useState } from "react";
import { ITaskList, ITask } from "../../../../Interface/interface";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Avatar } from "primereact/avatar";
import styles from "./TaskList.module.scss";

interface TaskListProps {
  taskData: ITaskList;
  handlerModalProps: (type: string, id: number) => void;
  handlerDeleteModalProps: (flag: boolean, id: number) => void;
}

// Date formatting helper using getMonth, getDate, and getFullYear for "MM/DD/YYYY" format.
const formatDate = (dateStr?: string): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Invalid Date";
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

const TaskList = (props: TaskListProps): JSX.Element => {
  const [taskData, setTaskData] = useState<ITaskList>([]);

  // Column template for Start Date
  const handlerStartDateTemplate = (rowData: ITask): JSX.Element => {
    return <>{formatDate(rowData.StartDate)}</>;
  };

  // Column template for End Date
  const handlerEndDateTemplate = (rowData: ITask): JSX.Element => {
    return <>{formatDate(rowData.EndDate)}</>;
  };

  // Handler Functions for other column templates. . .
  const handlerPerformerTemplate = (rowData: ITask): JSX.Element => {
    return (
      <div className={styles.tablePerformer}>
        <Avatar
          image={`/_layouts/15/userphoto.aspx?size=S&username=${rowData?.Performer.EMail}`}
        />
        {rowData?.Performer?.Title}
      </div>
    );
  };

  const handlerCategoryTemplate = (rowData: ITask): JSX.Element => {
    return (
      <div className={styles.tableCategory}>{rowData?.Category?.name}</div>
    );
  };

  const handlerStatusTemplate = (rowData: ITask): JSX.Element => {
    return (
      <div
        style={{
          backgroundColor:
            rowData.Status === "Yet to start"
              ? "#F0F0F0"
              : rowData.Status === "In Progress"
              ? "#DDE6F6"
              : rowData.Status === "Overdue"
              ? "#F6E7DD"
              : rowData.Status === "Awaiting approval"
              ? "#F2F6DD"
              : rowData.Status === "Completed" || rowData.Status === "Approved"
              ? "#D4EDDA"
              : "#F8D7DA",
          color:
            rowData.Status === "Yet to start"
              ? "#333"
              : rowData.Status === "In Progress"
              ? "#3D7E9A"
              : rowData.Status === "Overdue"
              ? "#856404"
              : rowData.Status === "Awaiting approval"
              ? "#556B2F"
              : rowData.Status === "Completed" || rowData.Status === "Approved"
              ? "#155724"
              : "#721C24",
          padding: "0.3rem 0.5rem",
          borderRadius: "0.3rem",
          fontWeight: 400,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {rowData.Status}
      </div>
    );
  };

  const handlerTaskDescriptionTemplate = (rowData: ITask): JSX.Element => {
    return (
      <div title={rowData?.TaskDescription}>
        {rowData.TaskDescription && rowData.TaskDescription.length > 81
          ? rowData.TaskDescription.slice(0, 81) + ". . ."
          : rowData.TaskDescription}
      </div>
    );
  };

  const handlerDeleteModalProps = (id: number): void => {
    props.handlerDeleteModalProps(true, id);
  };

  const handlerTaskAction = (rowData: ITask): JSX.Element => {
    return (
      <div className={styles.actionIcons}>
        <i
          style={{ color: "#3362B5" }}
          className={`pi ${
            rowData.Status === "Completed" ||
            rowData.Status === "Approved" ||
            rowData.Status === "Rejected" ||
            rowData.Status === "Awaiting approval"
              ? "pi-eye"
              : "pi-pencil"
          }`}
          onClick={() => {
            console.log(`${rowData.ID} Edit Task`);
            props.handlerModalProps("Edit", rowData.ID);
          }}
        />
        <i
          style={{ color: "#B53E33" }}
          className="pi pi-trash"
          onClick={() => {
            handlerDeleteModalProps(rowData.ID);
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
        <DataTable
          value={taskData}
          className={styles.taskListTable}
          responsiveLayout="scroll"
          scrollable
          scrollHeight="flex"
        >
          <Column
            style={{ width: "4%" }}
            field="Title"
            header="No"
            data-label="No"
          />
          <Column
            style={{ width: "14%" }}
            field="TaskName"
            header="Name"
            data-label="Name"
          />
          <Column
            style={{ width: "12%" }}
            field="Category"
            header="Category"
            body={handlerCategoryTemplate}
            data-label="Category"
          />
          <Column
            style={{ width: "30%" }}
            field="TaskDescription"
            header="Description"
            body={handlerTaskDescriptionTemplate}
            data-label="Description"
          />
          <Column
            style={{ width: "15%" }}
            field="Performer"
            header="Assigned to"
            body={handlerPerformerTemplate}
            data-label="Assigned to"
          />
          <Column
            style={{ width: "6%" }}
            header="Start date"
            body={handlerStartDateTemplate}
            data-label="Start date"
          />
          <Column
            style={{ width: "6%" }}
            header="End date"
            body={handlerEndDateTemplate}
            data-label="End date"
          />
          <Column
            style={{ width: "16%" }}
            field="Status"
            header="Status"
            body={handlerStatusTemplate}
            data-label="Status"
          />
          <Column
            style={{ width: "6%" }}
            header=""
            body={handlerTaskAction}
            data-label="Actions"
          />
        </DataTable>
      ) : (
        ""
      )}
    </div>
  );
};

export default TaskList;
