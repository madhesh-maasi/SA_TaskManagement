import * as React from "react";
import { useEffect, useState } from "react";
import { HashRouter, Routes, Route } from "react-router-dom";
import styles from "./TaskManagement.module.scss";
import { ITaskManagementProps } from "./ITaskManagementProps";
import "../assets/Css/styles.css";
import { ICurrentUserDetails } from "../../../Interface/interface";
import { sp } from "@pnp/sp/presets/all";
import "@pnp/sp/webs";
import "@pnp/sp/site-users";
import "@pnp/sp/site-groups";
import LeftNav from "./LeftNav/LeftNav";
import TaskContainer from "./TaskContainer/TaskContainer";
import Approvals from "./Approvals/Approvals";
import Reports from "./Reports/Reports";

const TaskManagement = ({ context }: ITaskManagementProps): JSX.Element => {
  const [currentUser, setCurrentUser] = useState<
    ICurrentUserDetails | undefined
  >();

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
      <HashRouter>
        <LeftNav currentUser={currentUser} />
        <Routes>
          <Route
            path="/task"
            element={
              <TaskContainer context={context} currentUser={currentUser!} />
            }
          />
          <Route
            path="/approvals"
            element={<Approvals context={context} currentUser={currentUser!} />}
          />
          <Route
            path="/reports"
            element={<Reports context={context} currentUser={currentUser!} />}
          />
          <Route
            path="*"
            element={
              <TaskContainer context={context} currentUser={currentUser!} />
            }
          />
        </Routes>
      </HashRouter>
    </div>
  );
};

export default TaskManagement;
