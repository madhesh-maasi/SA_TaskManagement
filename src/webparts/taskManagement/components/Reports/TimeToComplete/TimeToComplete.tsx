import * as React from "react";
import { ITaskList } from "../../../../../Interface/interface";
import styles from "./TimeToComplete.module.scss";
import { Bar } from "react-chartjs-2";

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

  // Compute the average number of days taken from StartDate to CompletionDate for each performer.
  // Only include tasks where CompletionDate is not earlier than StartDate.
  const averageDays = distinctPerformers.map((performer) => {
    const completedTasks = tasks.filter(
      (task) => task.Performer.EMail === performer.EMail && task.CompletionDate
    );
    const validTasks = completedTasks.filter((task) => {
      const start = new Date(task.StartDate);
      const end = new Date(task.CompletionDate!);
      return end.getTime() >= start.getTime();
    });
    if (validTasks.length === 0) return 0;
    const totalDays = validTasks.reduce((sum, task) => {
      const start = new Date(task.StartDate);
      const end = new Date(task.CompletionDate!);
      const diff = (end.getTime() - start.getTime()) / (1000 * 3600 * 24);
      return sum + diff;
    }, 0);
    return parseFloat((totalDays / validTasks.length).toFixed(2));
  });

  // Option 1: Generate dynamic color variations based on the primary color (#40BE85)
  // Primary color approximated as hsl(153, 66%, 50%) with lightness varying from 40% to 60%
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
  const multiColors = performerLabels.map((_, index) => {
    return basePalette[index % basePalette.length];
  });

  // Combine the two options (alternating between primaryColors and multiColors):
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

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "bottom",
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
