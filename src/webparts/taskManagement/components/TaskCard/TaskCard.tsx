import * as React from "react";
import { useEffect, useState } from "react";
import { ITask } from "../../../../Interface/interface";
import styles from "./TaskCard.module.scss";
// import { PrimeIcons } from "primereact/api";
interface TaskCardProps {
  task: ITask;
}

const TaskCard = (props: TaskCardProps): JSX.Element => {
  const [task, setTask] = useState<ITask | null>(null);

  useEffect(() => {
    console.log(props.task);
    setTask(props.task);
    console.log(task);
  }, [props.task]);

  return (
    <div className={styles.cardContainer}>
      {/* Header section */}
      <div className={styles.cardHeader}>
        <div className={styles.taskNumber}>T_0001</div>
        <div className={styles.statusOptions}>
          <div className={styles.statusText}>In Progress</div>
          <i className="pi pi-ellipsis-v" />
        </div>
      </div>
      {/* Header section */}
      {/* Title and Category */}
      <div className={styles.titleSection}>
        <div className={styles.taskTitle}>{task?.TaskName}</div>
        <div className={styles.taskCategory}>Sample</div>
      </div>
      {/* Title and Category */}
      {/* Description */}
      <div className={styles.taskDescription}>
        {task?.TaskDescription && task?.TaskDescription.length > 126
          ? task?.TaskDescription.slice(0, 126) + ". . ."
          : task?.TaskDescription}
      </div>
      {/* Description */}
      {/* Profile and  Completion date*/}
      <div className={styles.profileSection}>
        <div className={styles.taskPerformer}>{"Madhesh Maasi"}</div>
        <div className={styles.completionDate}>08/15/2025</div>
      </div>
      {/* Profile and  Completion date*/}
      {/* Date Range */}
      <div className={styles.taskDateRange}>
        <div className={styles.taskStartDate}>
          <i className="pi pi-calendar" />
          02/10/2020
        </div>
        <div className={styles.dashLine} />
        <div className={styles.taskEndDate}>
          <i className="pi pi-calendar" />
          02/10/2020
        </div>
      </div>
      {/* Date Range */}
    </div>
  );
};

export default TaskCard;
