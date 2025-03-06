import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { Avatar } from "primereact/avatar";
import styles from "./TaskCard.module.scss";
import { ITask } from "../../../../Interface/interface";
import CardOptions from "../../../../Common/CardOptions/CardOptions";
interface TaskCardProps {
  task: ITask;
  handlerModalProps: (type: string, id: number) => void;
  handlerDeleteModalProps: (flag: boolean, id: number) => void;
  currentUser: {
    Id: number;
    Title: string;
    Email: string;
    isApprover: boolean;
  };
}

// Update your status style map to include "Yet to start"
const statusStyleMap: { [key: string]: React.CSSProperties } = {
  "Yet to start": {
    backgroundColor: "#F0F0F0",
    color: "#333",
    padding: "0.2rem 2rem",
    borderRadius: "4px",
    fontWeight: 400,
  },
  "In Progress": {
    backgroundColor: "#DDE6F6",
    color: "#3362B5",
    padding: "0.2rem 2rem",
    borderRadius: "4px",
    fontWeight: 400,
  },
  Completed: {
    backgroundColor: "#E6F9E9",
    color: "#2E8B57",
    padding: "0.2rem 2rem",
    borderRadius: "4px",
    fontWeight: 400,
  },
  "Awaiting approval": {
    backgroundColor: "#FFF4E5",
    color: "#D97706",
    padding: "0.2rem 2rem",
    borderRadius: "4px",
    fontWeight: 400,
  },
  Approved: {
    backgroundColor: "#E6F4F1",
    color: "#218B81",
    padding: "0.2rem 2rem",
    borderRadius: "4px",
    fontWeight: 400,
  },
  Rejected: {
    backgroundColor: "#FBEAEA",
    color: "#D9534F",
    padding: "0.2rem 2rem",
    borderRadius: "4px",
    fontWeight: 400,
  },
};

const TaskCard = (props: TaskCardProps): JSX.Element => {
  const [task, setTask] = useState<ITask | null>(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Update the task state when prop changes
  useEffect(() => {
    setTask(props.task);
  }, [props.task]);

  // Handle clicking the three-dot icon
  const handleEllipsisClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // prevent triggering the document click event
    setOptionsVisible((prev) => !prev);
  };

  // Hide options if clicking outside this card
  const handleDocumentClick = (e: MouseEvent) => {
    if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
      setOptionsVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  // Option handlers (customize as needed)
  const handleEdit = (): void => {
    console.log("Edit clicked", task?.ID);
    props.handlerModalProps("Edit", task?.ID ?? 0);
    setOptionsVisible(false);
  };

  const handleDelete = (): void => {
    console.log("Delete clicked", task?.ID);
    props.handlerDeleteModalProps(true, task?.ID ?? 0);
    setOptionsVisible(false);
  };

  return (
    <div className={styles.cardContainer} ref={cardRef}>
      {/* Header section */}
      <div className={styles.cardHeader}>
        <div className={styles.taskNumber}>{task?.Title}</div>
        <div className={styles.statusOptions}>
          <div
            className={styles.statusText}
            style={statusStyleMap[task?.Status as string] || {}}
          >
            {task?.Status}
          </div>
          {(props.currentUser.isApprover ||
            task?.Author.EMail === props.currentUser.Email) && (
            <i className="pi pi-ellipsis-v" onClick={handleEllipsisClick} />
          )}
          <CardOptions
            id={task?.ID ?? 0}
            visible={optionsVisible}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
      </div>
      {/* Title and Category */}
      <div className={styles.titleSection}>
        <div className={styles.taskTitle}>{task?.TaskName}</div>
        <div className={styles.taskCategory}>{task?.Category.name}</div>
      </div>
      {/* Description */}
      <div className={styles.taskDescription} title={task?.TaskDescription}>
        {task?.TaskDescription && task?.TaskDescription.length > 126
          ? task?.TaskDescription.slice(0, 126) + ". . ."
          : task?.TaskDescription}
      </div>
      {/* Profile and Completion date */}
      <div className={styles.profileSection}>
        <div className={styles.taskPerformer}>
          {" "}
          <Avatar
            image={`/_layouts/15/userphoto.aspx?size=S&username=${
              props.currentUser.isApprover
                ? task?.Performer?.EMail
                : task?.Author?.EMail
            }`}
          />
          {props.currentUser.isApprover
            ? task?.Performer?.Title
            : task?.Author?.Title}
        </div>
        <div className={styles.completionDate}>
          <i className="pi pi-calendar" />
          {task?.CompletionDate ? task?.CompletionDate : "Not Completed"}
        </div>
      </div>
      {/* Date Range */}
      <div className={styles.taskDateRange}>
        <div className={styles.taskStartDate}>
          <i className="pi pi-calendar" />
          {new Date(task?.StartDate).toLocaleDateString()}
        </div>
        <div className={styles.dashLine} />
        <div className={styles.taskEndDate}>
          <i className="pi pi-calendar" />
          {new Date(task?.EndDate).toLocaleDateString()}
        </div>
      </div>
      {/* Date Range */}
    </div>
  );
};

export default TaskCard;
