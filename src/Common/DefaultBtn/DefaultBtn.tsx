import * as React from "react";
import { Button } from "primereact/button";
import styles from "./DefaultBtn.module.scss";
interface DefaultBtnProps {
  label: string;
  onClick: () => void;
}
const DefaultBtn: React.FC<DefaultBtnProps> = ({
  label,
  onClick,
}): JSX.Element => {
  return (
    <Button className={styles.DefaultBtn} label={label} onClick={onClick} />
  );
};

export default DefaultBtn;
