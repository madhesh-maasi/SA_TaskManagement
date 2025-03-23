import * as React from "react";
import { ITaskList } from "../../../../../Interface/interface";
import styles from "./PerformerRanking.module.scss";
import { Bar } from "react-chartjs-2";

export interface PerformerRankingProps {
  tasks: ITaskList;
  performers: { Title: string; EMail: string }[];
}

const PerformerRanking: React.FC<PerformerRankingProps> = ({
  tasks,
  performers,
}): JSX.Element => {
  // Filter tasks that are completed
  const completedTasks = tasks.filter((task) => task.Status === "Completed");

  // Extract performers from completed tasks

  // Remove duplicate performers using the EMail key
  const distinctPerformers = performers;

  // Count completed tasks per performer
  const performerCounts = distinctPerformers.map((performer) => {
    const count = completedTasks.filter(
      (task) => task.Performer.EMail === performer.EMail
    ).length;
    return { performer, count };
  });

  // Sort performers descending by the number of completed tasks
  performerCounts.sort((a, b) => b.count - a.count);

  // Build chart labels and data arrays based on ranking
  const labels = performerCounts.map(
    (item) => item.performer.Title || item.performer.EMail
  );
  const dataValues = performerCounts.map((item) => item.count);

  // Option 1: Generate dynamic color variations based on Primary color (#40BE85).
  // Approximated as hsl(153, 66%, 50%), with lightness varying from 40% to 60%.
  const primaryHue = 153;
  const primarySaturation = 66;
  const totalBars = labels.length;
  const primaryColors = labels.map((_, index) => {
    const lightness = totalBars > 1 ? 40 + (20 * index) / (totalBars - 1) : 50;
    return {
      border: `hsl(${primaryHue}, ${primarySaturation}%, ${lightness}%)`,
      background: `hsla(${primaryHue}, ${primarySaturation}%, ${lightness}%, 0.6)`,
    };
  });

  // Option 2: Base multi‑color palette for variety.
  const basePalette = [
    "#40BE85", // primary color
    "#FF6384",
    "#36A2EB",
    "#FFCE56",
    "#4BC0C0",
    "#9966FF",
    "#FF9F40",
  ];
  const multiColors = labels.map((_, index) => {
    return basePalette[index % basePalette.length];
  });

  // Combine both options: alternate between primaryColors and multiColors.
  const finalBorderColors = labels.map((_, index) =>
    index % 2 === 0 ? primaryColors[index].border : multiColors[index]
  );
  const finalBackgroundColors = labels.map((_, index) =>
    index % 2 === 0 ? primaryColors[index].background : multiColors[index]
  );

  const data = {
    labels: labels,
    datasets: [
      {
        label: "Completed Tasks",
        data: dataValues,
        backgroundColor: finalBackgroundColors,
        borderColor: finalBorderColors,
        borderWidth: 1,
      },
    ],
  };

  // Horizontal bar chart configuration
  const options = {
    indexAxis: "y" as const, // horizontal bar chart
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        title: { display: true, text: "Completed Tasks" },
      },
      y: {
        title: { display: true, text: "Performers" },
      },
    },
  };

  return (
    <div className={styles.PerformerRanking}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default PerformerRanking;
