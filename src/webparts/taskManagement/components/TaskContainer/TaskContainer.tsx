import * as React from "react";
import { useEffect, useState } from "react";
import TaskCard from "../TaskCard/TaskCard";
import SpServices from "../../../../Services/SPServices/SpServices";
import { ITaskList, ITask } from "../../../../Interface/interface";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { TabView, TabPanel } from "primereact/tabview";
import PrimaryBtn from "../../../../Common/PrimaryButton/PrimaryBtn";
import styles from "./TaskContainer.module.scss";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
interface TasksListProps {
  context: any;
}

const TaskContainer = (props: TasksListProps): JSX.Element => {
  const [taskData, setTaskData] = useState<ITaskList>([]);
  const [selectedCity, setSelectedCity] = useState(null);
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
    await SpServices.SPReadItems({ Listname: "Tasks" }).then((res: ITask[]) => {
      _arrTaskData = res.map((li: ITask) => {
        return {
          ID: li.ID,
          TaskName: li.TaskName,
          TaskDescription: li.TaskDescription,
          Category: li.Category,
          Allocator: li.Allocator,
          Performer: li.Performer,
          StartDate: li.StartDate,
          EndDate: li.EndDate,
          CompletionDate: li.CompletionDate,
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
      setTaskData([..._arrTaskData]);
    });
  };

  useEffect(() => {
    handlerGetTasks().catch((err) => {
      console.log(err);
    });
  }, []);

  return (
    <div className={styles.taskContainer}>
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
            }}
          />
        </div>
      </div>
      <TabView>
        <TabPanel header="Card">
          <div className={styles.CardView}>
            {taskData.length > 0 &&
              taskData.map((task, i) => <TaskCard key={i} task={task} />)}
          </div>
        </TabPanel>
        <TabPanel header="List">
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
