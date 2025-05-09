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
  Overdue: {
    backgroundColor: "#FBEAEA",
    color: "#D9534F",
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

const formatDate = (dateStr?: string | null): string => {
  if (!dateStr) return "Not Completed";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "Invalid Date";
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

const TaskCard = (props: TaskCardProps): JSX.Element => {
  const [task, setTask] = useState<ITask | null>(null);
  const [optionsVisible, setOptionsVisible] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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

  // Update the task state when prop changes
  useEffect(() => {
    setTask(props.task);
  }, [props.task]);

  useEffect(() => {
    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);
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
            task?.Allocator.EMail === props.currentUser.Email ||
            task?.Performer.EMail === props.currentUser.Email) && (
            <i className="pi pi-ellipsis-v" onClick={handleEllipsisClick} />
          )}
          <CardOptions
            isView={
              task?.Status !== "Yet to start" &&
              task?.Status !== "In Progress" &&
              task?.Status !== "Overdue"
            }
            isDelete={
              props.currentUser.isApprover ||
              task?.Allocator.EMail === props.currentUser.Email
            }
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
        {task?.TaskDescription && task?.TaskDescription.length > 103
          ? task?.TaskDescription.slice(0, 103) + ". . ."
          : task?.TaskDescription}
      </div>
      {/* Profile and Completion date */}
      <div className={styles.profileSection}>
        <div className={styles.taskPerformer}>
          <Avatar
            image={`/_layouts/15/userphoto.aspx?size=S&username=${
              props.currentUser.isApprover
                ? task?.Performer?.EMail
                : task?.Allocator?.EMail
            }`}
          />
          <span>
            {props.currentUser.isApprover
              ? task?.Performer?.Title
              : task?.Allocator?.Title}
          </span>
        </div>
        <div className={styles.completionStatus}>
          <i className="pi pi-calendar" />
          <span>{formatDate(task?.CompletionDate)}</span>
        </div>
      </div>
      {/* Date Range */}
      <div className={styles.taskDateRange}>
        <div className={styles.dateWrapper}>
          <i className="pi pi-calendar" />
          <span className={styles.date}>{formatDate(task?.StartDate)}</span>
        </div>
        <div className={styles.separator} />
        <div className={styles.dateWrapper}>
          <i className="pi pi-calendar" />
          <span className={styles.date}>{formatDate(task?.EndDate)}</span>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
