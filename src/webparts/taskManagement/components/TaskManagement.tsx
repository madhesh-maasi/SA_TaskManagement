import * as React from "react";
// import styles from "./TaskManagement.module.scss";
import { ITaskManagementProps } from "./ITaskManagementProps";
import Loader from "../../../Common/Loader/Loader";
import "../assets/Css/styles.css";
const TaskManagement = ({
  description,
  isDarkTheme,
  environmentMessage,
  hasTeamsContext,
  userDisplayName,
}: ITaskManagementProps): JSX.Element => {
  return (
    <>
      <Loader />
    </>
  );
};
export default TaskManagement;
