import * as React from "react";
import { Toast } from "primereact/toast";
import { useRef } from "react";
import "./Toast.module.scss";

export interface CustomToastProps {
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center"
    | "center";
}

export interface CustomToastRef {
  show: (
    severity: "success" | "info" | "warn" | "error",
    summary: string,
    detail: string
  ) => void;
}

const CustomToast = React.forwardRef<CustomToastRef, CustomToastProps>(
  (props, ref) => {
    const { position = "top-right" } = props;
    const toastRef = useRef<Toast>(null);

    React.useImperativeHandle(ref, () => ({
      show: (severity, summary, detail) => {
        if (toastRef.current) {
          toastRef.current.show({
            severity,
            summary,
            detail,
            life: 3000,
            closable: true,
            className: `interactive-toast ${severity}`,
          });
        }
      },
    }));

    return (
      <Toast ref={toastRef} position={position} className="modern-toast" />
    );
  }
);

CustomToast.displayName = "CustomToast";

export default CustomToast;
