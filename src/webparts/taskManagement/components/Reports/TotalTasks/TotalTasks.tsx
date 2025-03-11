import * as React from "react";
import { ITaskList } from "../../../../../Interface/interface";
import styles from "./TotalTasks.module.scss";
import { Pie } from "react-chartjs-2";

interface TotalTasksProps {
  tasks: ITaskList;
}

const TotalTasks: React.FC<TotalTasksProps> = ({ tasks }): JSX.Element => {
  // Updated popular modern colors with a glass effect look (translucence)
  const palette = [
    "rgba(255,105,180, 0.6)", // Hot Pink
    "rgba(0,204,255, 0.6)", // Vivid Sky Blue
    "rgba(255,223,0, 0.6)", // Bright Yellow
    "rgba(144,238,144, 0.6)", // Light Green
    "rgba(147,112,219, 0.6)", // Medium Purple
    "rgba(255,165,0, 0.6)", // Orange
  ];
  const data = {
    labels: [
      "Yet to start",
      "In Progress",
      "Overdue",
      "Completed",
      "Approved",
      "Rejected",
    ],
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
        backgroundColor: palette,
        hoverBackgroundColor: palette,
      },
    ],
  };
  // Chart options with legend placed on the bottom right
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
