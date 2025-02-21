/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react";
import { useEffect, useState } from "react";
import SpServices from "../../../../Services/SPServices/SpServices";
import { ITaskList, ITask } from "../../../../Interface/interface";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { TabView, TabPanel } from "primereact/tabview";
import PrimaryBtn from "../../../../Common/PrimaryButton/PrimaryBtn";
import TaskCard from "../TaskCard/TaskCard";
import TaskList from "../TaskList/TaskList";
import styles from "./TaskContainer.module.scss";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import ModalPopup from "../ModalPopup/ModalPopup";
interface TasksListProps {
  context: any;
}

const TaskContainer = (props: TasksListProps): JSX.Element => {
  // Local Variable creation

  const initialPopupController: any[] = [
    {
      open: false,
      popupTitle: "Add Task",
      popupWidth: "50vw",
      popupType: "Add",
      popupFields: [
        {
          taskName: "",
          category: "",
          taskDescription: "",
          assignedTo: "",
          startDate: "",
          endDate: "",
          isApproval: false,
          recurrence: "",
          isCustomer: false,
          customerName: "",
        },
      ],
    },
  ];
  const [taskData, setTaskData] = useState<ITaskList>([]);
  const [selectedCity, setSelectedCity] = useState(null);
  const [showModal, setShowModal] = useState<boolean>(true);
  const cities = [
    { name: "New York", code: "NY" },
    { name: "Rome", code: "RM" },
    { name: "London", code: "LDN" },
    { name: "Istanbul", code: "IST" },
    { name: "Paris", code: "PRS" },
  ];
  // TODO Getting Tasks from SharePoint
  const handlerGetTasks = async (): Promise<void> => {
    let _arrTaskData: ITaskList;
    await SpServices.SPReadItems({
      Listname: "Tasks",
      Select:
        "*,Performer/Title,Performer/EMail,Author/Title,Author/EMail,Category/Title,Category/ID",
      Expand: "Performer,Author,Category",
    }).then((res: ITask[]) => {
      _arrTaskData = res.map((li: ITask) => {
        return {
          ID: li.ID,
          Title: li.Title,
          TaskName: li.TaskName,
          TaskDescription: li.TaskDescription,
          Category: li.Category,
          Allocator: li.Allocator,
          Performer: li.Performer,
          StartDate: new Date(li.StartDate).toLocaleDateString(),
          EndDate: new Date(li.EndDate).toLocaleDateString(),
          CompletionDate: new Date(li.CompletionDate).toLocaleDateString(),
          IsApproval: li.IsApproval,
          Recurrence: li.Recurrence,
          IsCustomer: li.IsCustomer,
          CustomerName: li.CustomerName,
          CustomerNo: li.CustomerNo,
          PerformerComments: li.PerformerComments,
          ApprovalComments: li.ApprovalComments,
          Status: li.Status,
        };
      });
      console.log(_arrTaskData);
      setTaskData([..._arrTaskData]); //spread
    });
  };

  const handlerModalVisibilty = (flag: boolean): void => {
    setShowModal(flag);
  };
  useEffect(() => {
    handlerGetTasks().catch((err) => {
      console.log(err);
    });
  }, []);

  return (
    <div className={styles.taskContainer}>
      {
        <ModalPopup
          context={props.context}
          showModal={showModal}
          onHide={() => setShowModal(false)}
          handlerModalVisibilty={() => handlerModalVisibilty(false)}
        />
      }
      <div className={styles.headerSection}>
        <h3>Tasks List</h3>
        <div className={styles.filterSection}>
          <PeoplePicker
            context={props.context}
            titleText=""
            personSelectionLimit={3}
            // groupName={} // Leave this blank in case you want to filter from all users
            showtooltip={true}
            required={true}
            disabled={true}
            searchTextLimit={5}
            // onChange={this._getPeoplePickerItems}
            showHiddenInUI={false}
            principalTypes={[PrincipalType.User]}
            resolveDelay={1000}
          />
          <Dropdown
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.value)}
            options={cities}
            optionLabel="name"
            placeholder="Select a City"
            className="w-full md:w-14rem"
          />
          <InputText keyfilter="int" placeholder="Integers" />
          <i className={`pi pi-refresh ${styles.iconRefresh}`} />
          <PrimaryBtn
            label="New Task"
            onClick={() => {
              console.log("New Task");
              handlerModalVisibilty(true);
            }}
          />
        </div>
      </div>
      <TabView className={styles.tabView}>
        <TabPanel header="List">
          <div className={styles.CardView}>
            <TaskList taskData={taskData} />
          </div>
        </TabPanel>
        <TabPanel header="Card">
          <div className={styles.CardView}>
            {taskData.length > 0 &&
              taskData.map((task, i) => <TaskCard key={i} task={task} />)}
          </div>
        </TabPanel>
      </TabView>
    </div>
  );
};

export default TaskContainer;
