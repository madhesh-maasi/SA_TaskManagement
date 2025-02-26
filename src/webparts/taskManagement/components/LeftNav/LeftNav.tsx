import * as React from "react";
import { useEffect, useState } from "react";
import styles from "./LeftNav.module.scss";
import SALogo from "../../assets/Images/SALogo.png";
import NavTasksActive from "../../assets/Images/NavTasksActive.png";
import NavApprovalActive from "../../assets/Images/NavApprovalActive.png";
import NavReportActive from "../../assets/Images/NavReportActive.png";
import NavTasks from "../../assets/Images/NavTasks.png";
import NavApproval from "../../assets/Images/NavApproval.png";
import NavReport from "../../assets/Images/NavReport.png";

const LeftNav = (props: any): JSX.Element => {
  const [selectedNav, setSelectedNav] = useState("");

  const handleNavClick = (navItem: string): void => {
    setSelectedNav(navItem);
  };
  // Component Lifecycle
  useEffect(() => {
    setSelectedNav("Tasks");
  }, [props.currentUser]);

  return (
    <div className={styles.LeftNavContainer}>
      <div className={styles.logoSection}>
        <img src={SALogo} alt="SA Logo" />
      </div>
      <div className={styles.NavItems}>
        <div
          className={`${styles.NavItem} ${
            selectedNav === "Tasks" ? styles.ActiveItem : ""
          }`}
          onClick={() => handleNavClick("Tasks")}
        >
          <img
            src={selectedNav === "Tasks" ? NavTasksActive : NavTasks}
            alt="Tasks"
          />
          <div className={styles.NavItemLabel}>Tasks</div>
        </div>
        {props.currentUser?.isApprover && (
          <>
            <div
              className={`${styles.NavItem} ${
                selectedNav === "Approval" ? styles.ActiveItem : ""
              }`}
              onClick={() => handleNavClick("Approval")}
            >
              <img
                src={
                  selectedNav === "Approval" ? NavApprovalActive : NavApproval
                }
                alt="Approvals"
              />
              <div className={styles.NavItemLabel}>Approvals</div>
            </div>
            <div
              className={`${styles.NavItem} ${
                selectedNav === "Report" ? styles.ActiveItem : ""
              }`}
              onClick={() => handleNavClick("Report")}
            >
              <img
                src={selectedNav === "Report" ? NavReportActive : NavReport}
                alt="Report"
              />
              <div className={styles.NavItemLabel}>Report</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LeftNav;
