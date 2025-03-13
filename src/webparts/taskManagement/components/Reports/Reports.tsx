import * as React from "react";
import { useEffect, useState } from "react";
import SpServices from "../../../../Services/SPServices/SpServices";
import { Config } from "../../../../Config/config";
import { ITaskList, ITask } from "../../../../Interface/interface";
import styles from "./Reports.module.scss";
import TotalTasks from "./TotalTasks/TotalTasks";
import UserTasks from "./UserTasks/UserTasks";
import LatePerformers from "./LatePerformers/LatePerformers";
import TimeToComplete from "./TimeToComplete/TimeToComplete";
import PerformerRanking from "./PerformerRanking/PerformerRanking";

// Helper to get default dates (last 30 days)
const getDefaultDates = () => {
  const today = new Date();
  const defaultEndDate = today.toISOString().slice(0, 10);
  const pastDate = new Date();
  pastDate.setDate(today.getDate() - 30);
  const defaultStartDate = pastDate.toISOString().slice(0, 10);
  return { defaultStartDate, defaultEndDate };
};

interface ReportsProps {
  context: any;
  currentUser: any;
}

interface DateRangeFilterProps {
  startDate: string;
  endDate: string;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  onApply: () => Promise<void>;
}

const DateRangeFilter: React.FC<DateRangeFilterProps> = ({
  startDate,
  endDate,
  setStartDate,
  setEndDate,
  onApply,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        gap: "1rem",
        padding: "0.5rem",
        border: "1px solid #ccc",
        borderRadius: "4px",
        backgroundColor: "#f9f9f9",
        boxShadow: "0px 2px 4px rgba(0,0,0,0.1)",
      }}
    >
      <div>
        <label style={{ fontWeight: "bold", marginRight: "0.25rem" }}>
          Start Date:
        </label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          style={{ padding: "0.25rem" }}
        />
      </div>
      <div>
        <label style={{ fontWeight: "bold", marginRight: "0.25rem" }}>
          End Date:
        </label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          style={{ padding: "0.25rem" }}
        />
      </div>
      <button
        onClick={onApply}
        style={{
          padding: "0.5rem 1rem",
          backgroundColor: "#40BE85",
          border: "none",
          color: "white",
          fontWeight: "bold",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        Apply Filter
      </button>
    </div>
  );
};

const Reports = (props: ReportsProps): JSX.Element => {
  const [tasks, setTasks] = useState<ITaskList>([]);
  const { defaultStartDate, defaultEndDate } = getDefaultDates();
  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);
  const [loading, setLoading] = useState<boolean>(false);

  // Function to load tasks based on the selected date range
  const handlerGetAllTasks = async (): Promise<void> => {
    setLoading(true);
    // Format dates with time components
    const formattedStartDate = `${startDate}T00:00:00Z`;
    const formattedEndDate = `${endDate}T23:59:59Z`;

    await SpServices.SPReadItems({
      Listname: Config.ListName.Tasks,
      Filter: [
        {
          FilterKey: "StartDate",
          Operator: "ge",
          FilterValue: formattedStartDate,
        },
        {
          FilterKey: "StartDate",
          Operator: "le",
          FilterValue: formattedEndDate,
        },
      ],
      Select:
        "*,Performer/Title,Performer/EMail,Allocator/Title,Allocator/EMail,Category/Title,Category/ID,Approver/Title,Approver/EMail,Recurrence/ID,Recurrence/Title",
      Expand: "Performer,Allocator,Category,Approver,Recurrence",
      Orderby: "ID",
      Orderbydecorasc: false,
    })
      .then((response) => {
        const taskData = response.map((li: ITask) => {
          return {
            ID: li.ID,
            Title: li.Title,
            TaskName: li.TaskName,
            TaskDescription: li.TaskDescription,
            Category: { code: li?.Category?.ID, name: li?.Category?.Title },
            Allocator: li.Allocator,
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
        setTasks([...taskData]);
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Apply filter when the user clicks the "Apply Filter" button.
  const applyFilter = async () => {
    await handlerGetAllTasks();
  };

  // Load tasks on component mount
  useEffect(() => {
    handlerGetAllTasks().catch((error) => console.error(error));
  }, []);

  return (
    <div className={styles.ReportContainer}>
      <div className={styles.headerSection}>
        <h3 className={styles.headerSectionTitle}>Reports</h3>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: "1rem",
          }}
        >
          <DateRangeFilter
            startDate={startDate}
            endDate={endDate}
            setStartDate={setStartDate}
            setEndDate={setEndDate}
            onApply={applyFilter}
          />
        </div>
      </div>
      {loading && <div>Loading tasks...</div>}
      <div className={styles.Charts}>
        {/* Chart containers */}
        <div className={styles.Chart}>
          <h4>Total Tasks</h4>
          <TotalTasks tasks={tasks} />
        </div>
        <div className={styles.Chart}>
          <h4>User Tasks</h4>
          <UserTasks tasks={tasks} />
        </div>
        <div className={styles.Chart}>
          <h4>Late Performers</h4>
          <LatePerformers
            tasks={tasks.filter((ti) => ti.Status === "Overdue")}
          />
        </div>
        <div className={styles.Chart}>
          <h4>Time To Complete</h4>
          <TimeToComplete tasks={tasks} />
        </div>
        <div className={styles.Chart}>
          <h4>Performer Ranking</h4>
          <PerformerRanking tasks={tasks} />
        </div>
      </div>
    </div>
  );
};

export default Reports;
