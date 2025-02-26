import * as React from "react";
import { Dialog } from "primereact/dialog";
import styles from "./DeletePopup.module.scss";
import SpServices from "../../Services/SPServices/SpServices";
import { Config } from "../../Config/config";
export interface DeletePopupProps {
  deleteModalProps: { flag: boolean; id: number };
  context: any;
  handlerDeleteModalProps: (flag: boolean, id: number) => void;
  handleToast: (severity: string, summary: string, detail: string) => void;
}

const DeletePopup: React.FC<DeletePopupProps> = ({
  context,
  deleteModalProps,
  handlerDeleteModalProps,
  handleToast,
}) => {
  const handlerDeleteFromSpList = async (): Promise<void> => {
    await SpServices.SPDeleteItem({
      Listname: Config.ListName.Tasks,
      ID: deleteModalProps.id,
    }).then((res) => {
      console.log(res);
      handlerDeleteModalProps(false, 0);
      handleToast("info", "Info", "Item deleted successfully");
    });
  };
  const footerContent = (
    <div className={styles.buttonGroup}>
      <button
        className={styles.cancelButton}
        onClick={() => {
          console.log("Cancel");
          handlerDeleteModalProps(false, 0);
        }}
      >
        Cancel
      </button>
      <button
        className={styles.confirmButton}
        onClick={() => {
          console.log(`Delete ${deleteModalProps.id}`);
          handlerDeleteFromSpList().catch((error) => {
            console.error("Error deleting item:", error);
          });
        }}
      >
        Delete
      </button>
    </div>
  );

  return (
    <Dialog
      header="Confirm Delete"
      visible={deleteModalProps.flag}
      style={{ width: "400px" }}
      footer={footerContent}
      onHide={() => {
        handlerDeleteModalProps(false, 0);
      }}
      className={styles.deleteDialog}
    >
      <p className={styles.message}>{"Do you want to delete the item?"}</p>
    </Dialog>
  );
};

export default DeletePopup;
