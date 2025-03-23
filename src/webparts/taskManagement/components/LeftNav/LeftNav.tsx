import * as React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import styles from "./LeftNav.module.scss";
import NavTasksActive from "../../assets/Images/NavTasksActive.png";
import NavApprovalActive from "../../assets/Images/NavApprovalActive.png";
import NavReportActive from "../../assets/Images/NavReportActive.png";
import NavTasks from "../../assets/Images/NavTasks.png";
import NavApproval from "../../assets/Images/NavApproval.png";
import NavReport from "../../assets/Images/NavReport.png";

const LeftNav = (props: any): JSX.Element => {
  const [selectedNav, setSelectedNav] = useState("");
  const [isNavOpen, setIsNavOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname.toLowerCase();
    if (path === "/task") {
      setSelectedNav("Tasks");
    } else if (path === "/approvals") {
      setSelectedNav("Approval");
    } else if (path === "/reports") {
      setSelectedNav("Report");
    } else {
      setSelectedNav("Tasks");
    }
  }, [location.pathname]);

  return (
    <div
      className={`${styles.LeftNavContainer} ${isNavOpen ? styles.open : ""}`}
    >
      <div className={styles.topSection}>
        <div className={styles.logoSection}>
          {/* <img src={SALogo} alt="SA Logo" /> */}
        </div>
        <div
          className={styles.toggleIcon}
          onClick={() => setIsNavOpen((prev) => !prev)}
        >
          <i
            className={isNavOpen ? "pi pi-chevron-left" : "pi pi-chevron-right"}
          />
        </div>
      </div>
      <div className={styles.NavItems}>
        <NavLink to="/task">
          <div
            className={`${styles.NavItem} ${
              selectedNav === "Tasks" ? styles.ActiveItem : ""
            }`}
          >
            <img
              src={selectedNav === "Tasks" ? NavTasksActive : NavTasks}
              alt="Tasks"
            />
            {isNavOpen && <div className={styles.NavItemLabel}>Tasks</div>}
          </div>
        </NavLink>
        {props.currentUser?.isApprover && (
          <NavLink to="/approvals">
            <div
              className={`${styles.NavItem} ${
                selectedNav === "Approval" ? styles.ActiveItem : ""
              }`}
            >
              <img
                src={
                  selectedNav === "Approval" ? NavApprovalActive : NavApproval
                }
                alt="Approvals"
              />
              {isNavOpen && (
                <div className={styles.NavItemLabel}>Approvals</div>
              )}
            </div>
          </NavLink>
        )}
        <NavLink to="/reports">
          <div
            className={`${styles.NavItem} ${
              selectedNav === "Report" ? styles.ActiveItem : ""
            }`}
          >
            <img
              src={selectedNav === "Report" ? NavReportActive : NavReport}
              alt="Report"
            />
            {isNavOpen && <div className={styles.NavItemLabel}>Report</div>}
          </div>
        </NavLink>
      </div>
    </div>
  );
};

export default LeftNav;
