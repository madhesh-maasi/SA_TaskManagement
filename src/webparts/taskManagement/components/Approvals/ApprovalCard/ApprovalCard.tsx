import * as React from "react";
import { useState, useEffect, useRef } from "react";
import styles from "./ApprovalCard.module.scss";
import { Avatar } from "primereact/avatar";
import ApprovalModal from "../ApprovalModal/ApprovalModal";
import { ITask } from "../../../../../Interface/interface";
import CustomToast, { CustomToastRef } from "../../shared/Toast";

interface ApprovalCardProps {
  item: ITask;
  handlerRender: () => void;
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

const ApprovalCard: React.FC<ApprovalCardProps> = ({
  item,
  handlerRender,
}): JSX.Element => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedAction, setSelectedAction] = useState("");
  const toastRef = useRef<CustomToastRef>(null);

  const handlerModalToggle = (flag: boolean): void => {
    setIsModalVisible(flag);
    handlerRender();
  };
  useEffect(() => {
    handlerModalToggle(false);
  }, []);

  // const handleToast = (
  //   severity: "success" | "info" | "warn" | "error",
  //   summary: string,
  //   detail: string
  // ): void => {
  //   if (toastRef.current) {
  //     toastRef.current.show(severity, summary, detail);
  //   }
  // };

  return (
    <>
      <CustomToast ref={toastRef} position="top-right" />
      <ApprovalModal
        isModalVisible={isModalVisible}
        selectedID={item.ID}
        selectedStatus={selectedAction}
        handlerModalToggle={handlerModalToggle}
      />
      <div className={styles.approvalCard}>
        <div className={styles.approvalCardHeader}>
          <div className={styles.approvalCardTitle}>{item.Title}</div>
          <div className={styles.approvalCardPerformer}>
            <div className={styles.taskPerformer}>
              <Avatar
                image={`/_layouts/15/userphoto.aspx?size=S&username=${item?.Performer?.EMail}`}
              />
              {item?.Performer?.Title}
            </div>
          </div>
        </div>
        <div className={styles.approvalCardBody}>
          <div className={styles.taskName}>{item?.TaskName}</div>
          <div className={styles.taskCategory}>{item?.Category.name}</div>
        </div>

        {/* Date Range */}
        <div className={styles.taskDateRange}>
          <div className={styles.taskStartDate}>
            <i className="pi pi-calendar" />
            {new Date(item.StartDate).toLocaleDateString()}
          </div>
          <div className={styles.dashLine} />
          <div className={styles.taskEndDate}>
            <i className="pi pi-calendar" />
            {new Date(item.EndDate).toLocaleDateString()}
          </div>
        </div>
        {/* Completed Date & Status Pill */}
        <div className={styles.approvalCardFooter}>
          <div className={styles.taskCompletedDate}>
            <i className="pi pi-calendar" />
            {item?.CompletionDate &&
            !isNaN(new Date(item.CompletionDate).getTime())
              ? new Date(item.CompletionDate).toLocaleDateString()
              : "-"}
          </div>
          <div>
            {item.Status !== "Awaiting approval" ? (
              <div style={statusStyleMap[item.Status]}>{item.Status}</div>
            ) : (
              <div className={styles.approvalAction}>
                <div
                  className={styles.approveButton}
                  onClick={() => {
                    setSelectedAction("Approve");
                    handlerModalToggle(true);
                  }}
                >
                  <i className="pi pi-check" />
                </div>
                <div
                  className={styles.rejectButton}
                  onClick={() => {
                    setSelectedAction("Reject");
                    handlerModalToggle(true);
                  }}
                >
                  <i className="pi pi-times" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ApprovalCard;
