import * as React from "react";
import { ITaskList } from "../../../../../Interface/interface";
import styles from "./TotalTasks.module.scss";
import { Pie } from "react-chartjs-2";

interface TotalTasksProps {
  tasks: ITaskList;
}

const TotalTasks: React.FC<TotalTasksProps> = ({ tasks }): JSX.Element => {
  const statusLabels = [
    "Yet to start",
    "In Progress",
    "Overdue",
    "Completed",
    "Approved",
    "Rejected",
  ];

  // Option 1: Generate dynamic color variations based on the primary color (#40BE85)
  // Primary color approximated as hsl(153,66%,50%), varying lightness between 40% and 60%
  const primaryHue = 153;
  const primarySaturation = 66;
  const totalColors = statusLabels.length;
  const primaryColors = statusLabels.map((_, index) => {
    const lightness =
      totalColors > 1 ? 40 + (20 * index) / (totalColors - 1) : 50;
    return `hsla(${primaryHue}, ${primarySaturation}%, ${lightness}%, 0.6)`;
  });

  // Option 2: A base multi‑color palette for more variety.
  const basePalette = [
    "#40BE85", // primary color
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
  ];
  const multiColors = statusLabels.map((_, index) => {
    return basePalette[index % basePalette.length];
  });

  // Combine the two options. Here, we alternate between primaryColors and multiColors.
  const finalColors = statusLabels.map((_, index) => {
    return index % 2 === 0 ? primaryColors[index] : multiColors[index];
  });
  // Alternatively, you may choose to use just one option:
  // const finalColors = multiColors;
  // or
  // const finalColors = primaryColors;

  const data = {
    labels: statusLabels,
    datasets: [
      {
        label: "Tasks",
        data: [
          tasks.filter((task) => task.Status === "Yet to start").length,
          tasks.filter((task) => task.Status === "In Progress").length,
          tasks.filter((task) => task.Status === "Overdue").length,
          tasks.filter((task) => task.Status === "Completed").length,
          tasks.filter((task) => task.Status === "Approved").length,
          tasks.filter((task) => task.Status === "Rejected").length,
        ],
        backgroundColor: finalColors,
        hoverBackgroundColor: finalColors,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        align: "end",
      },
    },
  };

  return (
    <div className={styles.TotalTaskContainer}>
      <Pie data={data} options={options} />
    </div>
  );
};

export default TotalTasks;
