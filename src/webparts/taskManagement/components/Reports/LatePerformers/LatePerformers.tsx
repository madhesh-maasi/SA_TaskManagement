import * as React from "react";
import { ITaskList } from "../../../../../Interface/interface";
import { Line } from "react-chartjs-2";
import styles from "./LatePerformers.module.scss";

interface LatePerformersProps {
  tasks: ITaskList;
}

const LatePerformers: React.FC<LatePerformersProps> = ({
  tasks,
}): JSX.Element => {
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

  // Option 1: Generate dynamic primary color variations based on #40BE85.
  // Primary color approximated as hsl(153, 66%, 50%), with lightness varying from 40% to 60%.
  const primaryHue = 153;
  const primarySaturation = 66;
  const totalCount = performerLabels.length;
  const primaryColors = performerLabels.map((_, index) => {
    const lightness =
      totalCount > 1 ? 40 + (20 * index) / (totalCount - 1) : 50;
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

  // Combine both options: alternate between primaryColors and multiColors.
  const finalBorderColors = performerLabels.map((_, index) =>
    index % 2 === 0 ? primaryColors[index].border : multiColors[index]
  );
  const finalBackgroundColors = performerLabels.map((_, index) =>
    index % 2 === 0 ? primaryColors[index].background : multiColors[index]
  );

  // For the line chart:
  //   - Use finalBorderColors for the line color.
  //   - Use a lighter variant for area fill by reducing opacity.
  const fillColors = finalBackgroundColors.map((color) =>
    color.replace(/hsla\((.*),\s*0\.6\)/, "hsla($1, 0.3)")
  );

  const data = {
    labels: performerLabels,
    datasets: [
      {
        label: "Tasks per Performer",
        data: performerData,
        borderColor: finalBorderColors,
        backgroundColor: fillColors,
        fill: true,
        tension: 0.4,
        borderWidth: 2,
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
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <div className={styles.LatePerformers}>
      <Line data={data} options={options} />
    </div>
  );
};

export default LatePerformers;
