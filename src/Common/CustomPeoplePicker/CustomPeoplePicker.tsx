import * as React from "react";
import { useState, useEffect } from "react";
import { Config } from "../../Config/config";
import {
  PeoplePicker,
  PrincipalType,
} from "@pnp/spfx-controls-react/lib/PeoplePicker";
import styles from "./CustomPeoplePicker.module.scss";
const CustomPeoplePicker: React.FC<any> = ({
  onChange,
  placeholder,
  personSelectionLimit,
  selectedItem,
  size,
  withLabel,
  labelText,
  disabled,
  isValid,
  errorMsg,
  readOnly,
  noErrorMsg = false,
  mandatory,
  multiUsers = false,
  groupName,
  context,
}) => {
  // State Declaration
  const [isFocused, setIsFocused] = useState(false);

  const selectedUserItem = selectedItem
    ? selectedItem?.filter((item: any) => item !== undefined && item !== null)
    : [];
  const handleChange = (items: any[]): void => {
    const obj = items?.map((item: any) => ({
      id: item.id,
      email: item?.secondaryText,
      name: item?.text,
    }));
    setIsFocused(true);
    onChange && onChange(obj);
  };
  useEffect(() => {
    if (selectedUserItem?.length) {
      setIsFocused(true);
    }

    // else {
    //   setIsFocused(false);
    // }
  }, [selectedItem, isFocused]);
  return (
    <div className={styles.CustomWrapper}>
      <PeoplePicker
        context={context}
        webAbsoluteUrl={Config.TenantDetail.webURL}
        personSelectionLimit={personSelectionLimit}
        showtooltip={false}
        ensureUser={true}
        onChange={handleChange}
        styles={{
          root: {
            minWidth: "100%",
            maxWidth: "100%",
          },
          text: {
            border: "0 !important",
            outline: "0 !important",
          },
        }}
        groupName={groupName ?? null}
        principalTypes={[PrincipalType.User]}
        defaultSelectedUsers={selectedUserItem}
        disabled={disabled}
        placeholder={placeholder}
      />
    </div>
  );
};
export default CustomPeoplePicker;
