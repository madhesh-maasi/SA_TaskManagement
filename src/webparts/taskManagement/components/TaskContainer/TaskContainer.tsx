/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { Config } from "../../../../Config/config";
import SpServices from "../../../../Services/SPServices/SpServices";
import { ITaskList, ITask } from "../../../../Interface/interface";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { TabView, TabPanel } from "primereact/tabview";
import PrimaryBtn from "../../../../Common/PrimaryButton/PrimaryBtn";
// import { Toast } from "primereact/toast";
import { sp } from "@pnp/sp/presets/all";
import Loader from "../../../../Common/Loader/Loader";
import styles from "./TaskContainer.module.scss";
import Recurrence from "./Recurrence/Recurrence";
import TaskCard from "../TaskCard/TaskCard";
import TaskList from "../TaskList/TaskList";
import CustomPeoplePicker from "../../../../Common/CustomPeoplePicker/CustomPeoplePicker";
import ModalPopup from "../ModalPopup/ModalPopup";
import DeletePopup from "../../../../Common/DeletePopup/DeletePopup";
import CustomToast, { CustomToastRef } from "../shared/Toast";

interface TasksListProps {
  context: any;
  currentUser: {
    Id: number;
    Title: string;
    Email: string;
    isApprover: boolean;
  };
}

const TaskContainer = (props: TasksListProps): JSX.Element => {
  const [taskData, setTaskData] = useState<ITaskList>([]);
  const [allTaskData, setAllTaskData] = useState<ITaskList>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [deleteModalProps, setDeleteModalProps] = useState({
    flag: false,
    id: 0,
  });
  const [categoryValues, setCategoryValues] = useState<any[]>([]);
  const [modalProps, setModalProps] = useState({ type: "", selectedValue: {} });
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  // Filter states
  const [searchText, setSearchText] = useState<string>("");
  const [selectedFilterUser, setSelectedFilterUser] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [statusChoices, setStatusChoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

  const toastRef = useRef<CustomToastRef>(null);

  // Filtering function
  const filterTasks = () => {
    let filtered = [...allTaskData];

    // If current user is not an approver, filter only their tasks
    if (!props.currentUser?.isApprover) {
      filtered = filtered.filter(
        (task) =>
          (task.Performer &&
            task.Performer.EMail === props.currentUser.Email) ||
          (task.Allocator && task.Allocator.EMail === props.currentUser.Email)
      );
    }

    if (searchText.trim() !== "") {
      filtered = filtered.filter(
        (task) =>
          (task.TaskName &&
            task.TaskName.toLowerCase().includes(searchText.toLowerCase())) ||
          (task.TaskDescription &&
            task.TaskDescription.toLowerCase().includes(
              searchText.toLowerCase()
            ))
      );
    }
    if (props.currentUser?.isApprover) {
      if (selectedFilterUser !== "") {
        filtered = filtered.filter(
          (task) =>
            task.Performer && task.Performer.EMail === selectedFilterUser
        );
      }
    } else {
      if (selectedFilterUser !== "") {
        filtered = filtered.filter(
          (task) =>
            task.Allocator && task.Allocator.EMail === selectedFilterUser
        );
      }
    }

    if (selectedCategory !== "") {
      filtered = filtered.filter(
        (task) => task.Category && task.Category.code === selectedCategory
      );
    }
    if (selectedStatus !== "") {
      filtered = filtered.filter((task) => task.Status === selectedStatus);
    }
    setTaskData(filtered);
  };

  // Fetch Tasks and Categories
  const handlerGetTasks = async (): Promise<void> => {
    setIsLoading(true);
    let _arrTaskData: ITaskList;
    await SpServices.SPReadItems({
      Listname: Config.ListName.Category,
    }).then((res: any[]) => {
      setCategoryValues(res.map((li) => ({ code: li.ID, name: li.Title })));
    });
    await sp.web.lists
      .getByTitle("Tasks")
      .fields.getByTitle("Status")()
      .then((res) => {
        console.log(res);
        setStatusChoices((res as any).Choices);
      })
      .catch((err) => {
        console.log(err);
      });
    await SpServices.SPReadItems({
      Listname: Config.ListName.Tasks,
      Select:
        "*,Performer/Title,Performer/EMail,Performer/ID,Allocator/ID,Allocator/Title,Allocator/EMail,Category/Title,Category/ID,Approver/Title,Approver/EMail,Approver/ID,Recurrence/ID,Recurrence/Title",
      Expand: "Performer,Allocator,Category,Approver,Recurrence",
      Orderby: "ID",
      Orderbydecorasc: false,
    })
      .then((res: any[]) => {
        console.log(res);
        _arrTaskData = res.map((li: ITask) => {
          return {
            ID: li.ID,
            Title: li.Title,
            TaskName: li.TaskName,
            TaskDescription: li.TaskDescription,
            Category: { code: li?.Category?.ID, name: li?.Category?.Title },
            Allocator: li.Allocator,
            Performer: li.Performer,
            StartDate: li.StartDate,
            EndDate: li.EndDate,
            CompletionDate: li.CompletionDate ? li.CompletionDate : undefined,
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
        setAllTaskData([..._arrTaskData]);
        setTaskData([..._arrTaskData]);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  };

  // Delete Modal visibility handler
  const handlerDeleteModalProps = (flag: boolean, id: number): void => {
    setDeleteModalProps({ flag, id });
  };

  // Modal visibility and props handler
  const handlerModalVisibilty = (flag: boolean): void => {
    setShowModal(flag);
  };
  const handlerModalProps = (type: string, id: number): void => {
    const selectedValue = taskData.find((li) => li.ID === id) || {};
    setModalProps({ type, selectedValue });
    handlerModalVisibilty(true);
  };

  // Reset filters when refresh icon is clicked
  const handleRefresh = (): void => {
    setSearchText("");
    setSelectedFilterUser("");
    setSelectedCategory("");
    setSelectedStatus("");
    filterTasks();
  };

  const handleToast = (
    severity: "success" | "info" | "warn" | "error",
    summary: string,
    detail: string
  ): void => {
    if (toastRef.current) {
      toastRef.current.show(severity, summary, detail);
    }
  };

  // Automatically run filtering when filter states change
  useEffect(() => {
    filterTasks();
  }, [
    searchText,
    selectedFilterUser,
    selectedCategory,
    selectedStatus,
    allTaskData,
  ]);
  // Component Lifecycle: Fetch tasks on mount and refetch when modal or delete popup closes
  useEffect(() => {
    handlerGetTasks().catch((err) => {
      console.log(err);
    });
  }, [!showModal, !deleteModalProps.flag]);

  return (
    <div className={styles.taskContainer}>
      <CustomToast ref={toastRef} position="top-right" />
      {showModal && (
        <ModalPopup
          statusChoices={statusChoices}
          categoryValues={categoryValues}
          modalProps={modalProps}
          context={props.context}
          showModal={showModal}
          onHide={() => setShowModal(false)}
          handlerModalVisibilty={handlerModalVisibilty}
          handleToast={handleToast}
          currentUser={props.currentUser}
        />
      )}
      {deleteModalProps.flag && (
        <DeletePopup
          deleteModalProps={deleteModalProps}
          context={props.context}
          handlerDeleteModalProps={handlerDeleteModalProps}
          handleToast={handleToast}
        />
      )}
      <div className={styles.headerSection}>
        <h3>Tasks</h3>
        {activeTabIndex !== 2 && (
          <div className={styles.filterSection}>
            <Dropdown
              style={{ width: 200 }}
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.value)}
              options={categoryValues}
              optionLabel="name"
              optionValue="code"
              placeholder="Select Category"
            />
            <Dropdown
              style={{ width: 200 }}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.value)}
              options={statusChoices.map((li) => ({ code: li, name: li }))}
              optionLabel="name"
              optionValue="code"
              placeholder="Select Status"
            />
            <CustomPeoplePicker
              style={{ width: 200 }}
              context={props.context}
              label={`${
                props.currentUser?.isApprover ? "Performer" : "Allocator"
              } `}
              selectedItems={[]}
              onChange={(e: any) => {
                const selected = e?.[0]?.email || "";
                setSelectedFilterUser(selected);
              }}
              placeholder={
                props.currentUser?.isApprover ? "Performer" : "Allocator"
              }
            />
            <InputText
              style={{ width: 200 }}
              placeholder="Search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <i
              className={`pi pi-refresh ${styles.iconRefresh}`}
              onClick={handleRefresh}
            />
            <PrimaryBtn
              label="New Task"
              onClick={() => {
                handlerModalVisibilty(true);
                handlerModalProps("Add", 0);
              }}
            />
          </div>
        )}
      </div>
      {isLoading ? (
        <Loader />
      ) : (
        <TabView
          className={styles.tabView}
          activeIndex={activeTabIndex}
          onTabChange={(e) => {
            setActiveTabIndex(e.index);
            // You can also call refresh or any additional logic if needed
          }}
        >
          <TabPanel header="Card">
            <div className={styles.CardView}>
              {taskData.length > 0 ? (
                taskData.map((task, i) => (
                  <TaskCard
                    key={i}
                    task={task}
                    handlerModalProps={handlerModalProps}
                    handlerDeleteModalProps={handlerDeleteModalProps}
                    currentUser={props.currentUser}
                  />
                ))
              ) : (
                <div className={styles.noDataContainer}>
                  <img
                    src={require("../../assets/Images/no-data.svg")}
                    alt="No tasks found"
                    className={styles.noDataImage}
                  />
                  <p className={styles.noDataText}>No tasks found</p>
                </div>
              )}
            </div>
          </TabPanel>
          <TabPanel header="List">
            <div>
              {taskData.length > 0 ? (
                <TaskList
                  taskData={taskData}
                  handlerModalProps={handlerModalProps}
                  handlerDeleteModalProps={handlerDeleteModalProps}
                />
              ) : (
                <div className={styles.noDataContainer}>
                  <img
                    src={require("../../assets/Images/no-data.svg")}
                    alt="No tasks found"
                    className={styles.noDataImage}
                  />
                  <p className={styles.noDataText}>No tasks found</p>
                </div>
              )}
            </div>
          </TabPanel>
          <TabPanel header="Recurrence">
            <Recurrence currentUser={props.currentUser} />
          </TabPanel>
        </TabView>
      )}
    </div>
  );
};

export default TaskContainer;
