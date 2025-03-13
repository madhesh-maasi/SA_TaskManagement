import * as React from "react";
import { IRecurrence } from "../../../../../../Interface/interface";
import { Avatar } from "primereact/avatar";
import styles from "./RecurrenceCard.module.scss";

export interface RecurrenceCardProps {
  task: IRecurrence;
  key: number;
  handleUpdateToRecurrence: (key: number, type: string, status: string) => void;
}

const RecurrenceCard: React.FC<RecurrenceCardProps> = ({
  task,
  key,
  handleUpdateToRecurrence,
}) => {
  return (
    <div className={styles.RecurrenceCard} key={key}>
      {/* Card Header */}
      <div className={styles.cardHeader}>
        <h2>{task.Title}</h2>
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
                console.log(newStatus);
                handleUpdateToRecurrence(key, "status", newStatus);
                // You can add additional logic here to handle the status change
              }}
            />
            <span className={styles.slider}></span>
          </label>
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
          <div>{task.StartDate}</div>
          <div>{task.EndDate}</div>
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
              <div>
                <Avatar
                  image={`/_layouts/15/userphoto.aspx?size=S&username=${task?.Approver?.EMail}`}
                />
                {task?.Approver?.Title}
              </div>
            ) : (
              <div className={styles.NoApproval}>No approval</div>
            )}
          </div>
        </div>
        {/* Task Action */}
        <div className={styles.TaskAction}>
          <button>View</button>
          <button>Edit</button>
          <button>Delete</button>
        </div>
      </div>
    </div>
  );
};

export default RecurrenceCard;
