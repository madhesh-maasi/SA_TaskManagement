import * as React from "react";
import { ITaskList } from "../../../../../Interface/interface";
import styles from "./TotalTasks.module.scss";
import { Pie } from "react-chartjs-2";
interface TotalTasksProps {
  tasks: ITaskList;
}
const TotalTasks: React.FC<TotalTasksProps> = (tasks): JSX.Element => {
  return (
    <div className={styles.TotalTaskContainer}>
      <Pie data={tasks} />
    </div>
  );
};
export default TotalTasks;
