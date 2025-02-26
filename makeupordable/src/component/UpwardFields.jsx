import {
  HtmlHTMLAttributes,
  InputHTMLAttributes,
  useId,
  ReactNode,
  useState,
  LegacyRef,
  TextareaHTMLAttributes,
  CSSProperties,
  forwardRef,
  useImperativeHandle,
} from "react";
import "../style/design.css";
import { isValidDate } from "../lib/validateDate";
import { format } from "date-fns";
import { wait } from "../lib/wait";

// interface TextInputProps {
//   input: InputHTMLAttributes<HTMLInputElement>;
//   label: HtmlHTMLAttributes<HTMLLabelElement>;
//   inputRef?: React.RefObject<HTMLInputElement>;
//   icon?: ReactNode; // New prop for the icon
//   iconPosition?: "start" | "end"; // New prop to choose icon position
//   onIconClick?: React.MouseEventHandler<HTMLDivElement> | undefined;
//   disableIcon?: boolean;
//   containerStyle?: CSSProperties;
// }

// interface TextAreaPrps {
//   textarea: TextareaHTMLAttributes<HTMLTextAreaElement>;
//   label: HtmlHTMLAttributes<HTMLLabelElement>;
//   _inputRef: LegacyRef<HTMLTextAreaElement>;
//   icon?: ReactNode; // New prop for the icon
//   iconPosition?: "start" | "end"; // New prop to choose icon position
//   onIconClick?: React.MouseEventHandler<HTMLDivElement> | undefined;
//   disableIcon?: boolean;
//   containerStyle?: CSSProperties;
// }

// interface TextFormatedInputProps extends TextInputProps {
//   onChange?: React.ChangeEventHandler<HTMLInputElement> | undefined;
//   onBlur?: React.ChangeEventHandler<HTMLInputElement> | undefined;
// }
export function TextFormatedInput({
  input,
  label,
  inputRef,
  icon,
  iconPosition = "end", // Default position is 'end'
  disableIcon = false,
  onIconClick = (e) => {},
  onChange = (e) => {},
  onBlur = (e) => {},
  containerStyle,
}) {
  // const [inputValue, setInputValue] = useState('');
  const id = useId();

  // Helper function to format numbers with commas
  const formatNumber = (value) => {
    if (!value) return value;

    // Split the value into integer and decimal parts
    const parts = value.split(".");

    // Add commas to the integer part only
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    // Join the integer and decimal parts if decimal exists
    return parts.join(".");
  };

  // Helper function to remove commas
  const unformatNumber = (value) => {
    return value.replace(/,/g, "");
  };

  // Function to ensure two decimal places
  const ensureTwoDecimals = (value) => {
    // If the value has no decimal part, append '.00'
    if (!value.includes(".")) {
      if (value === "") {
        return "0.00";
      } else {
        return value + ".00";
      }
    }

    // If the value has one decimal place, append '0'
    const parts = value.split(".");
    if (parts[1].length === 1) {
      return value + "0";
    }

    // If it already has two decimal places, return as is
    return value;
  };

  const handleChange = (e) => {
    let value = e.target.value;

    // Remove commas for processing
    value = unformatNumber(value);

    // Allow only numbers, commas, and one decimal point
    const regex = /^-?\d+(,\d{3})*(\.\d*)?$/;

    // Remove commas for processing
    value = unformatNumber(value);

    // Check if the value is valid
    if (value === "" || regex.test(value)) {
      // Set the formatted value back in the input field
      //setInputValue(formatNumber(value));
      e.target.value = formatNumber(value);
    } else {
      const numbers = value.match(/\d+/g);
      if (numbers) {
        const newV = numbers.join("");
        e.target.value = formatNumber(newV);
      } else {
        e.target.value = "0";
      }
    }
  };

  const handleBlur = (e) => {
    let value = unformatNumber(e.target.value);

    // Ensure the value has two decimal places
    value = ensureTwoDecimals(value);

    // Set the value with commas and .00 (if needed)
    // setInputValue(formatNumber(value));
    e.target.value = formatNumber(value);
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        position: "relative",
        ...containerStyle, // Enable absolute positioning for icon
      }}
    >
      <label {...label} htmlFor={id}>
        {label.title}
      </label>
      {icon && iconPosition === "start" && (
        <div style={{ position: "absolute", left: "8px", zIndex: 1 }}>
          {icon}
        </div>
      )}
      <input
        ref={inputRef}
        id={id}
        {...input}
        type="text"
        style={{
          height: "100%",
          textAlign: "right",
          ...input.style,
        }}
        onChange={(e) => {
          handleChange(e);
          onChange(e);
        }}
        onBlur={(e) => {
          handleBlur(e);
          onBlur(e);
        }} // Add .00 on blur
        onFocus={(e)=>{
          e.currentTarget.select()
          if(input && input.onFocus)
          input.onFocus(e)
        }}
      />
      {icon && iconPosition === "end" && (
        <div
          onClick={onIconClick}
          style={{
            position: "absolute",
            right: "2px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 1,
            cursor: disableIcon ? "none" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "white",
            pointerEvents: disableIcon ? "none" : "auto",
          }}
        >
          {icon}
        </div>
      )}
    </div>
  );
}

export function TextInput({
  input,
  label,
  inputRef,
  icon,
  iconPosition = "end", // Default position is 'end'
  disableIcon = false,
  containerStyle,
  onIconClick = (e) => {},
}) {
  const id = useId();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        position: "relative",
        ...containerStyle,
      }}
    >
      <label {...label} htmlFor={id}>
        {label.title}
      </label>
      {icon && iconPosition === "start" && (
        <div style={{ position: "absolute", left: "8px", zIndex: 1 }}>
          {icon}
        </div>
      )}
      <input
        ref={inputRef}
        id={id}
        {...input}
        onBlur={(e) => {
          if (input.type === "month") {
            if(!isValidDate(`${e.currentTarget.value}-01`)){
              alert(`Invalid ${label.title?.replace(/:/g, "").trim()}!, Resetting date.`)
              e.currentTarget.value = format(new Date(),'yyyy-MM')
              wait(100).then(()=>{
                inputRef?.current?.focus()
              })
              return
            }
          }
          if (input.type === "date") {
            if(!isValidDate(e.currentTarget.value)){
                 alert(`Invalid ${label.title?.replace(/:/g, "").trim()}!, Resetting date.`)
                  e.currentTarget.value = format(new Date(),'yyyy-MM-dd')
                  wait(100).then(()=>{
                    inputRef?.current?.focus()
                  })
                  return
            }
          }
          if (input && input.onBlur) input.onBlur(e);
        }}
        style={{
          height: "100%",
          ...input.style,
        }}
      />
      {icon && iconPosition === "end" && (
        <div
          onClick={onIconClick}
          style={{
            position: "absolute",
            right: "2px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 1,
            cursor: disableIcon ? "none" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "white",
            pointerEvents: disableIcon ? "none" : "auto",
          }}
        >
          {icon}
        </div>
      )}
    </div>
  );
}

export function TextAreaInput({
  textarea,
  label,
  _inputRef,
  icon,
  iconPosition = "end", // Default position is 'end'
  disableIcon = false,
  onIconClick = (e) => {},
  containerStyle,
}) {
  const id = useId();

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        position: "relative",
        ...containerStyle, // Enable absolute positioning for icon
      }}
    >
      <label {...label} htmlFor={id}>
        {label.title}
      </label>
      {icon && iconPosition === "start" && (
        <div style={{ position: "absolute", left: "8px", zIndex: 1 }}>
          {icon}
        </div>
      )}
      <textarea
        ref={_inputRef}
        id={id}
        {...textarea}
        style={{
          height: "100%",
          ...textarea.style,
        }}
      />
      {icon && iconPosition === "end" && (
        <div
          onClick={onIconClick}
          style={{
            position: "absolute",
            right: "2px",
            top: "50%",
            transform: "translateY(-50%)",
            zIndex: 1,
            cursor: disableIcon ? "none" : "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "white",
            pointerEvents: disableIcon ? "none" : "auto",
          }}
        >
          {icon}
        </div>
      )}
    </div>
  );
}

export const SelectInput = forwardRef(
  (
    {
      select,
      label,
      selectRef,
      datasource = [],
      values = "",
      display = "",
      containerStyle,
    },
    
    // : {
    //   selectRef?: React.RefObject<HTMLSelectElement>;
    //   labelRef?: React.RefObject<HTMLLabelElement>;
    //   select: InputHTMLAttributes<HTMLSelectElement>;
    //   label: HtmlHTMLAttributes<HTMLLabelElement>;
    //   datasource: Array<any>;
    //   values: string;
    //   display: string;
    //   containerStyle?: React.CSSProperties | undefined;
    // },
    ref
  ) => {
    const [_datasource, _setDataSource] = useState(datasource);
    const id = useId();

    useImperativeHandle(ref, () => ({
      setDataSource: (_dataSource) => {
        _setDataSource(_dataSource);
      },
      getDataSource: () => {
        return _datasource;
      },
    }));

    return (
      <div
        style={{
          display: "flex",
          height: "18px",
          alignItems: "center",
          ...containerStyle,
        }}
      >
        <label {...label} htmlFor={id}>
          {label.title}
        </label>
        <select
          {...select}
          ref={selectRef}
          className={`select ${select.className}`}
          style={{
            height: "18px",
            ...select.style,
          }}
        >
          {_datasource.map((itm, idx) => {
            return (
              <option key={idx} value={itm[values]}>
                {itm[display]}
              </option>
            );
          })}
        </select>
      </div>
    );
  }
);

export function ButtonField({
  buttonRetRef,
  button,
  tooltipText = "",
  children,
  disabled = false,
}

// : {
//   buttonRetRef?: React.RefObject<HTMLButtonElement>;
//   button: HtmlHTMLAttributes<HTMLButtonElement>;
//   tooltipText: string;
//   children: React.ReactNode;
//   disabled?: boolean;
// }

) {
  return (
    <div className="tooltip">
      <button
        disabled={disabled}
        {...button}
        ref={buttonRetRef}
        style={{
          ...button.style,
          background: !disabled ? "transparent" : "#f1f1f1",
        }}
        className="tooltip-button"
      >
        {children}
      </button>
      {!disabled && <span className="tooltip-text">{tooltipText}</span>}
    </div>
  );
}
