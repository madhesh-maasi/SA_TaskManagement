import * as React from "react";
import { IRecurrence } from "../../../../../../Interface/interface";
import { Avatar } from "primereact/avatar";
import { confirmPopup } from "primereact/confirmpopup";
import styles from "./RecurrenceCard.module.scss";

export interface RecurrenceCardProps {
  task: IRecurrence;
  cardKey: number;
  handleUpdateToRecurrence: (
    cardKey: number,
    type: string,
    status: string
  ) => void;
}

const formatDate = (dateInput?: string | Date): string => {
  if (!dateInput) return "";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) {
    console.error("Invalid date input:", dateInput);
    return "Invalid Date";
  }
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${month}/${day}/${year}`;
};

const RecurrenceCard: React.FC<RecurrenceCardProps> = ({
  task,
  cardKey,
  handleUpdateToRecurrence,
}) => {
  const confirmDelete = (event: React.MouseEvent) => {
    confirmPopup({
      target: event.currentTarget as HTMLElement,
      message: "Are you sure you want to delete this task?",
      icon: "pi pi-exclamation-triangle",
      acceptClassName: "p-button-danger",
      accept: () => handleUpdateToRecurrence(cardKey, "Delete", ""),
      reject: () => {
        console.log("Delete action was rejected");
      },
    });
  };

  return (
    <div className={styles.RecurrenceCard} key={cardKey}>
      {/* Card Header */}
      <div className={styles.cardHeader}>
        <h2>{task.Title}</h2>
        <div className={styles.cardActions}>
          <div
            className={`${styles.cardStatus} ${
              task.Rec_Status === "Active" ? styles.Active : styles.Inactive
            }`}
          >
            <span>{task.Rec_Status}</span>
            <label className={styles.switch}>
              <input
                type="checkbox"
                checked={task.Rec_Status === "Active"}
                onChange={(e) => {
                  const newStatus = e.target.checked ? "Active" : "Inactive";
                  console.log("Toggle new status:", newStatus);
                  handleUpdateToRecurrence(cardKey, "Update", newStatus);
                }}
              />
              <span className={styles.slider}></span>
            </label>
          </div>
          <div className={styles.cardAction} onClick={confirmDelete}>
            <i className="pi pi-trash"></i>
          </div>
        </div>
      </div>
      {/* Card Body */}
      <div className={styles.cardBody}>
        {/* Category */}
        <div className={styles.Category}>
          <span>{task.Category.name}</span>
        </div>
        {/* Rec Type */}
        <div className={styles.RecInfo}>
          <div
            className={`${styles.RecType} ${
              styles[
                task.Rec_Type === "Daily"
                  ? "Daily"
                  : task.Rec_Type === "Weekly"
                  ? "Weekly"
                  : "Monthly"
              ]
            }`}
          >
            <span>{task.Rec_Type}</span>
          </div>
          {task.Rec_Type !== "Daily" && (
            <div className={styles.RecDateOrDay}>
              <span>{task.Rec_Date || task.Rec_Day}</span>
            </div>
          )}
        </div>
        {/* Task Description */}
        <div className={styles.TaskDescription}>
          <span title={task?.TaskDescription}>
            {task?.TaskDescription && task?.TaskDescription.length > 103
              ? task?.TaskDescription.slice(0, 103) + ". . ."
              : task?.TaskDescription}
          </span>
        </div>
        {/* Task Date */}
        <div className={styles.TaskDate}>
          <div>{formatDate(task.StartDate)}</div>
          <div>{formatDate(task.EndDate)}</div>
        </div>
        {/* Task Users */}
        <div className={styles.TaskUsers}>
          <div className={styles.TaskPerformer}>
            <Avatar
              image={`/_layouts/15/userphoto.aspx?size=S&username=${task?.Performer?.EMail}`}
            />
            {task.Performer.Title}
          </div>
          <div className={styles.TaskAllocator}>
            <Avatar
              image={`/_layouts/15/userphoto.aspx?size=S&username=${task?.Allocator?.EMail}`}
            />
            {task.Allocator.Title}
          </div>
        </div>
        {/* Task Approver */}
        <div className={styles.TaskApproverSection}>
          <div className={styles.TaskApprover}>
            {task?.Approver ? (
              <>
                <Avatar
                  image={`/_layouts/15/userphoto.aspx?size=S&username=${task?.Approver?.EMail}`}
                />
                {task?.Approver?.Title}
              </>
            ) : (
              <div className={styles.NoApproval}>No approval</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecurrenceCard;
