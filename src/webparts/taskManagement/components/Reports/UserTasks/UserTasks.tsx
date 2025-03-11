import * as React from "react";
import { ITaskList } from "../../../../../Interface/interface";
import { Doughnut } from "react-chartjs-2";
import styles from "./UserTasks.module.scss";

interface UserTasksProps {
  tasks: ITaskList;
}

// Function to generate color using HSL with a glassy look
const generateColor = (index: number, total: number): string => {
  const hue = Math.floor((360 / total) * index);
  return `hsla(${hue}, 70%, 60%, 0.6)`;
};

const UserTasks: React.FC<UserTasksProps> = ({ tasks }): JSX.Element => {
  // Extract performers from tasks
  const _arrPerformers = tasks.map((task) => task.Performer);

  // Remove duplicate performers using the EMail key
  const distinctPerformers = _arrPerformers.filter(
    (performer, index, self) =>
      index === self.findIndex((item) => item.EMail === performer.EMail)
  );

  // Build labels and corresponding data for each distinct performer
  const performerLabels = distinctPerformers.map(
    (performer) => performer.Title || performer.EMail
  );
  const performerData = distinctPerformers.map(
    (performer) =>
      tasks.filter((task) => task.Performer.EMail === performer.EMail).length
  );

  // Base palette for a few colors
  const basePalette = [
    "rgba(255,105,180, 0.6)", // Hot Pink
    "rgba(0,204,255, 0.6)", // Vivid Sky Blue
    "rgba(255,223,0, 0.6)", // Bright Yellow
    "rgba(144,238,144, 0.6)", // Light Green
    "rgba(147,112,219, 0.6)", // Medium Purple
    "rgba(255,165,0, 0.6)", // Orange
  ];

  // Generate a dynamic palette based on the number of unique performers
  const backgroundColors =
    performerLabels.length <= basePalette.length
      ? performerLabels.map(
          (_, index) => basePalette[index % basePalette.length]
        )
      : performerLabels.map((_, index) =>
          generateColor(index, performerLabels.length)
        );

  const data = {
    labels: performerLabels,
    datasets: [
      {
        label: "Tasks per Performer",
        data: performerData,
        backgroundColor: backgroundColors,
        hoverBackgroundColor: backgroundColors,
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
    <div className={styles.UserTasks}>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default UserTasks;
