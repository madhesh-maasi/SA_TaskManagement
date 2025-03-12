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
import Loader from "../../../../Common/Loader/Loader";
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
  const [isLoader, setLoader] = useState(false);
  const toast = useRef<Toast>(null);

  // Updated recurrence style map
  const recurrenceStyleMap: { [key: string]: React.CSSProperties } = {
    Daily: {
      backgroundColor: "#E6F7FF",
      color: "#007ACC",
    },
    Weekly: {
      background: "#fceeeb", // Interactive gradient for Weekly
      color: "#FF7E5F",
      transition: "transform 0.2s ease-in-out",
    },
    Monthly: {
      backgroundColor: "#E6FFED",
      color: "#2E8B57",
    },
  };

  // Define a map of styles for each status
  const statusStyleMap: { [key: string]: React.CSSProperties } = {
    Completed: {
      backgroundColor: "#D4EDDA", // light green
      color: "#155724", // dark green
      padding: "0.3em 0.6em",
      borderRadius: "0.25rem",
      fontWeight: 400,
      cursor: "pointer",
    },
    "Awaiting approval": {
      backgroundColor: "#FFF3CD", // light yellow
      color: "#856404", // dark yellow
      padding: "0.3em 0.6em",
      borderRadius: "0.25rem",
      fontWeight: 400,
      cursor: "pointer",
    },
    Approved: {
      backgroundColor: "#D1ECF1", // light blue
      color: "#0C5460", // dark blue
      padding: "0.3em 0.6em",
      borderRadius: "0.25rem",
      fontWeight: 400,
      cursor: "pointer",
    },
    Rejected: {
      backgroundColor: "#F8D7DA", // light red
      color: "#721C24", // dark red
      padding: "0.3em 0.6em",
      borderRadius: "0.25rem",
      fontWeight: 400,
      cursor: "pointer",
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
          "Recurrence added successfully. The task will be added soon"
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
    if (!task.TaskName || task.TaskName.trim() === "") {
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

    if (!task.Performer || !task.Performer.EMail) {
      return {
        value: false,
        message: "Please select an assignee",
      };
    }
    // Make Description mandatory
    if (!task.TaskDescription || task.TaskDescription.trim() === "") {
      return {
        value: false,
        message: "Please fill the Description",
      };
    }

    if (task.IsApproval) {
      if (!task.Approver || !task.Approver.EMail) {
        return {
          value: false,
          message: "Please select an approver",
        };
      }
    }

    // Remove time portion for accurate date comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const startDate = new Date(task.StartDate);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(task.EndDate);
    endDate.setHours(0, 0, 0, 0);

    // For recurrence tasks being added, add extra validations
    if (task.IsRecurrence && props.modalProps.type === "Add") {
      if (!task.RecurrenceType || task.RecurrenceType.trim() === "") {
        return {
          value: false,
          message: "Please select a recurrence type",
        };
      }
      if (task.RecurrenceType === "Weekly" && !task.RecurrenceDay) {
        return {
          value: false,
          message: "Please select a recurrence day for weekly recurrence",
        };
      }
      if (task.RecurrenceType === "Monthly" && !task.RecurrenceDate) {
        return {
          value: false,
          message: "Please select a recurrence date for monthly recurrence",
        };
      }
      // Additional recurrence validations
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
    if (
      props.modalProps.type === "Add" ||
      (props.modalProps.type === "Edit" && task.Status === "Yet to start")
    ) {
      // Updated validation: start date must be greater than or equal to today
      if (startDate < today) {
        return {
          value: false,
          message: "The start date must be today or a future date",
        };
      }
      // Ensure Start Date and End Date are provided
      if (!task.StartDate) {
        return {
          value: false,
          message: "Start date is mandatory",
        };
      }
      if (!task.EndDate) {
        return {
          value: false,
          message: "End date is mandatory",
        };
      }

      // Updated validation: end date must be greater than or equal to start date
      if (endDate < startDate) {
        return {
          value: false,
          message: "The end date must be later or greater than the start date",
        };
      }
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
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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
      // If the computed day is before today, keep adding weeks until it's not before today.
      while (result < today) {
        result.setDate(result.getDate() + 7);
      }
      // If the result equals today, return today.
      if (result.getTime() === today.getTime()) {
        return today;
      }
      return result;
    } else if (recurrenceType === "Monthly" && recurrenceDate) {
      // Get today's date with time removed
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      // Create candidate date for the current month
      const candidate = new Date(
        today.getFullYear(),
        today.getMonth(),
        recurrenceDate
      );
      // If candidate equals today, return today
      if (
        candidate.getDate() === today.getDate() &&
        candidate.getMonth() === today.getMonth() &&
        candidate.getFullYear() === today.getFullYear()
      ) {
        return today;
      }
      // If candidate is after today, return candidate, otherwise get next month's candidate
      if (candidate >= today) {
        return candidate;
      } else {
        const nextCandidate = new Date(
          today.getFullYear(),
          today.getMonth() + 1,
          recurrenceDate
        );
        // If nextCandidate equals today (edge-case), return today
        if (
          nextCandidate.getDate() === today.getDate() &&
          nextCandidate.getMonth() === today.getMonth() &&
          nextCandidate.getFullYear() === today.getFullYear()
        ) {
          return today;
        }
        return nextCandidate;
      }
    } else if (recurrenceType === "Daily") {
      // For daily recurrence, if the start day is today, return today; otherwise, next day.
      if (startWithoutTime.getTime() === today.getTime()) {
        return today;
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
    let lastTaskNumber = 0;
    await SpServices.SPReadItems({ Listname: Config.ListName.Tasks }).then(
      (res: ITask[]) => {
        res.forEach((task) => {
          if (task.Title && task.Title.startsWith("T_")) {
            const num = parseInt(task.Title.replace("T_", ""), 10);
            if (!isNaN(num) && num > lastTaskNumber) {
              lastTaskNumber = num;
            }
          }
        });
      }
    );
    const newTaskNumber = lastTaskNumber + 1;
    const formattedID = `T_${newTaskNumber.toString().padStart(5, "0")}`;

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
      AllocatorId: props.currentUser.Id,
    };
    // Prepare JSON for Task
    const requestTaskJSON = {
      Title: props.modalProps.type === "Edit" ? task.Title : formattedID,
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
      AllocatorId:
        props.modalProps.type === "Edit"
          ? task.Allocator?.ID
          : props.currentUser.Id,
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
      await SpServices.SPReadItemUsingId({
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
    setLoader(true);
    setTaskData(
      props.modalProps.type === "Edit"
        ? (props.modalProps.selectedValue as ITask)
        : null
    );
    setLoader(false);
  }, [props.showModal, props.modalProps]);

  const isFieldDisabled = (): boolean => {
    // Once completed, approved, or rejected, disable editing
    if (
      taskData?.Status === "Overdue" ||
      taskData?.Status === "Completed" ||
      taskData?.Status === "Approved" ||
      taskData?.Status === "Rejected" ||
      taskData?.Status === "Awaiting approval"
    ) {
      return true;
    }
    // Otherwise, in edit mode, allow editing only if:
    // - the current user is the creator (Allocator) OR
    // - the current user is an approver and task status is "Yet to start"
    return (
      props.modalProps.type === "Edit" &&
      !(
        props.currentUser.Email === taskData?.Allocator?.EMail ||
        (props.currentUser.isApprover && taskData?.Status === "Yet to start")
      )
    );
  };

  return (
    <div>
      <Toast ref={toast} />
      <Dialog
        draggable={false}
        header={`${props.modalProps.type === "Edit" ? "Update" : "Add"} Task`}
        visible={props.showModal}
        style={{ width: "50vw" }}
        onHide={() => {
          props.handlerModalVisibilty(false);
        }}
      >
        {isLoader ? (
          <Loader />
        ) : (
          <div className={styles.modalContent}>
            {/* Row */}
            <div className={styles.row}>
              <div className={styles.col4}>
                <label htmlFor="TaskName">
                  Task Name <span style={{ color: "red" }}>*</span>
                </label>
                <InputText
                  placeholder="Task Name"
                  disabled={isFieldDisabled()}
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
                <label htmlFor="Category">
                  Category <span style={{ color: "red" }}>*</span>
                </label>
                <Dropdown
                  placeholder="Category"
                  disabled={isFieldDisabled()}
                  value={taskData?.Category || null}
                  onChange={(e) =>
                    setTaskData({ ...taskData, Category: e.value } as ITask)
                  }
                  options={props.categoryValues}
                  optionLabel="name"
                />
              </div>
              <div className={styles.col4}>
                <label htmlFor="AssignedTo">
                  Assigned to <span style={{ color: "red" }}>*</span>
                </label>
                <CustomPeoplePicker
                  placeholder="Performer"
                  disabled={isFieldDisabled()}
                  context={props.context}
                  selectedItem={
                    taskData?.Performer ? [taskData.Performer.EMail] : []
                  }
                  onChange={(item: any) => {
                    const value = item?.[0];
                    setTaskData({
                      ...taskData,
                      Performer: value
                        ? {
                            ID: value.id,
                            Title: value.name,
                            EMail: value.email,
                          }
                        : null,
                    } as ITask);
                  }}
                />
              </div>
            </div>
            {/* Row */}
            {/* Row */}
            <div className={styles.row}>
              <div className={styles.col12}>
                <label htmlFor="Description">
                  Description <span style={{ color: "red" }}>*</span>
                </label>
                <InputTextarea
                  placeholder="Description"
                  style={{ resize: "none" }}
                  disabled={isFieldDisabled()}
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
                    disabled={isFieldDisabled()}
                    inputId="isApproval"
                    name="Approval"
                    onChange={(e) =>
                      setTaskData({
                        ...taskData,
                        IsApproval: e.target.checked,
                      } as ITask)
                    }
                    checked={
                      taskData?.IsApproval ? taskData?.IsApproval : false
                    }
                  />
                  <label htmlFor={"isApproval"}>{"Is Approval Required"}</label>
                </div>
              </div>
              <div className={styles.col4}>
                {taskData?.IsApproval && (
                  <CustomPeoplePicker
                    groupName="Approvers"
                    placeholder="Approver"
                    disabled={isFieldDisabled()}
                    selectedItem={
                      taskData?.Approver ? [taskData.Approver.EMail] : []
                    }
                    context={props.context}
                    onChange={(item: any) => {
                      let value = item?.[0];
                      setTaskData({
                        ...taskData,
                        Approver: {
                          ID: value ? value.id : "",
                          Title: value ? value.name : "",
                          EMail: value ? value.email : "",
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
                    <label htmlFor={"isReurrence"}>
                      {"Is Recurrence Task"}
                    </label>
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
                        placeholder="Recurrence type"
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
                          placeholder={`${
                            taskData?.RecurrenceType === "Weekly"
                              ? "Recurrence day"
                              : "Recurrence date"
                          }`}
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
                <label htmlFor={"startDate"}>
                  {"Start Date"} <span style={{ color: "red" }}>*</span>
                </label>
                <InputText
                  disabled={isFieldDisabled()}
                  id="startDate"
                  // Change to a text input if you want to display "MM/DD/YYYY" format
                  type="date"
                  value={
                    taskData?.StartDate
                      ? new Date(taskData.StartDate).toLocaleDateString("en-CA")
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
                <label htmlFor={"endDate"}>
                  {"End Date"} <span style={{ color: "red" }}>*</span>
                </label>
                <InputText
                  disabled={isFieldDisabled()}
                  id="endDate"
                  // Change to a text input so that the value is shown as "MM/DD/YYYY"
                  type="date"
                  value={
                    taskData?.EndDate
                      ? new Date(taskData.EndDate).toLocaleDateString("en-CA")
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
                  <label htmlFor="Status">
                    Status <span style={{ color: "red" }}>*</span>
                  </label>
                  {taskData?.Status !== "Completed" &&
                  taskData?.Status !== "Approved" &&
                  taskData?.Status !== "Rejected" &&
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
                          : taskData?.Status === "Overdue"
                          ? ["Overdue", "Completed"]
                          : ["Yet to start", "In Progress", "Completed"]
                      }
                      optionLabel="name"
                      placeholder=""
                    />
                  ) : (
                    <div
                      className={styles.taskStatus}
                      style={statusStyleMap[taskData?.Status as string] || {}}
                    >
                      {taskData?.Status}
                    </div>
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
                taskData?.Status !== "Approved" &&
                taskData?.Status !== "Rejected" &&
                taskData?.Status !== "Awaiting approval" && (
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
        )}
      </Dialog>
    </div>
  );
};

export default ModalPopup;
