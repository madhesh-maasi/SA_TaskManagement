import * as React from "react";
import { useState, useEffect } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import SpServices from "../../../../Services/SPServices/SpServices";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Config } from "../../../../Config/config";
import ApprovalCard from "./ApprovalCard/ApprovalCard";
import styles from "./Approvals.module.scss";
import { ITaskList, ITask } from "../../../../Interface/interface";
interface ApprovalsProps {
  // Define the props here if there are any
  context: any;
  currentUser: any;
}

const Approvals = (props: ApprovalsProps): JSX.Element => {
  const [approvalData, setApprovalData] = useState<ITaskList>([]);
  const [render, setRender] = useState<boolean>(true);
  // Filter states for status, search text, and category
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");
  const [categoryValues, setCategoryValues] = useState<any[]>([]);
  const handlerGetApprovalData = async () => {
    await SpServices.SPReadItems({
      Listname: Config.ListName.Category,
    }).then((res: any[]) => {
      setCategoryValues(res.map((li) => ({ code: li.ID, name: li.Title })));
    });
    await SpServices.SPReadItems({
      Listname: Config.ListName.Tasks,
      Select:
        "*,Performer/Title,Performer/EMail,Author/Title,Author/EMail,Category/Title,Category/ID,Approver/Title,Approver/EMail,Recurrence/ID,Recurrence/Title",
      Expand: "Performer,Author,Category,Approver,Recurrence",
      Orderby: "ID",
      Orderbydecorasc: false,
      Filter: [
        {
          FilterKey: "IsApproval",
          Operator: "eq",
          FilterValue: 1,
        },
      ],
    }).then((res: ITask[]) => {
      const arrApprovalData: ITask[] = res.map((li: ITask) => {
        return {
          ID: li.ID,
          Title: li.Title,
          TaskName: li.TaskName,
          TaskDescription: li.TaskDescription,
          Category: { code: li?.Category?.ID, name: li?.Category?.Title },
          Author: li.Author,
          Performer: li.Performer,
          StartDate: new Date(li.StartDate).toLocaleDateString(),
          EndDate: new Date(li.EndDate).toLocaleDateString(),
          CompletionDate: li.CompletionDate
            ? new Date(li.CompletionDate).toLocaleDateString()
            : undefined,
          IsApproval: li.IsApproval,
          Recurrence: li.Recurrence
            ? { ID: li.Recurrence?.ID, Title: li.Recurrence?.Title }
            : undefined,
          IsRecurrence: li?.Recurrence ? true : false,
          IsCustomer: li.IsCustomer,
          CustomerName: li.CustomerName,
          CustomerNo: li.CustomerNo,
          PerformerComments: li.PerformerComments,
          ApprovalComments: li.ApprovalComments,
          Status: li.Status,
          Approver: li.Approver,
        };
      });
      setApprovalData([...arrApprovalData]);
    });
  };
  const handerRender = (): void => {
    setRender(true);
  };
  useEffect(() => {
    if (render) {
      handlerGetApprovalData().catch((error) => {
        console.log(error);
      });
      setRender(false);
    }
  }, [render]);

  const handleRefresh = (): void => {
    setFilterStatus("");
    setFilterCategory("");
    setSearchText("");
  };

  // Apply filters: status, category and by task name (case-insensitive)
  const filteredData = approvalData.filter((item) => {
    const matchStatus = filterStatus ? item.Status === filterStatus : true;
    const matchCategory = filterCategory
      ? item.Category?.code === filterCategory
      : true;
    const matchSearch = searchText
      ? item.TaskName?.toLowerCase().includes(searchText.toLowerCase())
      : true;
    return matchStatus && matchCategory && matchSearch;
  });

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
              { name: "Awaiting approval", code: "Awaiting approval" },
              { name: "Approved", code: "Approved" },
              { name: "Rejected", code: "Rejected" },
            ]}
            placeholder="Status"
            value={filterStatus} // bind selected value
            onChange={(e) => setFilterStatus(e.value)}
          />
          <Dropdown
            optionLabel="name"
            optionValue="code"
            options={categoryValues}
            placeholder="Category"
            value={filterCategory} // bind selected value
            onChange={(e) => setFilterCategory(e.value)}
          />
          <InputText
            placeholder="Search"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
          <i
            className={`pi pi-refresh ${styles.iconRefresh}`}
            onClick={handleRefresh}
          />
        </div>
      </div>
      <TabView>
        <TabPanel header="Pending">
          <div className={styles.approvalCardsSection}>
            {filteredData
              .filter((item) => item.Status === "Awaiting approval")
              .map((item) => (
                <ApprovalCard
                  key={item.ID}
                  item={item}
                  handerRender={handerRender}
                />
              ))}
          </div>
        </TabPanel>
        <TabPanel header="Approval completed">
          <div className={styles.approvalCardsSection}>
            {filteredData
              .filter(
                (item) =>
                  item.Status === "Approved" || item.Status === "Rejected"
              )
              .map((item) => (
                <ApprovalCard
                  key={item.ID}
                  item={item}
                  handerRender={handerRender}
                />
              ))}
          </div>
        </TabPanel>
      </TabView>
    </div>
  );
};
export default Approvals;
