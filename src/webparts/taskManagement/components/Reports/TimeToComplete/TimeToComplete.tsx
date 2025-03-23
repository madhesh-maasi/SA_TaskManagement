import * as React from "react";
import { ITaskList } from "../../../../../Interface/interface";
import styles from "./TimeToComplete.module.scss";
import { Bar } from "react-chartjs-2";

// Helper to parse a formatted date string "DD/MM/YYYY" back to a Date object.
const parseFormattedDate = (dateStr: string): Date => {
  const parts = dateStr.split("/");
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10);
  return new Date(year, month, day);
};

interface TimeToCompleteProps {
  tasks: ITaskList;
}

const TimeToComplete: React.FC<TimeToCompleteProps> = ({
  tasks,
}): JSX.Element => {
  // Extract performers from tasks
  const performers = tasks.map((task) => task.Performer);
  // Remove duplicate performers using the EMail key
  const distinctPerformers = performers.filter(
    (performer, index, self) =>
      index === self.findIndex((item) => item.EMail === performer.EMail)
  );
  // Build labels (performer names)
  const performerLabels = distinctPerformers.map(
    (performer) => performer.Title || performer.EMail
  );
  // Compute the average days from StartDate to CompletionDate for each performer.
  const averageDays = distinctPerformers.map((performer) => {
    const completedTasks = tasks.filter(
      (task) => task.Performer.EMail === performer.EMail && task.CompletionDate
    );
    const validTasks = completedTasks.filter((task) => {
      const start = parseFormattedDate(task.StartDate);
      const end = parseFormattedDate(task.CompletionDate!);
      return end.getTime() >= start.getTime();
    });
    if (validTasks.length === 0) return 0;
    const totalDays = validTasks.reduce((sum, task) => {
      const start = parseFormattedDate(task.StartDate);
      const end = parseFormattedDate(task.CompletionDate!);
      const diff = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
      return sum + diff;
    }, 0);
    return parseFloat((totalDays / validTasks.length).toFixed(2));
  });

  // Option 1: Generate dynamic color variations based on the primary color (#40BE85)
  const primaryHue = 153;
  const primarySaturation = 66;
  const totalBars = performerLabels.length;
  const primaryColors = performerLabels.map((_, index) => {
    const lightness = totalBars > 1 ? 40 + (20 * index) / (totalBars - 1) : 50;
    return {
      border: `hsl(${primaryHue}, ${primarySaturation}%, ${lightness}%)`,
      background: `hsla(${primaryHue}, ${primarySaturation}%, ${lightness}%, 0.6)`,
    };
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
  const multiColors = performerLabels.map(
    (_, index) => basePalette[index % basePalette.length]
  );

  // Combine the two options: alternate between primaryColors and multiColors.
  const finalBorderColors = performerLabels.map((_, index) =>
    index % 2 === 0 ? primaryColors[index].border : multiColors[index]
  );
  const finalBackgroundColors = performerLabels.map((_, index) =>
    index % 2 === 0 ? primaryColors[index].background : multiColors[index]
  );

  const data = {
    labels: performerLabels,
    datasets: [
      {
        label: "Avg Days to Complete",
        data: averageDays,
        backgroundColor: finalBackgroundColors,
        borderColor: finalBorderColors,
        borderWidth: 1,
      },
    ],
  };

  // Modify legend to show each performer's username (from performerLabels)
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          generateLabels: (chart: any) => {
            const dataset = chart.data.datasets[0];
            return chart.data.labels.map((label: any, index: number) => {
              return {
                text: label,
                fillStyle: dataset.backgroundColor[index],
                strokeStyle: dataset.borderColor[index],
                lineWidth: dataset.borderWidth,
                hidden: false,
                index: index,
              };
            });
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: { display: true, text: "Average Days" },
        ticks: {
          callback: function (value: number) {
            return value.toFixed(2);
          },
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
