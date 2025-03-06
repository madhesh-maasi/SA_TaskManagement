import * as React from "react";
import styles from "./CardOptions.module.scss";

export interface CardOptionsProps {
  id: number;
  visible: boolean;
  isDelete: boolean;
  isView: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

const CardOptions: React.FC<CardOptionsProps> = ({
  visible,
  isDelete,
  isView,
  onEdit,
  onDelete,
}) => {
  return (
    <div
      className={`${styles.cardOptionsContainer} ${
        visible ? styles.visible : ""
      }`}
    >
      <ul className={styles.cardOptions}>
        <li className={`${styles.option} ${styles.edit}`} onClick={onEdit}>
          {isView ? "View" : "Edit"}
        </li>
        {!isDelete && (
          <li
            className={`${styles.option} ${styles.delete}`}
            onClick={onDelete}
          >
            Delete
          </li>
        )}
      </ul>
    </div>
  );
};

export default CardOptions;
