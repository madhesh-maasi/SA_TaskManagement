import * as React from "react";
import { ITaskList } from "../../../../../Interface/interface";
import styles from "./TimeToComplete.module.scss";
import { Bar } from "react-chartjs-2";

// Import and register required Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Helper to parse a formatted date string "DD/MM/YYYY" into a Date object.
const parseFormattedDate = (dateStr: string): Date => {
  const [day, month, year] = dateStr.split("/").map(Number);
  return new Date(year, month - 1, day);
};

interface TimeToCompleteProps {
  tasks: ITaskList;
}

const TimeToComplete: React.FC<TimeToCompleteProps> = ({
  tasks,
}): JSX.Element => {
  // Extract all performers from tasks
  const performers = tasks.map((task) => task.Performer);
  // Get a list of unique performers by comparing their EMail values
  const uniquePerformers = performers.filter(
    (p, index, arr) => arr.findIndex((item) => item.EMail === p.EMail) === index
  );

  // Build labels for the chart (uses performer Title if available)
  const performerLabels = uniquePerformers.map((p) => p.Title || p.EMail);

  // Compute the average days from StartDate to CompletionDate for each performer.
  const averageDays = uniquePerformers.map((performer) => {
    // Filter tasks for the performer that have a CompletionDate.
    const completedTasks = tasks.filter(
      (task) => task.Performer.EMail === performer.EMail && task.CompletionDate
    );
    if (completedTasks.length === 0) return 0;
    const totalDays = completedTasks.reduce((sum, task) => {
      const start = parseFormattedDate(task.StartDate);
      const end = parseFormattedDate(task.CompletionDate!);
      const diffDays = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
      return sum + diffDays;
    }, 0);
    return parseFloat((totalDays / completedTasks.length).toFixed(2));
  });

  // For simplicity, use a static color palette.
  const palette = [
    "#40BE85",
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
  ];
  const finalBackgroundColors = performerLabels.map(
    (_, index) => palette[index % palette.length]
  );

  const data = {
    labels: performerLabels,
    datasets: [
      {
        label: "Avg Days to Complete",
        data: averageDays,
        backgroundColor: finalBackgroundColors,
        borderColor: finalBackgroundColors,
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
      title: {
        display: true,
        text: "Average Completion Time by Performer",
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Average Days" },
        ticks: {
          callback: (value: number) => value.toFixed(2),
        },
      },
      x: {
        title: { display: true, text: "Performers" },
      },
    },
  };

  return (
    <div className={styles.TimeToComplete}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default TimeToComplete;
