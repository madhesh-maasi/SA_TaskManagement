import * as React from "react";
import { useState, useEffect } from "react";
import { TabView, TabPanel } from "primereact/tabview";
import SpServices from "../../../../Services/SPServices/SpServices";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { Config } from "../../../../Config/config";
import ApprovalCard from "./ApprovalCard/ApprovalCard";
import Loader from "../../../../Common/Loader/Loader";
import styles from "./Approvals.module.scss";
import { ITaskList, ITask } from "../../../../Interface/interface";

interface ApprovalsProps {
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
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const handlerGetApprovalData = async () => {
    setIsLoading(true);
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
    })
      .then((res: ITask[]) => {
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
        setIsLoading(false);
      })
      .catch((error) => {
        console.log(error);
        setIsLoading(false);
      });
  };

  const handlerRender = (): void => {
    setRender(true);
  };

  useEffect(() => {
    if (render) {
      handlerGetApprovalData().catch((error) => {
        console.log(error);
      });
    }
  }, [render]);

  const handleRefresh = async (): Promise<void> => {
    setFilterStatus("");
    setFilterCategory("");
    setSearchText("");
    await handlerRender();
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
          {activeTabIndex === 1 && (
            <Dropdown
              optionLabel="name"
              optionValue="code"
              options={[
                { name: "Approved", code: "Approved" },
                { name: "Rejected", code: "Rejected" },
              ]}
              placeholder="Status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.value)}
            />
          )}
          <Dropdown
            optionLabel="name"
            optionValue="code"
            options={categoryValues}
            placeholder="Category"
            value={filterCategory}
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
      {
        <TabView
          className={styles.tabView}
          activeIndex={activeTabIndex}
          onTabChange={async (e) => {
            await handleRefresh();
            setActiveTabIndex(e.index);
            console.log("Selected tab index:", e.index);
          }}
        >
          <TabPanel header="Pending">
            {isLoading ? (
              <Loader />
            ) : (
              <div className={styles.approvalCardsSection}>
                {filteredData.filter(
                  (item) => item.Status === "Awaiting approval"
                ).length > 0 ? (
                  filteredData
                    .filter((item) => item.Status === "Awaiting approval")
                    .map((item) => (
                      <ApprovalCard
                        key={item.ID}
                        item={item}
                        handlerRender={handlerRender}
                      />
                    ))
                ) : (
                  <div className={styles.noDataContainer}>
                    <img
                      src={require("../../assets/Images/no-data.svg")}
                      alt="No approvals"
                      className={styles.noDataImage}
                    />
                    <p className={styles.noDataText}>
                      There are currently no pending approvals.
                    </p>
                  </div>
                )}
              </div>
            )}
          </TabPanel>
          <TabPanel header="Completed approvals">
            <div className={styles.approvalCardsSection}>
              {filteredData.filter(
                (item) =>
                  item.Status === "Approved" || item.Status === "Rejected"
              ).length > 0 ? (
                filteredData
                  .filter(
                    (item) =>
                      item.Status === "Approved" || item.Status === "Rejected"
                  )
                  .map((item) => (
                    <ApprovalCard
                      key={item.ID}
                      item={item}
                      handlerRender={handlerRender}
                    />
                  ))
              ) : (
                <div className={styles.noDataContainer}>
                  <img
                    src={require("../../assets/Images/no-data.svg")}
                    alt="No completed approvals"
                    className={styles.noDataImage}
                  />
                  <p className={styles.noDataText}>
                    There are currently no completed approvals.
                  </p>
                </div>
              )}
            </div>
          </TabPanel>
        </TabView>
      }
    </div>
  );
};

export default Approvals;
