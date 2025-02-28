import * as React from "react";
import styles from "./ApprovalCard.module.scss";
import { Avatar } from "primereact/avatar";

interface ApprovalCardProps {
  item: any;
}
const statusStyleMap: { [key: string]: React.CSSProperties } = {
  Completed: {
    backgroundColor: "#E6F9E9",
    color: "#2E8B57",
    padding: "0.3rem 2rem",
    borderRadius: "0.3rem",
  },
  Approved: {
    backgroundColor: "#E6F4F1",
    color: "#218B81",
    padding: "0.3rem 2rem",
    borderRadius: "0.3rem",
  },
  Rejected: {
    backgroundColor: "#FBEAEA",
    color: "#D9534F",
    padding: "0.3rem 2rem",
    borderRadius: "0.3rem",
  },
};

const ApprovalCard: React.FC<ApprovalCardProps> = ({ item }): JSX.Element => {
  const status = item.Status || "Approved"; // Default to Approved if not provided

  return (
    <div className={styles.approvalCard}>
      <div className={styles.approvalCardHeader}>
        <div className={styles.approvalCardTitle}>{item.Title}</div>
        <div className={styles.approvalCardPerformer}>
          <div className={styles.taskPerformer}>
            <Avatar
              image={`/_layouts/15/userphoto.aspx?size=S&username=madhesh@safeaccounting.no`}
            />
            {"Madhesh"}
          </div>
        </div>
      </div>
      <div className={styles.approvalCardBody}>{item.TaskName}</div>
      {/* Date Range */}
      <div className={styles.taskDateRange}>
        <div className={styles.taskStartDate}>
          <i className="pi pi-calendar" />
          {new Date().toLocaleDateString()}
        </div>
        <div className={styles.dashLine} />
        <div className={styles.taskEndDate}>
          <i className="pi pi-calendar" />
          {new Date().toLocaleDateString()}
        </div>
      </div>
      {/* Completed Date & Status Pill */}
      <div className={styles.approvalCardFooter}>
        <div className={styles.taskCompletedDate}>
          <i className="pi pi-calendar" />
          {new Date().toLocaleDateString()}
        </div>
        <div>
          {item.Status !== "Completed" ? (
            <div style={statusStyleMap[status]}>{status}</div>
          ) : (
            <div className={styles.approvalAction}>
              <div className={styles.approveButton}>
                <i className="pi pi-check" />
              </div>
              <div className={styles.rejectButton}>
                <i className="pi pi-times" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApprovalCard;
