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

import * as Excel from "exceljs";
import * as FileSaver from "file-saver";

// Helper function to format date using DD/MM/YYYY format
const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat("en-GB", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(dateString));
};

// New helper to parse a DD/MM/YYYY formatted string into a Date object.
const parseUKDate = (dateStr: string): Date => {
  const parts = dateStr.split("/");
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  return new Date(year, month, day);
};

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
  const { defaultStartDate, defaultEndDate } = getDefaultDates();
  // allTasks state holds the complete (unfiltered) dataset.
  const [allTasks, setAllTasks] = useState<ITaskList>([]);
  // tasks state holds the filtered dataset.
  const [tasks, setTasks] = useState<ITaskList>([]);
  const [startDate, setStartDate] = useState<string>(defaultStartDate);
  const [endDate, setEndDate] = useState<string>(defaultEndDate);
  const [loading, setLoading] = useState<boolean>(false);
  const [performers, setPerformers] = useState<
    { EMail: string; Title: string }[]
  >([]);

  // Function to load tasks (both filtered and full data)
  const handlerGetAllTasks = async (): Promise<void> => {
    setLoading(true);

    await SpServices.SPReadItems({
      Listname: Config.ListName.Tasks,
      Select:
        "*,Performer/Title,Performer/EMail,Allocator/Title,Allocator/EMail,Category/Title,Category/ID,Approver/Title,Approver/EMail,Recurrence/ID,Recurrence/Title",
      Expand: "Performer,Allocator,Category,Approver,Recurrence",
      Orderby: "ID",
      Orderbydecorasc: false,
    })
      .then((response) => {
        // Map the full response into your required task format.
        const mappedTasks = response.map((li: ITask) => {
          return {
            ID: li.ID,
            Title: li.Title,
            TaskName: li.TaskName,
            TaskDescription: li.TaskDescription,
            Category: { code: li?.Category?.ID, name: li?.Category?.Title },
            Allocator: li.Allocator,
            Performer: li.Performer,
            StartDate: formatDate(li.StartDate),
            EndDate: formatDate(li.EndDate),
            CompletionDate: li.CompletionDate
              ? formatDate(li.CompletionDate)
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

        // Set the allTasks state to store complete data (unfiltered)
        setAllTasks([...mappedTasks]);

        // Extract all unique performers from full response (before filtering)
        const allPerformers = response
          .map((li: ITask) => li.Performer)
          .filter(
            (performer, index, self) =>
              index === self.findIndex((p) => p.EMail === performer.EMail)
          );
        console.log("Unique Performers:", allPerformers);
        setPerformers([...allPerformers]);

        // Now filter tasks based on date
        const filteredTasks = mappedTasks.filter((li: ITask) => {
          const taskStart = parseUKDate(li.StartDate);
          return (
            taskStart >= new Date(startDate) && taskStart <= new Date(endDate)
          );
        });
        setTasks([...filteredTasks]);
      })
      .catch((error) => {
        console.error("Error fetching tasks:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Apply filter using the complete (allTasks) state
  const applyFilter = async () => {
    // Filter the complete dataset already stored in allTasks
    const filteredTasks = allTasks.filter((li: ITask) => {
      const taskStart = parseUKDate(li.StartDate);
      return taskStart >= new Date(startDate) && taskStart <= new Date(endDate);
    });
    setTasks([...filteredTasks]);
  };

  const createExcelFile = (tasks: ITaskList, allTasks: ITaskList, performers: { EMail: string; Title: string }[]) => {
    const workbook = new Excel.Workbook();

    const headerStyle = (worksheet: any, headerKeys: any) => {
      headerKeys.forEach((key: any) => {
        worksheet.getCell(key).fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "40be85" },
        };
        worksheet.getCell(key).font = { color: { argb: "FFFFFF" }, bold: true };
      });
    };

    const addSheet = (sheetName: string, columns: any[], data: any[]) => {
      const worksheet = workbook.addWorksheet(sheetName);
      worksheet.columns = columns;

      data.forEach((item: any) => worksheet.addRow(item));

      // Apply header styles
      const colKeys = worksheet.columns.map((_, idx: number) =>
        String.fromCharCode(65 + idx) + "1"
      );
      headerStyle(worksheet, colKeys);
    };

    // 1. Total Tasks Summary
    const statusCounts = {
      "Yet to start": tasks.filter(t => t.Status === "Yet to start").length,
      "In Progress": tasks.filter(t => t.Status === "In Progress").length,
      "Overdue": tasks.filter(t => t.Status === "Overdue").length,
      "Completed": tasks.filter(t => t.Status === "Completed").length,
      "Approved": tasks.filter(t => t.Status === "Approved").length,
      "Rejected": tasks.filter(t => t.Status === "Rejected").length
    };

    addSheet(
      "Total Tasks Summary",
      [
        { header: "Status", key: "Status", width: 20 },
        { header: "Count", key: "Count", width: 15 },
        { header: "Percentage", key: "Percentage", width: 15 }
      ],
      Object.entries(statusCounts).map(([status, count]) => ({
        Status: status,
        Count: count,
        Percentage: `${((count / tasks.length) * 100).toFixed(2)}%`
      }))
    );

    // 2. Detailed Tasks
    addSheet(
      "Detailed Tasks",
      [
        { header: "ID", key: "ID", width: 10 },
        { header: "Title", key: "Title", width: 30 },
        { header: "Task Name", key: "TaskName", width: 30 },
        { header: "Category", key: "Category", width: 20 },
        { header: "Performer", key: "Performer", width: 25 },
        { header: "Allocator", key: "Allocator", width: 25 },
        { header: "Start Date", key: "StartDate", width: 15 },
        { header: "End Date", key: "EndDate", width: 15 },
        { header: "Completion Date", key: "CompletionDate", width: 15 },
        { header: "Status", key: "Status", width: 15 },
        { header: "Is Approval", key: "IsApproval", width: 15 },
        { header: "Customer Name", key: "CustomerName", width: 25 }
      ],
      tasks.map(task => ({
        ID: task.ID,
        Title: task.Title,
        TaskName: task.TaskName,
        Category: task.Category?.name || "N/A",
        Performer: task.Performer?.Title || task.Performer?.EMail || "N/A",
        Allocator: task.Allocator?.Title || task.Allocator?.EMail || "N/A",
        StartDate: task.StartDate,
        EndDate: task.EndDate,
        CompletionDate: task.CompletionDate || "N/A",
        Status: task.Status,
        IsApproval: task.IsApproval ? "Yes" : "No",
        CustomerName: task.CustomerName || "N/A"
      }))
    );

    // 3. User Tasks Distribution
    addSheet(
      "User Tasks Distribution",
      [
        { header: "Performer", key: "Performer", width: 30 },
        { header: "Total Tasks", key: "TotalTasks", width: 15 },
        { header: "Completed", key: "Completed", width: 15 },
        { header: "In Progress", key: "InProgress", width: 15 },
        { header: "Overdue", key: "Overdue", width: 15 },
        { header: "Yet to Start", key: "YetToStart", width: 15 }
      ],
      performers.map(performer => {
        const performerTasks = tasks.filter(t => t.Performer?.EMail === performer.EMail);
        return {
          Performer: performer.Title || performer.EMail,
          TotalTasks: performerTasks.length,
          Completed: performerTasks.filter(t => t.Status === "Completed").length,
          InProgress: performerTasks.filter(t => t.Status === "In Progress").length,
          Overdue: performerTasks.filter(t => t.Status === "Overdue").length,
          YetToStart: performerTasks.filter(t => t.Status === "Yet to start").length
        };
      })
    );

    // 4. Late Performers Analysis
    const overdueTasks = tasks.filter(t => t.Status === "Overdue");
    const latePerformersData = performers
      .filter(performer => overdueTasks.some(t => t.Performer?.EMail === performer.EMail))
      .reduce((acc, performer) => {
        const performerOverdueTasks = overdueTasks.filter(t => t.Performer?.EMail === performer.EMail);
        const performerData = performerOverdueTasks.map(task => ({
          Performer: performer.Title || performer.EMail,
          TaskName: task.TaskName,
          EndDate: task.EndDate,
          StartDate: task.StartDate,
          Category: task.Category?.name || "N/A"
        }));
        return [...acc, ...performerData];
      }, [] as Array<{
        Performer: string;
        TaskName: string;
        EndDate: string;
        StartDate: string;
        Category: string;
      }>);

    addSheet(
      "Late Performers Analysis",
      [
        { header: "Performer", key: "Performer", width: 30 },
        { header: "Task Name", key: "TaskName", width: 40 },
        { header: "Start Date", key: "StartDate", width: 15 },
        { header: "End Date", key: "EndDate", width: 15 },
        { header: "Category", key: "Category", width: 20 }
      ],
      latePerformersData
    );

    // 5. Time to Complete Analysis
    const completedTasks = allTasks.filter(t => t.Status === "Completed" && t.CompletionDate);
    addSheet(
      "Time to Complete Analysis",
      [
        { header: "Performer", key: "Performer", width: 30 },
        { header: "Total Completed Tasks", key: "TotalCompleted", width: 20 },
        { header: "Average Days to Complete", key: "AvgDays", width: 20 },
        { header: "Min Days", key: "MinDays", width: 15 },
        { header: "Max Days", key: "MaxDays", width: 15 }
      ],
      performers.map(performer => {
        const performerCompletedTasks = completedTasks.filter(t => t.Performer?.EMail === performer.EMail);
        if (performerCompletedTasks.length === 0) return null;

        const completionTimes = performerCompletedTasks.map(task => {
          const start = parseUKDate(task.StartDate);
          const end = parseUKDate(task.CompletionDate!);
          return (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
        });

        return {
          Performer: performer.Title || performer.EMail,
          TotalCompleted: performerCompletedTasks.length,
          AvgDays: (completionTimes.reduce((a, b) => a + b, 0) / completionTimes.length).toFixed(2),
          MinDays: Math.min(...completionTimes).toFixed(2),
          MaxDays: Math.max(...completionTimes).toFixed(2)
        };
      }).filter(Boolean)
    );

    // 6. Performer Ranking
    addSheet(
      "Performer Ranking",
      [
        { header: "Performer", key: "Performer", width: 30 },
        { header: "Total Tasks", key: "TotalTasks", width: 15 },
        { header: "Completed Tasks", key: "CompletedTasks", width: 15 },
        { header: "Completion Rate", key: "CompletionRate", width: 15 },
        { header: "On Time Rate", key: "OnTimeRate", width: 15 }
      ],
      performers.map(performer => {
        const performerTasks = tasks.filter(t => t.Performer?.EMail === performer.EMail);
        const completedTasks = performerTasks.filter(t => t.Status === "Completed");
        const onTimeTasks = completedTasks.filter(task => {
          if (!task.CompletionDate) return false;
          const completionDate = parseUKDate(task.CompletionDate);
          const endDate = parseUKDate(task.EndDate);
          return completionDate <= endDate;
        });

        const totalTasks = performerTasks.length;
        const completedCount = completedTasks.length;
        const onTimeCount = onTimeTasks.length;

        // Calculate rates with proper handling of division by zero
        const completionRate = totalTasks > 0
          ? ((completedCount / totalTasks) * 100).toFixed(2)
          : "0.00";

        const onTimeRate = completedCount > 0
          ? ((onTimeCount / completedCount) * 100).toFixed(2)
          : "0.00";

        return {
          Performer: performer.Title || performer.EMail,
          TotalTasks: totalTasks,
          CompletedTasks: completedCount,
          CompletionRate: `${completionRate}%`,
          OnTimeRate: `${onTimeRate}%`
        };
      })
    );

    workbook.xlsx
      .writeBuffer()
      .then((buffer: any) =>
        FileSaver.saveAs(
          new Blob([buffer]),
          `TaskReports_${new Date().toLocaleString().replace(/[/:]/g, '-')}.xlsx`
        )
      )
      .catch((err: any) => console.log("Error writing Excel export", err));
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
          <i
            title="Export excel"
            className="pi pi-upload"
            style={{ fontSize: "1.3rem", color: "#01a977", display: "flex", cursor: "pointer", alignItems: "center", marginRight: "1rem" }}
            onClick={() => {
              createExcelFile(tasks, allTasks, performers)
            }
            }
          ></i>
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
          <UserTasks tasks={tasks} performers={performers} />
        </div>
        <div className={styles.Chart}>
          <h4>Late Performers</h4>
          <LatePerformers
            tasks={tasks.filter((ti) => ti.Status === "Overdue")}
          />
        </div>
        <div className={styles.Chart}>
          <h4>Time To Complete</h4>
          <TimeToComplete tasks={allTasks} />
        </div>
        <div className={styles.Chart}>
          <h4>Performer Ranking</h4>
          <PerformerRanking tasks={tasks} performers={performers} />
        </div>
      </div>
    </div>
  );
};

export default Reports;
