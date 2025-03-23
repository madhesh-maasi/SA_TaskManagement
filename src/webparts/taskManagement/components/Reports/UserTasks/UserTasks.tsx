import * as React from "react";
import { ITaskList } from "../../../../../Interface/interface";
import { Doughnut } from "react-chartjs-2";
import styles from "./UserTasks.module.scss";

interface UserTasksProps {
  tasks: ITaskList;
  performers: any[]; // Expect distinct performers array via props
}

const UserTasks: React.FC<UserTasksProps> = ({
  tasks,
  performers,
}): JSX.Element => {
  // Use performers from props directly.
  const distinctPerformers = performers;

  // Build labels and corresponding data for each performer
  const performerLabels = distinctPerformers.map(
    (performer) => performer.Title || performer.EMail
  );
  const performerData = distinctPerformers.map(
    (performer) =>
      tasks.filter((task) => task.Performer.EMail === performer.EMail).length
  );

  // Option 1: Generate dynamic color variations based on primary color #40BE85.
  // Primary color approximated as hsl(153,66%,50%) with lightness varying from 40% to 60%.
  const primaryHue = 153;
  const primarySaturation = 66;
  const totalLabels = performerLabels.length;
  const primaryColors = performerLabels.map((_, index) => {
    const lightness =
      totalLabels > 1 ? 40 + (20 * index) / (totalLabels - 1) : 50;
    return `hsla(${primaryHue}, ${primarySaturation}%, ${lightness}%, 0.6)`;
  });

  // Option 2: A base multi-color palette for more variety.
  const basePalette = [
    "#40BE85", // primary color
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
  ];
  const multiColors = performerLabels.map((_, index) => {
    return basePalette[index % basePalette.length];
  });

  // Mix the two approaches; for example, alternate between primaryColors and multiColors:
  const finalColors = performerLabels.map((_, index) => {
    return index % 2 === 0 ? primaryColors[index] : multiColors[index];
  });
  // Alternatively, you may simply choose one option:
  // const finalColors = multiColors;

  const data = {
    labels: performerLabels,
    datasets: [
      {
        label: "Tasks per Performer",
        data: performerData,
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
    <div className={styles.UserTasks}>
      <Doughnut data={data} options={options} />
    </div>
  );
};

export default UserTasks;
