import * as React from "react";
import { useEffect } from "react";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputTextarea } from "primereact/inputtextarea";
import { Checkbox } from "primereact/checkbox";
import { Dropdown } from "primereact/dropdown";
import PrimaryBtn from "../../../../Common/PrimaryButton/PrimaryBtn";
import DefaultBtn from "../../../../Common/DefaultBtn/DefaultBtn";
import styles from "./ModalPopup.module.scss";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
interface ModalPopupProps {
  context: any;
  showModal: boolean;
  onHide: () => void;
  handlerModalVisibilty: (flag: boolean) => void;
}

const ModalPopup = (props: ModalPopupProps): JSX.Element => {
  useEffect(() => {
    console.log("Modal Popup");
  }, [props.showModal]);

  return (
    <div>
      <Dialog
        header={"Add Task"}
        visible={props.showModal}
        style={{ width: "50vw" }}
        onHide={() => {
          props.handlerModalVisibilty(false);
        }}
      >
        <div className={styles.modalContent}>
          {/* Row */}
          <div className={styles.row}>
            <div className={styles.col4}>
              <label htmlFor="TaskName">Task Name</label>
              <InputText id="TaskName" />
            </div>
            <div className={styles.col4}>
              <label htmlFor="Category">Category</label>
              <InputText id="Category" />
            </div>
            <div className={styles.col4}>
              <label htmlFor="AssignedTo">Assigned to</label>
              <InputText id="AssignedTo" />
            </div>
          </div>
          {/* Row */}
          {/* Row */}
          <div className={styles.row}>
            <div className={styles.col12}>
              <label htmlFor="Description">Description</label>
              <InputTextarea rows={5} cols={30} id="Description" />
            </div>
          </div>
          {/* Row */}
          {/* Row */}
          <div className={styles.row}>
            <div className={styles.col4}>
              <div className={styles.modalCheckbox}>
                <Checkbox
                  inputId="isApproval"
                  name="Approval"
                  value={[]}
                  onChange={() => {
                    console.log("changed");
                  }}
                  checked={false}
                />
                <label htmlFor={"isApproval"}>{"Is Approval Required"}</label>
              </div>
            </div>
            <div className={styles.col4}>
              <PeoplePicker
                context={props.context}
                titleText=""
                personSelectionLimit={3}
                // groupName={} // Leave this blank in case you want to filter from all users
                showtooltip={true}
                required={true}
                disabled={true}
                searchTextLimit={5}
                // onChange={this._getPeoplePickerItems}
                showHiddenInUI={false}
                principalTypes={[PrincipalType.User]}
                resolveDelay={1000}
              />
            </div>
          </div>
          {/* Row */}
          {/* Row */}
          <div className={styles.row}>
            <div className={styles.col4}>
              <div className={styles.modalCheckbox}>
                <Checkbox
                  inputId="isReurrence"
                  name="Recurrence"
                  value={[]}
                  onChange={() => {
                    console.log("changed");
                  }}
                  checked={false}
                />
                <label htmlFor={"isReurrence"}>{"Is Recurrence Task"}</label>
              </div>
            </div>
            <div className={styles.col4}>
              <Dropdown
                value={""}
                onChange={(e) => console.log(e)}
                options={[]}
                optionLabel="name"
                placeholder="Frequency"
              />
            </div>
            <div className={styles.col4}>
              <Dropdown
                value={""}
                onChange={(e) => console.log(e)}
                options={[]}
                optionLabel="name"
                placeholder="Recurrence Type"
              />
            </div>
          </div>
          {/* Row */}
          {/* Row */}
          <div className={styles.row}>
            <div className={styles.col4}>
              <div className={styles.modalCheckbox}>
                <Checkbox
                  inputId="isCustomer"
                  name="Customer"
                  value={[]}
                  onChange={() => {
                    console.log("changed");
                  }}
                  checked={false}
                />
                <label htmlFor={"isCustomer"}>{"Is Customer Task"}</label>
              </div>
            </div>
            <div className={styles.col4}>
              <Dropdown
                value={""}
                onChange={(e) => console.log(e)}
                options={[]}
                optionLabel="name"
                placeholder="Recurrence Type"
              />
            </div>
          </div>
          {/* Row */}
          {/* Row */}
          <div className={styles.row}>
            <div className={styles.col4}>
              <label htmlFor={"startDate"}>{"Start Date"}</label>
              <InputText id="startDate" type="date" />
            </div>
            <div className={styles.col4}>
              <label htmlFor={"endDate"}>{"End Date"}</label>
              <InputText id="endDate" type="date" />
            </div>
          </div>
          {/* Row */}
          {/* Row */}
          <div className={styles.modalFooter}>
            <DefaultBtn
              label="Cancel"
              onClick={() => {
                props.handlerModalVisibilty(false);
                props.onHide();
              }}
            />
            <PrimaryBtn
              label="Submit"
              onClick={() => {
                console.log("Modal Submit");
              }}
            />
          </div>
          {/* Row */}
        </div>
      </Dialog>
    </div>
  );
};

export default ModalPopup;
