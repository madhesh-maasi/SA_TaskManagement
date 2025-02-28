import * as React from "react";
import { useState, useEffect } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import SpServices from "../../../../Services/SPServices/SpServices";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Config } from "../../../../Config/config";
import ApprovalCard from "./ApprovalCard/ApprovalCard";
import styles from "./Approvals.module.scss";
interface ApprovalsProps {
  // Define the props here if there are any
  context: any;
  currentUser: any;
}

const Approvals = (props: ApprovalsProps): JSX.Element => {
  const [approvalData, setApprovalData] = useState<any[]>([]);

  const handlerGetApprovalData = async () => {
    await SpServices.SPReadItems({
      Listname: Config.ListName.Tasks,
    }).then((res) => {
      setApprovalData(
        res.filter(
          (item) =>
            item.Status === "Completed" ||
            item.Status === "Approved" ||
            item.Status === "Rejected"
        )
      );
      console.log(res);
      console.log(approvalData);
    });
  };
  useEffect(() => {
    handlerGetApprovalData().catch((error) => {
      console.log(error);
    });
  }, []);
  return (
    <div className={styles.approvalContainer}>
      <div className={styles.headerSection}>
        <div className={styles.headerSectionTitle}>
          <h3>Approvals</h3>
        </div>
        <div className={styles.headerSectionFilter}>
          <Dropdown
            optionLabel="name"
            optionValue="code"
            options={[
              { name: "Pending", code: "Pending" },
              { name: "All", code: "All" },
            ]}
            placeholder="Filter"
          />
          <InputText placeholder="Search" />
        </div>
      </div>
      <TabView>
        <TabPanel header="Pending">
          <div className={styles.approvalCardsSection}>
            {approvalData
              .filter((item) => item.Status === "Completed")
              .map((item) => (
                <ApprovalCard key={item.Id} item={item} />
              ))}
          </div>
        </TabPanel>
        <TabPanel header="All">
          <h1>All</h1>
        </TabPanel>
      </TabView>
    </div>
  );
};
export default Approvals;
