import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Checkbox } from "primereact/checkbox";
import { Dropdown } from "primereact/dropdown";
import PrimaryBtn from "../../../../Common/PrimaryButton/PrimaryBtn";
import DefaultBtn from "../../../../Common/DefaultBtn/DefaultBtn";
import CustomPeoplePicker from "../../../../Common/CustomPeoplePicker/CustomPeoplePicker";
import styles from "./ModalPopup.module.scss";
import { ITask } from "../../../../Interface/interface";
import { Config } from "../../../../Config/config";
import SpServices from "../../../../Services/SPServices/SpServices";
import { Toast } from "primereact/toast";
interface ModalPopupProps {
  modalProps: {
    type: string;
    selectedValue: object;
  };
  context: any;
  showModal: boolean;
  categoryValues: any[];
  onHide: () => void;
  handlerModalVisibilty: (flag: boolean) => void;
  handleToast: (severity: string, summary: string, detail: string) => void;
  currentUser: {
    Id: number;
    Title: string;
    Email: string;
    isApprover: boolean;
  };
  statusChoices: string[];
}

const ModalPopup = (props: ModalPopupProps): JSX.Element => {
  const [taskData, setTaskData] = useState<ITask | null>(null);
  const [updatedStatus, setUpdatedStatus] = useState<string>("");
  const toast = useRef<Toast>(null);

  // Define a recurrence style map
  const recurrenceStyleMap: { [key: string]: React.CSSProperties } = {
    Daily: {
      backgroundColor: "#E6F7FF",
      color: "#007ACC",
    },
    Weekly: {
      backgroundColor: "#FFF4CC",
      color: "#D89500",
    },
    Monthly: {
      backgroundColor: "#E6FFED",
      color: "#2E8B57",
    },
  };

  // Function to add item in SharePoint List Recurrence
  const handlerAddItemToConfig_Rec = async (reqJSON: any) => {
    await SpServices.SPAddItem({
      Listname: Config.ListName.Config_Recurrence,
      RequestJSON: reqJSON,
    })
      .then(async (res) => {
        console.log(res);

        props.handlerModalVisibilty(false);
        props.handleToast(
          "success",
          "Success",
          "Recurrence added successfully, Will add task soon"
        );
      })
      .catch((error) => {
        console.log(error);
      });
  };
  // Function to add item in SharePoint List
  const handlerAddItemToTaskList = async (reqJSON: any) => {
    await SpServices.SPAddItem({
      Listname: Config.ListName.Tasks,
      RequestJSON: reqJSON,
    })
      .then(async (res) => {
        console.log(res);
        props.handlerModalVisibilty(false);
        props.handleToast("success", "Success", "Task added successfully");
      })
      .catch((error) => {
        console.log(error);
      });
  };
  // Function to update item in SharePoint List
  const handlerUpdateItemToTaskList = async (reqJSON: any, id: number) => {
    await SpServices.SPUpdateItem({
      Listname: Config.ListName.Tasks,
      RequestJSON: reqJSON,
      ID: id,
    })
      .then(async (res) => {
        console.log(res);

        props.handlerModalVisibilty(false);
        props.handleToast("success", "Success", "Task updated successfully");
      })
      .catch((error) => {
        console.log(error);
      });
  };
  // Function to return validation status and message
  const isValidated = (task: ITask): { value: boolean; message: string } => {
    if (!task) {
      return {
        value: false,
        message: "Please fill the values...",
      };
    }
    if (!task.TaskName || task.TaskName === "") {
      return {
        value: false,
        message: "Please fill the Task Name",
      };
    }
    if (!task.Category) {
      return {
        value: false,
        message: "Please select a category",
      };
    }
    if (task.IsRecurrence && props.modalProps.type === "Add") {
      if (!task.StartDate || !task.EndDate) {
        return {
          value: false,
          message: "Please select both start date and end date",
        };
      }

      // Compare dates after stripping out the time portion.
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const startDate = new Date(task.StartDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(task.EndDate);
      endDate.setHours(0, 0, 0, 0);

      // Allow start date to be today and same as end date
      if (startDate < today) {
        return {
          value: false,
          message: "Start date cannot be in the past",
        };
      }
      if (startDate > endDate) {
        return {
          value: false,
          message: "Start date cannot be later than end date",
        };
      }

      // Additional recurrence validations
      if (task.IsRecurrence) {
        const diffMs = endDate.getTime() - startDate.getTime();
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        if (task.RecurrenceType === "Weekly" && diffDays < 7) {
          return {
            value: false,
            message:
              "For weekly recurrence, the duration must be at least 7 days",
          };
        }
        if (task.RecurrenceType === "Monthly" && diffDays < 28) {
          return {
            value: false,
            message:
              "For monthly recurrence, the duration must be at least 28 days",
          };
        }
      }
    }

    if (!task.Performer || !task.Performer.EMail) {
      return {
        value: false,
        message: "Please select an assignee",
      };
    }
    if (task.IsApproval && (!task.Approver || !task.Approver.EMail)) {
      return {
        value: false,
        message: "Please select an approver",
      };
    }
    return {
      value: true,
      message: "",
    };
  };

  // Helper function to calculate the next task date based on recurrence settings
  const getNextTaskDate = (
    start: Date,
    recurrenceType: string,
    recurrenceDay?: string, // e.g., "Monday" for weekly
    recurrenceDate?: number // e.g., 15 for monthly (15th)
  ): Date | null => {
    // Remove time portion from start date
    const startWithoutTime = new Date(start);
    startWithoutTime.setHours(0, 0, 0, 0);

    if (recurrenceType === "Weekly" && recurrenceDay) {
      const dayMap: { [key: string]: number } = {
        Sunday: 0,
        Monday: 1,
        Tuesday: 2,
        Wednesday: 3,
        Thursday: 4,
        Friday: 5,
        Saturday: 6,
      };
      const targetDay = dayMap[recurrenceDay];
      if (targetDay === undefined) return null;
      const result = new Date(startWithoutTime);
      // Find the next occurrence on the target day
      while (result.getDay() !== targetDay) {
        result.setDate(result.getDate() + 1);
      }
      // If result equals the start date, then go to next week
      if (result.getTime() === startWithoutTime.getTime()) {
        result.setDate(result.getDate() + 7);
      }
      return result;
    } else if (recurrenceType === "Monthly" && recurrenceDate) {
      const result = new Date(startWithoutTime);
      result.setMonth(result.getMonth() + 1);
      result.setDate(recurrenceDate);
      return result;
    } else if (recurrenceType === "Daily") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      // If the task is created for today, do not add an extra day.
      if (startWithoutTime.getTime() === today.getTime()) {
        return startWithoutTime;
      } else {
        const result = new Date(startWithoutTime);
        result.setDate(result.getDate() + 1);
        return result;
      }
    }
    return null;
  };

  // Handler to add Task to SharePoint List
  const handlerAddTasktoSPList = async (task: ITask): Promise<void> => {
    const validation = isValidated(task);
    if (!validation.value) {
      if (toast.current) {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: validation.message,
          life: 3000,
        });
      }
      return;
    }
    let lastTaskID = 0;
    await SpServices.SPReadItems({ Listname: Config.ListName.Tasks }).then(
      (res) => {
        lastTaskID = res && res.length > 0 ? res[res.length - 1].ID : 0;
      }
    );
    const newTaskID = lastTaskID + 1;
    const formattedID = newTaskID.toString().padStart(5, "0");

    // Calculate NextTaskDate if recurrence is applied
    let NextTaskDate: Date | null = null;
    if (task.IsRecurrence) {
      const startDate = new Date(task.StartDate);
      NextTaskDate = getNextTaskDate(
        startDate,
        task.RecurrenceType || "",
        task.RecurrenceDay, // For Weekly recurrence
        task.RecurrenceDate // For Monthly recurrence
      );
    }
    // Prepare JSON for Recurrence and Task
    const requestRecurrenceJSON = {
      Title: task.TaskName,
      StartDate: new Date(task?.StartDate),
      EndDate: new Date(task?.EndDate),
      Rec_Type: task.RecurrenceType,
      Rec_Day:
        task.RecurrenceType === "Weekly" ? task?.RecurrenceDay : undefined,
      Rec_Date:
        task.RecurrenceType === "Monthly" ? task?.RecurrenceDate : undefined,
      PerformerId: task.Performer?.ID,
      IsApproval: task.IsApproval,
      ApproverId: task.Approver?.ID,
      TaskDescription: task.TaskDescription,
      CategoryId: task.Category?.code,
      NextTaskDate: NextTaskDate, // Now NextTaskDate is computed + 1 day
    };
    // Prepare JSON for Task
    const requestTaskJSON = {
      Title: `T_${formattedID}`,
      TaskName: task.TaskName,
      TaskDescription: task.TaskDescription,
      CategoryId: task.Category?.code,
      PerformerId: task.Performer?.ID,
      StartDate: new Date(task?.StartDate),
      EndDate: new Date(task?.EndDate),
      IsApproval: task.IsApproval,
      IsCustomer: task.IsCustomer,
      CustomerName: task.CustomerName,
      CustomerNo: task.CustomerNo,
      PerformerComments: task.PerformerComments,
      ApprovalComments: task.ApprovalComments,
      Status:
        updatedStatus !== ""
          ? updatedStatus === "Completed" && task.IsApproval
            ? "Awaiting approval"
            : updatedStatus
          : task.Status,
      ApproverId: task.Approver?.ID,
      CompletionDate: updatedStatus === "Completed" ? new Date() : null,
    };
    if (task?.IsRecurrence && props.modalProps.type === "Add") {
      handlerAddItemToConfig_Rec(requestRecurrenceJSON).catch((err) => {
        console.log(err);
      });
    } else {
      if (props.modalProps.type === "Add") {
        handlerAddItemToTaskList(requestTaskJSON).catch((err) => {
          console.log(err);
        });
      } else {
        handlerUpdateItemToTaskList(requestTaskJSON, task.ID).catch((err) => {
          console.log(err);
        });
      }
    }
  };
  // Function to get Recurrence Info
  const handlerGetRecurrenceInfo = async (): Promise<void> => {
    if (taskData?.IsRecurrence) {
      SpServices.SPReadItemUsingId({
        Listname: "Config_Recurrence",
        SelectedId: taskData?.Recurrence?.ID,
        Select: "*",
        Expand: "",
      })
        .then((res: any) => {
          setTaskData({
            ...taskData,
            RecurrenceType: res.Rec_Type,
            RecurrenceDay: res.Rec_Day,
            RecurrenceDate: res.Rec_Date,
            ID: taskData?.ID || 0, // Ensure ID is always defined
          } as ITask);
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  useEffect(() => {
    handlerGetRecurrenceInfo().catch((err) => {
      console.log(err);
    });
  }, [taskData?.IsRecurrence]);
  useEffect(() => {
    setTaskData(
      props.modalProps.type === "Edit"
        ? (props.modalProps.selectedValue as ITask)
        : null
    );
  }, [props.showModal, props.modalProps]);

  return (
    <div>
      <Toast ref={toast} />
      <Dialog
        header={`${props.modalProps.type === "Edit" ? "Update" : "Add"} Task`}
        visible={props.showModal}
        style={{ width: "50vw" }}
        onHide={() => {
          props.handlerModalVisibilty(false);
        }}
      >
        <div className={styles.modalContent}>
          {/* Row */}
          <div className={styles.row}>
            <div className={styles.col4}>
              <label htmlFor="TaskName">Task Name</label>
              <InputText
                disabled={
                  !props.currentUser.isApprover ||
                  taskData?.Status === "Completed" ||
                  taskData?.Status === "Approved"
                }
                id="TaskName"
                value={taskData?.TaskName || ""}
                onChange={(e) => {
                  setTaskData({
                    ...taskData,
                    TaskName: e.target.value,
                  } as ITask);
                }}
              />
            </div>
            <div className={styles.col4}>
              <label htmlFor="Category">Category</label>
              <Dropdown
                disabled={
                  !props.currentUser.isApprover ||
                  taskData?.Status === "Completed" ||
                  taskData?.Status === "Approved"
                }
                value={taskData?.Category || null}
                onChange={(e) =>
                  setTaskData({ ...taskData, Category: e.value } as ITask)
                }
                options={props.categoryValues}
                optionLabel="name"
                placeholder=""
              />
            </div>
            <div className={styles.col4}>
              <label htmlFor="AssignedTo">Assigned to</label>
              <CustomPeoplePicker
                disabled={
                  !props.currentUser.isApprover ||
                  taskData?.Status === "Completed" ||
                  taskData?.Status === "Approved"
                }
                context={props.context}
                selectedItem={
                  taskData?.Performer ? [taskData.Performer.EMail] : []
                }
                onChange={(item: any) => {
                  const value = item?.[0];
                  setTaskData({
                    ...taskData,
                    Performer: {
                      ID: value.id,
                      Title: value.name,
                      EMail: value.email,
                    },
                  } as ITask);
                }}
              />
            </div>
          </div>
          {/* Row */}
          {/* Row */}
          <div className={styles.row}>
            <div className={styles.col12}>
              <label htmlFor="Description">Description</label>
              <InputTextarea
                disabled={
                  !props.currentUser.isApprover ||
                  taskData?.Status === "Completed" ||
                  taskData?.Status === "Approved"
                }
                value={taskData?.TaskDescription || ""}
                rows={5}
                cols={30}
                id="Description"
                onChange={(e) =>
                  setTaskData({
                    ...taskData,
                    TaskDescription: e.target.value,
                  } as ITask)
                }
              />
            </div>
          </div>
          {/* Row */}
          {/* Row */}
          <div className={styles.row}>
            <div className={styles.col4}>
              <div className={styles.modalCheckbox}>
                <Checkbox
                  disabled={
                    !props.currentUser.isApprover ||
                    taskData?.Status === "Completed" ||
                    taskData?.Status === "Approved"
                  }
                  inputId="isApproval"
                  name="Approval"
                  onChange={(e) =>
                    setTaskData({
                      ...taskData,
                      IsApproval: e.target.checked,
                    } as ITask)
                  }
                  checked={taskData?.IsApproval ? taskData?.IsApproval : false}
                />
                <label htmlFor={"isApproval"}>{"Is Approval Required"}</label>
              </div>
            </div>
            <div className={styles.col4}>
              {taskData?.IsApproval && (
                <CustomPeoplePicker
                  disabled={
                    !props.currentUser.isApprover ||
                    taskData?.Status === "Completed" ||
                    taskData?.Status === "Approved"
                  }
                  selectedItem={
                    taskData?.Approver ? [taskData.Approver.EMail] : []
                  }
                  context={props.context}
                  onChange={(item: any) => {
                    let value = item?.[0];
                    setTaskData({
                      ...taskData,
                      Approver: {
                        ID: value.id,
                        Title: value.name,
                        EMail: value.email,
                      },
                    } as ITask);
                  }}
                />
              )}
            </div>
          </div>
          {/* Row */}
          {/* Row */}
          {props.modalProps.type === "Add" ? (
            <div className={styles.row}>
              <div className={styles.col4}>
                <div className={styles.modalCheckbox}>
                  <Checkbox
                    disabled={
                      !props.currentUser.isApprover ||
                      taskData?.Status === "Completed" ||
                      taskData?.Status === "Approved"
                    }
                    inputId="isReurrence"
                    name="Recurrence"
                    value={[]}
                    onChange={(e) =>
                      setTaskData({
                        ...taskData,
                        IsRecurrence: e.target.checked,
                      } as ITask)
                    }
                    checked={
                      taskData?.IsRecurrence ? taskData?.IsRecurrence : false
                    }
                  />
                  <label htmlFor={"isReurrence"}>{"Is Recurrence Task"}</label>
                </div>
              </div>
              {taskData?.IsRecurrence && (
                <>
                  <div className={styles.col4}>
                    <Dropdown
                      value={taskData?.RecurrenceType || null}
                      onChange={(e) =>
                        setTaskData({
                          ...taskData,
                          RecurrenceType: e.value,
                          ID: taskData?.ID || "",
                        } as ITask)
                      }
                      options={[...Config.RecurrenceType]}
                      placeholder="Type"
                    />
                  </div>
                  {taskData?.RecurrenceType === "Weekly" ||
                  taskData?.RecurrenceType === "Monthly" ? (
                    <div className={styles.col4}>
                      <Dropdown
                        value={
                          taskData?.RecurrenceType === "Weekly"
                            ? taskData?.RecurrenceDay
                            : taskData?.RecurrenceDate || null
                        }
                        onChange={(e) => {
                          setTaskData({
                            ...taskData,
                            RecurrenceDay:
                              taskData?.RecurrenceType === "Weekly"
                                ? e.value
                                : taskData?.RecurrenceDay,
                            RecurrenceDate:
                              taskData?.RecurrenceType === "Monthly"
                                ? e.value
                                : taskData?.RecurrenceDate,
                          } as ITask);
                        }}
                        options={
                          taskData?.RecurrenceType === "Weekly"
                            ? Config.Days
                            : Config.Dates
                        }
                        optionLabel="name"
                        placeholder="Recurrence Type"
                      />
                    </div>
                  ) : (
                    ""
                  )}
                </>
              )}
            </div>
          ) : taskData?.IsRecurrence ? (
            <div
              className={styles.pillContainer}
              style={recurrenceStyleMap[taskData?.RecurrenceType ?? ""] || {}}
            >
              <span className={styles.pillLabel}>Recurrence Type:</span>
              <span className={styles.pillValue}>
                {taskData?.RecurrenceType}
              </span>
              {taskData.RecurrenceType !== "Daily" && (
                <>
                  <span className={styles.pillLabel}>
                    {taskData?.RecurrenceType === "Weekly" ? "Day:" : "Date:"}
                  </span>
                  <span className={styles.pillValue}>
                    {taskData?.RecurrenceType === "Weekly"
                      ? taskData?.RecurrenceDay
                      : taskData?.RecurrenceDate}
                  </span>
                </>
              )}
            </div>
          ) : null}

          {/* Row */}
          {/* Row Customer Section*/}
          {/* <div className={styles.row}>
            <div className={styles.col4}>
              <div className={styles.modalCheckbox}>
                <Checkbox
                  inputId="isCustomer"
                  name="Customer"
                  value={[]}
                  onChange={(e) =>
                    setTaskData({
                      ...taskData,
                      IsCustomer: e.target.checked,
                    } as ITask)
                  }
                  checked={taskData?.IsCustomer ? taskData?.IsCustomer : false}
                />
                <label htmlFor={"isCustomer"}>{"Is Customer Task"}</label>
              </div>
            </div>
            <div className={styles.col4}>
              {taskData?.IsCustomer && (
                <Dropdown
                  value={""}
                  onChange={(e) => console.log(e)}
                  options={[]}
                  optionLabel="name"
                  placeholder="Recurrence Type"
                />
              )}
            </div>
          </div> */}
          {/* Row Customer Section*/}
          {/* Row */}
          <div className={styles.row}>
            <div className={styles.col4}>
              <label htmlFor={"startDate"}>{"Start Date"}</label>
              <InputText
                disabled={
                  !props.currentUser.isApprover ||
                  taskData?.Status === "Completed" ||
                  taskData?.Status === "Approved" ||
                  (taskData?.IsRecurrence && props.modalProps.type === "Edit")
                }
                id="startDate"
                type="date"
                value={
                  taskData?.StartDate
                    ? new Date(taskData.StartDate).toISOString().slice(0, 10)
                    : ""
                }
                onChange={(e) => {
                  setTaskData({
                    ...taskData,
                    StartDate: e.target.value,
                  } as ITask);
                }}
              />
            </div>
            <div className={styles.col4}>
              <label htmlFor={"endDate"}>{"End Date"}</label>
              <InputText
                disabled={
                  !props.currentUser.isApprover ||
                  taskData?.Status === "Completed" ||
                  taskData?.Status === "Approved" ||
                  (taskData?.IsRecurrence && props.modalProps.type === "Edit")
                }
                id="endDate"
                type="date"
                value={
                  taskData?.EndDate
                    ? new Date(taskData.EndDate).toISOString().slice(0, 10)
                    : ""
                }
                onChange={(e) => {
                  setTaskData({
                    ...taskData,
                    EndDate: e.target.value,
                  } as ITask);
                }}
              />
            </div>
          </div>
          {/* Row */}
          {/* Footer Button section */}
          {props.modalProps.type === "Edit" && (
            <div className={styles.row}>
              <div className={styles.col4}>
                <label htmlFor="Status">Status</label>
                {taskData?.Status !== "Completed" &&
                taskData?.Status !== "Approved" &&
                taskData?.Status !== "Awaiting approval" ? (
                  <Dropdown
                    value={
                      updatedStatus === ""
                        ? taskData?.Status || ""
                        : updatedStatus
                    }
                    onChange={(e) => setUpdatedStatus(e.value as string)}
                    options={
                      taskData?.Status === "In Progress"
                        ? ["In Progress", "Completed"]
                        : ["Yet to start", "In Progress", "Completed"]
                    }
                    optionLabel="name"
                    placeholder=""
                  />
                ) : (
                  <div className={styles.taskStatus}>{taskData?.Status}</div>
                )}
              </div>
            </div>
          )}
          <div className={styles.modalFooter}>
            <DefaultBtn
              label="Cancel"
              onClick={() => {
                props.handlerModalVisibilty(false);
                props.onHide();
              }}
            />
            {taskData?.Status !== "Completed" &&
              taskData?.Status !== "Approved" && (
                <PrimaryBtn
                  label={`${
                    props.modalProps.type === "Edit" ? "Update" : "Add"
                  }`}
                  onClick={() => {
                    handlerAddTasktoSPList(taskData as ITask).catch((err) => {
                      console.log(err);
                    });
                  }}
                />
              )}
          </div>
          {/* Footer Button sectiond */}
        </div>
      </Dialog>
    </div>
  );
};

export default ModalPopup;
