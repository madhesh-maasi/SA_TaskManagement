import * as React from "react";
import { Button } from "primereact/button";
import styles from "./PrimaryBtn.module.scss";
interface PrimaryBtnProps {
  label: string;
  onClick: () => void;
}
const PrimaryBtn: React.FC<PrimaryBtnProps> = ({
  label,
  onClick,
}): JSX.Element => {
  return (
    <Button className={styles.PrimaryBtn} label={label} onClick={onClick} />
  );
};

export default PrimaryBtn;
