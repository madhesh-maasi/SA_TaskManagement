import * as React from "react";
import { useEffect, useState } from "react";
import styles from "./TaskManagement.module.scss";
import { ITaskManagementProps } from "./ITaskManagementProps";
import "../assets/Css/styles.css";
import LeftNav from "./LeftNav/LeftNav";
import TaskContainer from "./TaskContainer/TaskContainer";
import { ICurrentUserDetails } from "../../../Interface/interface";
import { sp } from "@pnp/sp/presets/all";
import "@pnp/sp/webs";
import "@pnp/sp/site-users";
import "@pnp/sp/site-groups";
const TaskManagement = ({ context }: ITaskManagementProps): JSX.Element => {
  const [currentUser, setCurrentUser] = useState<ICurrentUserDetails>();
  const handlerIsCurrentUserApprover = (): void => {
    sp.web.currentUser
      .get()
      .then((user) => {
        setCurrentUser({
          Id: user.Id,
          Title: user.Title,
          Email: user.Email,
          isApprover: false,
        });
        try {
          sp.web.siteGroups
            .getByName("Approvers")
            .users.getById(user.Id)
            .get()
            .then((res) => {
              if (res) {
                setCurrentUser({
                  Id: user.Id,
                  Title: user.Title,
                  Email: user.Email,
                  isApprover: true,
                });
              }
            })
            .catch((error) => {
              console.log(error);
            });
        } catch (error) {
          console.log(error);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };
  useEffect(() => {
    handlerIsCurrentUserApprover();
  }, []);
  return (
    <div className={styles.Container}>
      <LeftNav currentUser={currentUser} />
      {currentUser && (
        <TaskContainer context={context} currentUser={currentUser} />
      )}
    </div>
  );
};
export default TaskManagement;
