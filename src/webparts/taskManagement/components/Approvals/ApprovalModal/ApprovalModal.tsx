import * as React from "react";
import { useState, useEffect } from "react";
import { Dialog } from "primereact/dialog";
import PrimaryBtn from "../../../../../Common/PrimaryButton/PrimaryBtn";
import DefaultButton from "../../../../../Common/DefaultBtn/DefaultBtn";
import styles from "./ApprovalModal.module.scss";
import SpServices from "../../../../../Services/SPServices/SpServices";
import { Config } from "../../../../../Config/config";
interface ApprovalModalProps {
  selectedID: number;
  selectedStatus: string;
  isModalVisible: boolean;
  handlerModalToggle: (flag: boolean) => void;
}
const ApprovalModal: React.FC<ApprovalModalProps> = ({
  selectedID,
  selectedStatus,
  isModalVisible,
  handlerModalToggle,
}): JSX.Element => {
  const [visible, setVisible] = useState(false);
  const handlerUpdateListItem = async (): Promise<void> => {
    await SpServices.SPUpdateItem({
      Listname: Config.ListName.Tasks,
      ID: selectedID,
      RequestJSON: {
        Status: selectedStatus === "Approve" ? "Approved" : "Rejected",
      },
    })
      .then((res) => {
        console.log(res);
        handlerModalToggle(false);
      })
      .catch((err) => {
        console.log(err);
      });
  };
  useEffect(() => {
    setVisible(isModalVisible);
  }, [selectedID, isModalVisible]);
  return (
    <Dialog
      header={`Confirmation`}
      visible={visible}
      onHide={() => {
        handlerModalToggle(false);
      }}
      //   style={{ width: "50vw" }}
      //   breakpoints={{ "960px": "75vw", "641px": "100vw" }}
    >
      <div
        className={styles.modalContent}
      >{`Are you sure want to ${selectedStatus}?`}</div>
      <div className={styles.btnSection}>
        <PrimaryBtn
          label="Yes"
          onClick={() => {
            handlerUpdateListItem().catch((err) => {
              console.log(err);
            });
          }}
        />
        <DefaultButton
          label="No"
          onClick={() => {
            handlerModalToggle(false);
          }}
        />
      </div>
    </Dialog>
  );
};

export default ApprovalModal;
