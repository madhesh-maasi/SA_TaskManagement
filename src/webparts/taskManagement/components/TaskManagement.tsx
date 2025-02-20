import * as React from "react";
import styles from "./TaskManagement.module.scss";
import { ITaskManagementProps } from "./ITaskManagementProps";
import "../assets/Css/styles.css";
import LeftNav from "./LeftNav/LeftNav";
import TasksList from "./TaskContainer/TaskContainer";
const TaskManagement = ({ context }: ITaskManagementProps): JSX.Element => {
  return (
    <div className={styles.Container}>
      <LeftNav />
      <TasksList context={context} />
    </div>
  );
};
export default TaskManagement;
