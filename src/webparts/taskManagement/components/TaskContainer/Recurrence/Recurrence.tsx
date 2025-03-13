import * as React from "react";
import { useEffect, useState, useRef } from "react";
import { IRecurrence } from "../../../../../Interface/interface";
import SpServices from "../../../../../Services/SPServices/SpServices";
import { Toast } from "primereact/toast";
import { Config } from "../../../../../Config/config";
import styles from "./Recurrence.module.scss";
import RecurrenceCard from "./RecurrenceCard/RecurrenceCard";

const Recurrence: React.FC<any> = () => {
  const [recurrence, setRecurrence] = useState<IRecurrence[]>([]);
  const [render, setRender] = useState(true);
  const toast = useRef<Toast>(null);
  const handleToast = (
    severity: "success" | "info" | "warn" | "error" | "secondary" | "contrast",
    summary: string,
    detail: string
  ): void => {
    if (toast.current) {
      toast.current.show({
        severity: severity,
        summary: summary,
        detail: detail,
        life: 3000,
      });
    }
  };
  const handlerGetRecurrence = async () => {
    await SpServices.SPReadItems({
      Listname: Config.ListName.Config_Recurrence,
      Select:
        "*,Performer/Title,Performer/EMail,Performer/ID,Allocator/ID,Allocator/Title,Allocator/EMail,Category/Title,Category/ID,Approver/Title,Approver/EMail,Approver/ID",
      Expand: "Performer,Allocator,Category,Approver",
    }).then((res: IRecurrence[]) => {
      const _arrRecurrenceData = res.map((li: IRecurrence) => {
        return {
          ID: li.ID,
          Title: li.Title,
          TaskDescription: li.TaskDescription,
          StartDate: new Date(li.StartDate).toLocaleDateString(),
          EndDate: new Date(li.EndDate).toLocaleDateString(),
          Rec_Type: li.Rec_Type,
          Rec_Day: li.Rec_Day,
          Rec_Date: li.Rec_Date,
          Rec_Status: li.Rec_Status,
          Performer: li.Performer,
          Allocator: li.Allocator,
          Approver: li.Approver,
          IsApproval: li.IsApproval,
          Category: { code: li?.Category?.ID, name: li?.Category?.Title },
        };
      });
      setRecurrence([..._arrRecurrenceData]);
      console.log(recurrence);
    });
  };

  const handleUpdateToRecurrence = async (
    key: number,
    type: string,
    status: string
  ): Promise<void> => {
    if (type === "Update") {
      await SpServices.SPUpdateItem({
        Listname: Config.ListName.Config_Recurrence,
        ID: key,
        RequestJSON: { Rec_Status: status },
      })
        .then((res) => {
          console.log(res);
          setRender(true);
          handleToast("success", "Success", "Status Updated Successfully");
        })
        .catch((err) => {
          console.log(err);
        });
    } else {
      await SpServices.SPDeleteItem({
        Listname: Config.ListName.Config_Recurrence,
        ID: key,
      })
        .then((res) => {
          console.log(res);
          setRender(true);
          handleToast("success", "Success", "Task Deleted Successfully");
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };

  useEffect(() => {
    handlerGetRecurrence().catch((error) => console.log(error));
    setRender(false);
  }, [render]);

  return (
    <div className={styles.Recurrence}>
      <Toast ref={toast} />
      {recurrence.map((task: IRecurrence) => (
        <RecurrenceCard
          task={task}
          key={task.ID}
          handleUpdateToRecurrence={handleUpdateToRecurrence}
        />
      ))}
    </div>
  );
};
export default Recurrence;
