import {
  useState,
  useRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useContext,
} from "react";
import SearchIcon from "@mui/icons-material/Search";
import { TextInput } from "./UpwardFields";
import { wait } from "../lib/wait";
import CloseIcon from "@mui/icons-material/Close";
import ReactDOMServer from "react-dom/server";
import { Loading } from "./Loading";
import ReactDOM from "react-dom";
import axios from "axios";

export const DataGridViewReact = forwardRef(
  (
    {
      columns,
      rows = [],
      height = "400px",
      getSelectedItem,
      onKeyDown,
      disbaleTable = false,
      isTableSelectable: _isTableSelectable = true,
      containerStyle,
      focusElementOnMaxTop,
      ActionComponent,
      showSequence = false,
    },
    ref
  ) => {
    const parentElementRef = useRef(null);
    const actionModalRef = useRef(null);
    const checkboxRef = useRef([]);
    const tbodyRef = useRef(null);
    const [data, setData] = useState([]);
    const [column, setColumn] = useState([]);
    const [selectedRow, setSelectedRow] = useState(0);
    const [selectedRowIndex, setSelectedRowIndex] = useState(null);
    const totalRowWidth = column.reduce((a, b) => a + b.width, 0);
    const [isTableSelectable, setIsTableSelectable] =
      useState(_isTableSelectable);

    const [columnHeader, setColumnHeader] = useState(
      columns.filter((itm) => !itm.hide)
    );
    const [hoveredColumn, setHoveredColumn] = useState(null);

    useEffect(() => {
      if (columns.length > 0) {
        setColumn(columns.filter((itm) => !itm.hide));
      }
    }, [columns]);

    useImperativeHandle(ref, () => ({
      checkNoIsExist: (checkNo) => {
        return data.some((subArray) => subArray[2] === checkNo);
      },
      selectedRow: () => selectedRow,
      getData: () => {
        const newData = [...data];
        return newData;
      },
      setData: (newData) => {
        setData(newData);
      },
      getColumns: () => {
        return columns;
      },
      resetTable: () => {
        setData([]);
        setSelectedRow(0);
        setSelectedRowIndex(null);
      },
      getSelectedRow: () => {
        return selectedRowIndex;
      },
      setSelectedRow: (value) => {
        return setSelectedRowIndex(value);
      },
      resetCheckBox: () => {
        return handleResetCheckBox();
      },
      _setSelectedRow: (value) => {
        return setSelectedRow(value);
      },
      setIsTableSelectable: (param) => {
        setIsTableSelectable(param);
      },
      setDataFormated: (newData) => {
        setData(
          newData.map((itm) => {
            return columns.map((col) => itm[col.key]);
          })
        );
      },
      getDataFormatted: () => {
        const newData = [...data];
        const newDataFormatted = newData.map((itm) => {
          let newItm = {
            Check_No: itm[0],
            Check_Date: itm[1],
            Check_Amnt: itm[2],
            BankName: itm[3],
            Branch: itm[4],
            Check_Remarks: itm[5],
            Deposit_Slip: itm[6],
            DateDeposit: itm[7],
            OR_No: itm[8],
            BankCode: itm[9],
          };
          return newItm;
        });

        return newDataFormatted;
      },
      getElementBody: () => tbodyRef.current,
      getParentElement: () => parentElementRef.current,
    }));
    const handleResetCheckBox = () => {
      checkboxRef.current.forEach((checkbox, idx) => {
        if (checkbox) checkbox.checked = false;
      });
    };
    const handleResetCheckBoxByIndex = (_idx) => {
      checkboxRef.current.forEach((checkbox, idx) => {
        if (_idx === idx) {
          return;
        } else {
          if (checkbox) checkbox.checked = false;
        }
      });
    };
    const handleRightClick = (event, idx) => {
      event.preventDefault(); // Prevent the default context menu from appearing
      if (idx === selectedRowIndex) {
        actionModalRef.current.showModal();
      }
    };
    const startResize = (index, e) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startWidth = columnHeader[index].width;

      const doDrag = (moveEvent) => {
        const newWidth = startWidth + (moveEvent.clientX - startX);
        const updatedColumns = [...columnHeader];
        updatedColumns[index].width = newWidth > 50 ? newWidth : 50; // Set minimum column width
        setColumnHeader(updatedColumns);
      };

      const stopDrag = () => {
        document.removeEventListener("mousemove", doDrag);
        document.removeEventListener("mouseup", stopDrag);
      };

      document.addEventListener("mousemove", doDrag);
      document.addEventListener("mouseup", stopDrag);
    };
    const handleMouseEnter = (index) => {
      setHoveredColumn(index); // Set the hovered column index
    };
    const handleMouseLeave = () => {
      setHoveredColumn(null); // Reset hovered column index
    };

    return (
      <>
        <div
          ref={parentElementRef}
          style={{
            width: "100%",
            height,
            overflow: "auto",
            position: "relative",
            pointerEvents: disbaleTable ? "none" : "auto",
            border: disbaleTable ? "2px solid #8c8f8e" : "2px solid #c0c0c0",
            boxShadow: `inset -2px -2px 0 #ffffff, 
                        inset 2px 2px 0 #808080`,
            ...containerStyle,
            background: "#dcdcdc",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: `${totalRowWidth}px`,
              height: "auto",
            }}
          >
            <table
              id="upward-cutom-table"
              style={{
                borderCollapse: "collapse",
                width: "100%",
                position: "relative",
                background: "#dcdcdc",
              }}
            >
              <thead>
                <tr>
                  <th
                    style={{
                      width: "30px",
                      border: "none",
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      background: "#f0f0f0",
                    }}
                  ></th>
                  {showSequence && (
                    <th
                      style={{
                        width: "50px",
                        borderRight: "1px solid #e2e8f0",
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                        background: "#f0f0f0",
                        fontSize: "12px",
                        padding: "0px 5px",
                        textAlign: "center",
                      }}
                    >
                      SEQ
                    </th>
                  )}
                  {column.map((colItm, idx) => {
                    return (
                      <th
                        key={idx}
                        style={{
                          width: colItm.width,
                          borderRight: "1px solid #e2e8f0",
                          position: "sticky",
                          top: 0,
                          zIndex: 1,
                          background: "#f0f0f0",
                          fontSize: "12px",
                          padding: "0px 5px",
                          textAlign:
                            colItm.type === "number" ? "center" : "left",
                        }}
                      >
                        <div
                          key={idx}
                          className={` ${
                            hoveredColumn === idx ? `highlight-column` : ""
                          }`} // Add the class if hovered
                          style={{ width: colItm.width, height: "20px" }}
                        >
                          {colItm.label}

                          <div
                            className="resize-handle"
                            onMouseDown={(e) => startResize(idx, e)}
                            onMouseEnter={(e) => {
                              e.preventDefault();
                              handleMouseEnter(idx);
                            }} // On hover
                            onMouseLeave={(e) => {
                              e.preventDefault();
                              handleMouseLeave();
                            }} // On mouse leave
                          />
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody ref={tbodyRef}>
                {data?.map((rowItm, rowIdx) => {
                  return (
                    <RowComponent
                      key={rowIdx}
                      rowIdx={rowIdx}
                      rowItm={rowItm}
                      selectedRowIndex={selectedRowIndex}
                      selectedRow={selectedRow}
                      isTableSelectable={isTableSelectable}
                      setSelectedRowIndex={setSelectedRowIndex}
                      getSelectedItem={getSelectedItem}
                      setSelectedRow={setSelectedRow}
                      column={column}
                      onKeyDown={onKeyDown}
                      focusElementOnMaxTop={focusElementOnMaxTop}
                      data={data}
                      parentElementRef={parentElementRef}
                      checkboxRef={checkboxRef}
                      handleResetCheckBox={handleResetCheckBox}
                      handleResetCheckBoxByIndex={handleResetCheckBoxByIndex}
                      handleRightClick={handleRightClick}
                      showSequence={showSequence}
                    />
                  );
                })}
              </tbody>
            </table>
            <style>
              {`
             #upward-cutom-table tr td{
               border-right:1px solid #f1f5f9 !important;
             }
          
              #upward-cutom-table tr:nth-child(odd) td {
                  background-color: #ffffff !important;
              }
              #upward-cutom-table tr:nth-child(even) td {
                  background-color: #f5f5f5 !important;
              }
              #upward-cutom-table tr.selected td {
                  background-color: #0076d7 !important;
                  color: #ffffff !important;
                  border-right:1px solid white !important;
                border-bottom:1px solid white !important;

              }
              
               #upward-cutom-table tr.selected td input {
                  color: #ffffff !important;
              }

              .resize-handle {
                    position: absolute;
                    right: 0;
                    top: 0;
                    width: 5px;
                    height: 100%;
                    cursor: col-resize;
                    background-color: transparent;
                  }

                  .resize-handle:hover {
                    background-color: #101111;
                  }

                  .highlight-column {
                    border-right: 2px solid #007bff !important;
                  }
  
              `}
            </style>
          </div>
        </div>
      </>
    );
  }
);

const RowComponent = forwardRef(
  (
    {
      rowIdx,
      rowItm,
      selectedRowIndex,
      selectedRow,
      isTableSelectable,
      setSelectedRowIndex,
      getSelectedItem,
      setSelectedRow,
      column,
      onKeyDown,
      focusElementOnMaxTop,
      data,
      parentElementRef,
      checkboxRef,
      handleResetCheckBox,
      handleResetCheckBoxByIndex,
      handleRightClick,
      showSequence,
    },
    ref
  ) => {
    return (
      <tr
        data-index={rowIdx}
        key={rowIdx}
        className={`row ${
          selectedRow === rowIdx || selectedRowIndex === rowIdx
            ? "selected"
            : ""
        }`}
      >
        <td
          style={{
            position: "relative",
            border: "none",
            cursor: "pointer",
            background: selectedRow === rowIdx ? "#0076d" : "",
            padding: 0,
            margin: 0,
          }}
        >
          <div
            style={{
              width: "18px",
              height: "18px",
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CheckBoxSelection
              key={rowIdx}
              checkboxRef={checkboxRef}
              isTableSelectable={isTableSelectable}
              setSelectedRowIndex={setSelectedRowIndex}
              rowIdx={rowIdx}
              rowItm={rowItm}
              getSelectedItem={getSelectedItem}
              setSelectedRow={setSelectedRow}
              handleResetCheckBoxByIndex={handleResetCheckBoxByIndex}
            />
          </div>
        </td>

        {showSequence && (
          <td
            style={{
              position: "relative",
              border: "none",
              cursor: "pointer",
              background: selectedRow === rowIdx ? "#0076d" : "",
              padding: 0,
              margin: 0,
            }}
          >
            <input
              readOnly={true}
              defaultValue={`${String(rowIdx + 1).padStart(2, "0")}`}
              style={{
                width: "50px",
                pointerEvents: "none",
                border: "none",
                background: "transparent",
                userSelect: "none",
                height: "100%",
                textAlign: "center",
              }}
            />
          </td>
        )}

        {column.map((colItm, colIdx) => {
          return (
            <td
              className={`td row-${rowIdx} col-${colIdx} `}
              tabIndex={0}
              onDoubleClick={() => {
                if (!isTableSelectable) {
                  return;
                }
                handleResetCheckBox();
                if (selectedRowIndex === rowIdx) {
                  setSelectedRowIndex(null);

                  checkboxRef.current[rowIdx].checked = false;

                  if (getSelectedItem) {
                    getSelectedItem(null, null, rowIdx, null);
                  }
                } else {
                  checkboxRef.current[rowIdx].checked = true;

                  setSelectedRowIndex(rowIdx);
                  if (getSelectedItem) {
                    getSelectedItem(rowItm, null, rowIdx, null);
                  }
                }
                setSelectedRow(null);
              }}
              onClick={() => {
                setSelectedRow(rowIdx);
              }}
              onKeyDown={(e) => {
                if (onKeyDown) {
                  onKeyDown(rowItm, rowIdx, e);
                }
                if (e.key === "ArrowUp") {
                  setSelectedRow((prev) => {
                    const index = Math.max(prev - 1, -1);
                    const td = document.querySelector(`.td.row-${index}`);

                    if (index < 0) {
                      if (focusElementOnMaxTop) {
                        focusElementOnMaxTop();
                      }
                      return;
                    }
                    if (td) {
                      td.focus();
                    }
                    return index;
                  });
                } else if (e.key === "ArrowDown") {
                  setSelectedRow((prev) => {
                    const index = Math.min(prev + 1, data.length - 1);
                    const td = document.querySelector(`.td.row-${index}`);

                    if (td) {
                      td.focus();
                      if (index <= 15) {
                        parentElementRef.current.style.overflow = "hidden";
                        setTimeout(() => {
                          parentElementRef.current.style.overflow = "auto";
                        }, 100);
                        return index;
                      }
                    }
                    return index;
                  });
                }
                if (e.code === "Enter" || e.code === "NumpadEnter") {
                  e.preventDefault();

                  if (!isTableSelectable) {
                    return;
                  }

                  setSelectedRowIndex(rowIdx);

                  if (getSelectedItem) {
                    getSelectedItem(rowItm, null, rowIdx, null);
                  }
                  setSelectedRow(null);
                }
              }}
              key={colIdx}
              style={{
                border: "none",
                fontSize: "12px",
                padding: "0px 5px",
                cursor: "pointer",
                height: "20px",
                userSelect: "none",
              }}
              onContextMenu={(e) => handleRightClick(e, rowIdx)}
            >
              {
                <input
                  readOnly={true}
                  value={rowItm[colIdx]}
                  style={{
                    width: colItm.width,
                    pointerEvents: "none",
                    border: "none",
                    background: "transparent",
                    userSelect: "none",
                    height: "100%",
                    textAlign: colItm.type === "number" ? "right" : "left",
                  }}
                />
              }
            </td>
          );
        })}
      </tr>
    );
  }
);
const CheckBoxSelection = forwardRef(
  (
    {
      isTableSelectable,
      setSelectedRowIndex,
      rowIdx,
      rowItm,
      getSelectedItem,
      setSelectedRow,
      checkboxRef,
      handleResetCheckBoxByIndex,
    },
    ref
  ) => {
    return (
      <input
        ref={(el) => (checkboxRef.current[rowIdx] = el)}
        style={{
          cursor: "pointer",
          margin: "0px !important",
          position: "absolute",
        }}
        readOnly={true}
        type="checkbox"
        onClick={(e) => {
          if (!isTableSelectable) {
            return;
          }
          handleResetCheckBoxByIndex(rowIdx);
          if (e.currentTarget.checked) {
            setSelectedRowIndex(rowIdx);
            if (getSelectedItem) {
              getSelectedItem(rowItm, null, rowIdx, null);
            }
            setSelectedRow(null);
            return;
          } else {
            setSelectedRowIndex(null);
            if (getSelectedItem) {
              getSelectedItem(null, null, rowIdx, null);
            }
            setSelectedRow(null);
            return;
          }
        }}
      />
    );
  }
);

const ActionModal = forwardRef(
  ({ handleOnSave, handleOnClose, hasSelectedRow, Component }, ref) => {
    const [showModal, setShowModal] = useState(false);
    const [handleDelayClose, setHandleDelayClose] = useState(false);
    const [blick, setBlick] = useState(false);

    const closeDelay = () => {
      setHandleDelayClose(true);
      setTimeout(() => {
        setShowModal(false);
        setHandleDelayClose(false);
        if (handleOnClose) handleOnClose();
      }, 100);
    };
    const closeDelayRef = useRef(closeDelay);

    useImperativeHandle(ref, () => ({
      showModal: () => {
        setShowModal(true);
      },
      clsoeModal: () => {
        setShowModal(false);
      },
      blick,
      closeDelay,
    }));

    useEffect(() => {
      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          closeDelayRef.current();
        }
      });
    }, []);

    return showModal ? (
      <>
        <div
          style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            background: "transparent",
            zIndex: "88",
          }}
          onClick={() => {
            setBlick(true);
            setTimeout(() => {
              setBlick(false);
            }, 250);
          }}
        ></div>
        <div
          style={{
            height: "auto",
            width: "auto",
            border: "1px solid #64748b",
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -75%)",
            display: "flex",
            flexDirection: "column",
            zIndex: handleDelayClose ? -100 : 100,
            opacity: handleDelayClose ? 0 : 1,
            transition: "all 150ms",
            boxShadow: "3px 6px 32px -7px rgba(0,0,0,0.75)",
          }}
        >
          <div
            style={{
              height: "22px",
              background: "white",
              display: "flex",
              justifyContent: "space-between",
              padding: "5px",
              position: "relative",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "13px", fontWeight: "bold" }}>Action</span>
            <button
              className="btn-check-exit-modal"
              style={{
                padding: "0 5px",
                borderRadius: "0px",
                background: "white",
                color: "black",
                height: "22px",
                position: "absolute",
                top: 0,
                right: 0,
              }}
              onClick={() => {
                closeDelay();
              }}
            >
              <CloseIcon sx={{ fontSize: "22px" }} />
            </button>
          </div>
          {Component}
          <style>
            {`
              .btn-check-exit-modal:hover{
                background:red !important;
                color:white !important;
              }
            `}
          </style>
        </div>
      </>
    ) : null;
  }
);

export const DataGridViewMultiSelectionReact = forwardRef(
  (
    {
      columns,
      rows = [],
      height = "400px",
      getSelectedItem,
      onKeyDown,
      disbaleTable = false,
      isTableSelectable: _isTableSelectable = true,
      containerStyle,
      focusElementOnMaxTop,
      onCheckAll,
      onUnCheckAll,
      rowIsSelectable,
    },
    ref
  ) => {
    const parentElementRef = useRef(null);
    const tbodyRef = useRef(null);
    const [data, setData] = useState([]);
    const [column, setColumn] = useState([]);
    const [selectedRow, setSelectedRow] = useState(0);
    const [selectedRowIndex, setSelectedRowIndex] = useState([]);
    const totalRowWidth = column.reduce((a, b) => a + b.width, 0);
    const [isTableSelectable, setIsTableSelectable] =
      useState(_isTableSelectable);

    const [columnHeader, setColumnHeader] = useState(
      columns.filter((itm) => !itm.hide)
    );
    const [hoveredColumn, setHoveredColumn] = useState(null);

    useEffect(() => {
      if (columns.length > 0) {
        setColumn(columns.filter((itm) => !itm.hide));
      }
    }, [columns]);

    useImperativeHandle(ref, () => ({
      checkNoIsExist: (checkNo) => {
        return data.some((subArray) => subArray[2] === checkNo);
      },
      selectedRow: () => selectedRow,
      getData: () => {
        const newData = [...data];
        return newData;
      },
      getSelectedRowsData: () => {
        const newData = [...data];
        return selectedRowIndex
          .map((index) => newData[index])
          .filter((item) => item !== undefined);
      },
      setData: (newData) => {
        setData(newData);
      },
      getColumns: () => {
        return columns;
      },
      resetTable: () => {
        setData([]);
        setSelectedRow(0);
        setSelectedRowIndex([]);
      },
      getSelectedRow: () => {
        return selectedRowIndex;
      },
      setSelectedRow: (value) => {
        return setSelectedRowIndex(value);
      },
      _setSelectedRow: (value) => {
        return setSelectedRow(value);
      },
      setDataFormated: (newData) => {
        setData(
          newData.map((itm) => {
            return columns.map((col) => itm[col.key]);
          })
        );
      },
      setIsTableSelectable: (param) => {
        setIsTableSelectable(param);
      },
      getDataFormatted: () => {
        const newData = [...data];
        const newDataFormatted = newData.map((itm) => {
          let newItm = {
            Check_No: itm[0],
            Check_Date: itm[1],
            Check_Amnt: itm[2],
            BankName: itm[3],
            Branch: itm[4],
            Check_Remarks: itm[5],
            Deposit_Slip: itm[6],
            DateDeposit: itm[7],
            OR_No: itm[8],
            BankCode: itm[9],
          };
          return newItm;
        });

        return newDataFormatted;
      },
      getElementBody: () => tbodyRef.current,
      getParentElement: () => parentElementRef.current,
      isTableSelectable,
    }));

    const startResize = (index, e) => {
      e.preventDefault();
      e.stopPropagation();

      const startX = e.clientX;
      const startWidth = columnHeader[index].width;

      const doDrag = (moveEvent) => {
        const newWidth = startWidth + (moveEvent.clientX - startX);
        const updatedColumns = [...columnHeader];
        updatedColumns[index].width = newWidth > 50 ? newWidth : 50; // Set minimum column width
        setColumnHeader(updatedColumns);
      };

      const stopDrag = () => {
        document.removeEventListener("mousemove", doDrag);
        document.removeEventListener("mouseup", stopDrag);
      };

      document.addEventListener("mousemove", doDrag);
      document.addEventListener("mouseup", stopDrag);
    };
    const handleMouseEnter = (index) => {
      setHoveredColumn(index); // Set the hovered column index
    };
    const handleMouseLeave = () => {
      setHoveredColumn(null); // Reset hovered column index
    };

    return (
      <div
        ref={parentElementRef}
        style={{
          width: "100%",
          height,
          overflow: "auto",
          position: "relative",
          pointerEvents: disbaleTable ? "none" : "auto",
          border: disbaleTable ? "2px solid #8c8f8e" : "2px solid #c0c0c0",
          boxShadow: `inset -2px -2px 0 #ffffff, 
                        inset 2px 2px 0 #808080`,
          ...containerStyle,
          background: "#dcdcdc",
        }}
      >
        <div
          style={{
            position: "absolute",
            width: `${totalRowWidth}px`,
            height: "auto",
          }}
        >
          <table
            id="upward-cutom-table-multi"
            style={{
              borderCollapse: "collapse",
              width: "100%",
              position: "relative",
              background: "#dcdcdc",
            }}
          >
            <thead>
              <tr>
                {isTableSelectable && (
                  <th
                    style={{
                      width: "30px",
                      border: "none",
                      position: "sticky",
                      top: 0,
                      zIndex: 1,
                      background: "#f0f0f0",
                    }}
                  >
                    <div
                      style={{
                        width: "18px",
                        height: "18px",
                        position: "relative",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <input
                        style={{
                          cursor: "pointer",
                          margin: "0px !important",
                          position: "absolute",
                        }}
                        readOnly={true}
                        type="checkbox"
                        onClick={(e) => {
                          if (e.currentTarget.checked) {
                            if (onCheckAll) {
                              onCheckAll();
                            }
                          } else {
                            if (onUnCheckAll) {
                              onUnCheckAll();
                            }
                          }
                        }}
                      />
                    </div>
                  </th>
                )}
                {column.map((colItm, idx) => {
                  return (
                    <th
                      key={idx}
                      style={{
                        width: colItm.width,
                        borderRight: "1px solid #e2e8f0",
                        position: "sticky",
                        top: 0,
                        zIndex: 1,
                        background: "#f0f0f0",
                        fontSize: "12px",
                        padding: "0px 5px",
                        textAlign: colItm.type === "number" ? "center" : "left",
                      }}
                    >
                      <div
                        key={idx}
                        className={` ${
                          hoveredColumn === idx ? `highlight-column` : ""
                        }`} // Add the class if hovered
                        style={{ width: colItm.width, height: "20px" }}
                      >
                        {colItm.label}

                        <div
                          className="resize-handle"
                          onMouseDown={(e) => startResize(idx, e)}
                          onMouseEnter={(e) => {
                            e.preventDefault();
                            handleMouseEnter(idx);
                          }} // On hover
                          onMouseLeave={(e) => {
                            e.preventDefault();
                            handleMouseLeave();
                          }} // On mouse leave
                        />
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody ref={tbodyRef}>
              {data?.map((rowItm, rowIdx) => {
                return (
                  <tr
                    data-index={rowIdx}
                    key={rowIdx}
                    className={`row ${
                      selectedRow === rowIdx &&
                      selectedRowIndex.includes(rowIdx)
                        ? "multi-selected-row-item"
                        : selectedRow === rowIdx
                        ? "multi-selected-row"
                        : selectedRowIndex.includes(rowIdx)
                        ? "multi-selected-item"
                        : ""
                    }`}
                  >
                    {isTableSelectable && (
                      <td
                        style={{
                          position: "relative",
                          border: "none",
                          cursor: "pointer",
                          background: selectedRow === rowIdx ? "#0076d" : "",
                          padding: 0,
                          margin: 0,
                        }}
                      >
                        <div
                          style={{
                            width: "18px",
                            height: "18px",
                            position: "relative",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <input
                            style={{
                              cursor: "pointer",
                              margin: "0px !important",
                              position: "absolute",
                            }}
                            readOnly={true}
                            checked={selectedRowIndex.includes(rowIdx)}
                            type="checkbox"
                            onClick={() => {
                              if (rowIsSelectable && rowIsSelectable(rowItm)) {
                                return;
                              }
                              if (!isTableSelectable) {
                                return;
                              }

                              if (selectedRowIndex.includes(rowIdx)) {
                                setSelectedRowIndex((d) =>
                                  d.filter((i) => i !== rowIdx)
                                );
                              } else {
                                setSelectedRowIndex((d) => [...d, rowIdx]);
                              }

                              if (getSelectedItem) {
                                getSelectedItem(rowItm, null, rowIdx, null);
                              }
                            }}
                          />
                        </div>
                      </td>
                    )}

                    {column.map((colItm, colIdx) => {
                      return (
                        <td
                          className={`td row-${rowIdx} col-${colIdx} `}
                          tabIndex={0}
                          onDoubleClick={() => {
                            if (rowIsSelectable && rowIsSelectable(rowItm)) {
                              return;
                            }
                            if (!isTableSelectable) {
                              return;
                            }

                            if (selectedRowIndex.includes(rowIdx)) {
                              setSelectedRowIndex((d) =>
                                d.filter((i) => i !== rowIdx)
                              );

                              if (getSelectedItem) {
                                getSelectedItem(null, null, rowIdx, null);
                              }

                              return;
                            } else {
                              setSelectedRowIndex((d) => [...d, rowIdx]);

                              if (getSelectedItem) {
                                getSelectedItem(rowItm, null, rowIdx, null);
                              }
                            }
                          }}
                          onClick={() => {
                            setSelectedRow(rowIdx);
                          }}
                          onKeyDown={(e) => {
                            if (onKeyDown) {
                              onKeyDown(rowItm, rowIdx, e);
                            }
                            if (e.key === "ArrowUp") {
                              setSelectedRow((prev) => {
                                const index = Math.max(prev - 1, -1);
                                const td = document.querySelector(
                                  `.td.row-${index}`
                                );
                                if (index < 0) {
                                  if (focusElementOnMaxTop) {
                                    focusElementOnMaxTop();
                                  }
                                  return;
                                }
                                if (td) {
                                  td.focus();
                                }
                                return index;
                              });
                            } else if (e.key === "ArrowDown") {
                              setSelectedRow((prev) => {
                                const index = Math.min(
                                  prev + 1,
                                  data.length - 1
                                );
                                const td = document.querySelector(
                                  `.td.row-${index}`
                                );
                                if (td) {
                                  td.focus();
                                  if (index <= 15) {
                                    parentElementRef.current.style.overflow =
                                      "hidden";
                                    setTimeout(() => {
                                      parentElementRef.current.style.overflow =
                                        "auto";
                                    }, 100);
                                    return index;
                                  }
                                }
                                return index;
                              });
                            }
                            if (
                              e.code === "Enter" ||
                              e.code === "NumpadEnter"
                            ) {
                              e.preventDefault();

                              if (!isTableSelectable) {
                                return;
                              }

                              if (selectedRowIndex.includes(rowIdx)) {
                                setSelectedRowIndex((d) =>
                                  d.filter((i) => i !== rowIdx)
                                );
                              } else {
                                setSelectedRowIndex((d) => [...d, rowIdx]);
                              }
                              if (getSelectedItem) {
                                getSelectedItem(rowItm, null, rowIdx, null);
                              }
                            }
                          }}
                          key={colIdx}
                          style={{
                            border: "none",
                            fontSize: "12px",
                            padding: "0px 5px",
                            cursor: "pointer",
                            height: "20px",
                            userSelect: "none",
                          }}
                        >
                          {
                            <input
                              readOnly={true}
                              value={rowItm[colIdx]}
                              style={{
                                width: colItm.width,
                                pointerEvents: "none",
                                border: "none",
                                background: "transparent",
                                userSelect: "none",
                                height: "100%",
                                textAlign:
                                  colItm.type === "number" ? "right" : "left",
                              }}
                            />
                          }
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <style>
            {`
             #upward-cutom-table-multi tr td{
               border-right:1px solid #f1f5f9 !important;
             }
          
              #upward-cutom-table-multi tr:nth-child(odd) td {
                  background-color: #ffffff !important;
              }
              #upward-cutom-table-multi tr:nth-child(even) td {
                  background-color: #f5f5f5 !important;
              }

             #upward-cutom-table-multi tr.multi-selected-row-item td {
                background-color: rgba(84, 84, 82, 0.73) !important;
                border-right:1px solid white !important;
                border-bottom:1px solid white !important;
              }
              #upward-cutom-table-multi tr.multi-selected-row-item td input {
                  color: #ffffff !important;
              }

            #upward-cutom-table-multi tr.multi-selected-item td {
                background-color: rgba(232, 232, 226, 0.99) !important;
                border-right:1px solid white !important;
                border-bottom:1px solid white !important;
              }
              #upward-cutom-table-multi tr.multi-selected-item td input {
                  color: black !important;
              }

              #upward-cutom-table-multi tr.multi-selected-row td {
                  background-color: #0076d7 !important;
                  border-right:1px solid white !important;
                  border-bottom:1px solid white !important;
              }
              #upward-cutom-table-multi tr.multi-selected-row td input {
                  color: #ffffff !important;
              }
                  .resize-handle {
                    position: absolute;
                    right: 0;
                    top: 0;
                    width: 5px;
                    height: 100%;
                    cursor: col-resize;
                    background-color: transparent;
                  }

                  .resize-handle:hover {
                    background-color: #101111;
                  }

                  .highlight-column {
                    border-right: 2px solid #007bff !important;
                  }
  
  
              `}
          </style>
        </div>
      </div>
    );
  }
);

let dataCache = [];
let searchInputValueCache = "";
export const useUpwardTableModalSearch = ({
  column,
  query,
  getSelectedItem,
  onKeyDown,
  customWidth,
  onClose,
}) => {
  const [show, setShow] = useState(false);
  const searchInputRef = useRef < HTMLInputElement > null;

  function openModal() {
    const body = document.body;
    const div = document.createElement("div");
    div.id = "modal-portal";

    if (document.getElementById("modal-portal"))
      body.removeChild(document.getElementById("modal-portal"));

    body.insertBefore(div, document.getElementById("root"));
    wait(100).then(() => {
      div.innerHTML = ReactDOMServer.renderToString(<UpwardTableModalSearch />);
    });

    setShow(true);
    setTimeout(() => {
      if (searchInputRef.current) {
        const event = new KeyboardEvent("keydown", {
          code: "Enter",
          bubbles: true,
        });
        searchInputRef.current.focus(); // Ensure the element has focus
        searchInputRef.current.dispatchEvent(event); // Dispatch the native event
        setTimeout(() => {
          searchInputRef.current?.focus();
        }, 100);
      }
    }, 100);
  }
  function closeModal(muteOnClose = true) {
    if (onClose && muteOnClose) {
      onClose();
    }
    setShow(false);
    dataCache = [];
  }
  const UpwardTableModalSearch = () => {
    const modalRef = useRef(null);
    const isMoving = useRef(false);
    const offset = useRef({ x: 0, y: 0 });

    const tableRef = useRef(null);
    const [blick, setBlick] = useState(false);
    const [data, setData] = useState([]);
    const { executeQueryToClient } = useExecuteQueryFromClient();

    useEffect(() => {
      if (dataCache.length > 0) {
        if (searchInputRef.current) {
          searchInputRef.current.value = searchInputValueCache;
        }
        setData(dataCache);
      }
    }, [setData]);

    useEffect(() => {
      if (data.length > 0) {
        dataCache = data;
        tableRef.current?.setDataFormated(data);
      }
    }, [data]);

    const handleMouseDown = (e) => {
      if (!modalRef.current) return;

      isMoving.current = true;
      offset.current = {
        x: e.clientX - modalRef.current.offsetLeft,
        y: e.clientY - modalRef.current.offsetTop,
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    // Move modal with mouse
    const handleMouseMove = (e) => {
      if (!isMoving.current || !modalRef.current) return;

      modalRef.current.style.left = `${e.clientX - offset.current.x}px`;
      modalRef.current.style.top = `${e.clientY - offset.current.y}px`;
    };

    // Stop moving when releasing mouse
    const handleMouseUp = () => {
      isMoving.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    return show ? (
      <div id="modal-inject">
        <div
          style={{
            position: "fixed",
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            background: "transparent",
            zIndex: "88",
          }}
          onClick={() => {
            setBlick(true);
            setTimeout(() => {
              setBlick(false);
            }, 250);
          }}
        ></div>

        <div
          ref={modalRef}
          style={{
            background: "#F1F1F1",
            width: customWidth
              ? customWidth(blick, column)
              : blick
              ? "451px"
              : "450px",
            height: blick ? "501px" : "500px",
            position: "absolute",
            zIndex: 111111,
            top: "50%",
            left: "50%",
            transform: "translate(-50%,-50%)",
            boxShadow: "3px 6px 32px -7px rgba(0,0,0,0.75)",
            boxSizing: "border-box",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div
            style={{
              height: "22px",
              background: "white",
              display: "flex",
              justifyContent: "space-between",
              padding: "5px",
              position: "relative",
              alignItems: "center",
              cursor: "grab",
            }}
            onMouseDown={handleMouseDown}
          >
            <span style={{ fontSize: "13px", fontWeight: "bold" }}>Search</span>
            <button
              className="btn-check-exit-modal"
              style={{
                padding: "0 5px",
                borderRadius: "0px",
                background: "white",
                color: "black",
                height: "22px",
                position: "absolute",
                top: 0,
                right: 0,
              }}
              onClick={() => {
                closeModal();
              }}
            >
              <CloseIcon sx={{ fontSize: "22px" }} />
            </button>
          </div>
          <div
            style={{
              padding: "5px",
            }}
          >
            <TextInput
              containerStyle={{
                width: "100%",
              }}
              label={{
                title: "Search : ",
                style: {
                  fontSize: "12px",
                  fontWeight: "bold",
                  width: "70px",
                  display: "none",
                },
              }}
              input={{
                type: "text",
                style: { width: "100%" },
                onKeyDown: async (e) => {
                  if (e.code === "NumpadEnter" || e.code === "Enter") {
                    searchInputValueCache = e.currentTarget.value;
                    const searchQuery = query(e.currentTarget.value);
                    console.log(searchQuery);
                    const dd = await executeQueryToClient(searchQuery);
                    setData(dd.data.data);
                  }

                  if (e.code === "ArrowDown") {
                    const td = document.querySelector(`.td.row-0`);
                    if (td) {
                      const parentElement = tableRef.current.getParentElement();

                      td.focus({
                        preventScroll: true,
                      });
                      parentElement.style.overflow = "hidden";
                      wait(100).then(() => {
                        parentElement.style.overflow = "auto";
                      });
                    }
                    tableRef.current?._setSelectedRow(0);
                  }
                },
              }}
              inputRef={searchInputRef}
              icon={<SearchIcon sx={{ fontSize: "18px" }} />}
              onIconClick={async (e) => {
                e.preventDefault();
                if (searchInputRef.current)
                  searchInputValueCache = searchInputRef.current.value;
                const searchQuery = query(searchInputRef.current?.value);
                const dd = await executeQueryToClient(searchQuery);
                setData(dd.data.data);
              }}
            />
          </div>
          <div
            style={{
              flex: 1,
            }}
          >
            <DataGridViewReact
              columns={column}
              height={"100%"}
              ref={tableRef}
              getSelectedItem={getSelectedItem}
              onKeyDown={onKeyDown}
              focusElementOnMaxTop={() => {
                searchInputRef.current?.focus();
              }}
            />
          </div>
          <div style={{ padding: "0 10px" }}>
            <span style={{ fontSize: "13px", fontWeight: "bold" }}>
              Records: Top {data.length}
            </span>
          </div>
          <style>
            {`
                                    .btn-check-exit-modal:hover{
                                        background:red !important;
                                        color:white !important;
                                    }
                                `}
          </style>
        </div>
      </div>
    ) : (
      <></>
    );
  };

  return {
    openModal,
    closeModal,
    UpwardTableModalSearch,
  };
};

let _dataCache = [];
let _searchInputValueCache = "";
export const useUpwardTableModalSearchSafeMode = ({
  column,
  link,
  getSelectedItem,
  onKeyDown,
  customWidth,
  onClose,
  size = "small",
}) => {
  const [show, setShow] = useState(false);
  const searchInputRef = useRef < HTMLInputElement > null;

  function openModal(search = "") {
    const body = document.body;
    const div = document.createElement("div");
    div.id = "modal-portal";

    if (document.getElementById("modal-portal"))
      body.removeChild(document.getElementById("modal-portal"));
    body.insertBefore(div, body.firstChild);

    setShow(true);
    wait(100).then(() => {
      if (searchInputRef.current) {
        searchInputRef.current.value = search;
        const event = new KeyboardEvent("keydown", {
          code: "Enter",
          bubbles: true,
        });
        searchInputRef.current.focus(); // Ensure the element has focus
        searchInputRef.current.dispatchEvent(event); // Dispatch the native event
        wait(100).then(() => {
          searchInputRef.current?.focus();
        });
      }
    });
  }
  function closeModal(muteOnClose = true) {
    if (onClose && muteOnClose) {
      onClose();
    }
    setShow(false);
    _dataCache = [];
  }
  const UpwardTableModalSearch = () => {
    const modalRef = useRef(null);
    const isMoving = useRef(false);
    const offset = useRef({ x: 0, y: 0 });

    const tableRef = useRef(null);
    const [blick, setBlick] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [data, setData] = useState([]);

    function mutate(variable) {
      setIsLoading(true);
      axios
        .post(link, variable)
        .then((response) => {
          setData(response.data?.data);
          setIsLoading(false);
        })
        .catch((err) => {
          setIsLoading(false);
          console.log(err);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }

    useEffect(() => {
      if (_dataCache.length > 0) {
        if (searchInputRef.current) {
          searchInputRef.current.value = _searchInputValueCache;
        }
        setData(_dataCache);
      }
    }, [setData]);

    useEffect(() => {
      if (data.length > 0) {
        _dataCache = data;
      }
      tableRef.current?.setDataFormated(data);
    }, [data]);

    function customWidth(blick) {
      if (size === "large") {
        return blick ? "851px" : "850px";
      } else if (size === "medium") {
        return blick ? "651px" : "650px";
      } else {
        return blick ? "451px" : "450px";
      }
    }

    const handleMouseDown = (e) => {
      if (!modalRef.current) return;

      isMoving.current = true;
      offset.current = {
        x: e.clientX - modalRef.current.offsetLeft,
        y: e.clientY - modalRef.current.offsetTop,
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    // Move modal with mouse
    const handleMouseMove = (e) => {
      if (!isMoving.current || !modalRef.current) return;

      modalRef.current.style.left = `${e.clientX - offset.current.x}px`;
      modalRef.current.style.top = `${e.clientY - offset.current.y}px`;
    };

    // Stop moving when releasing mouse
    const handleMouseUp = () => {
      isMoving.current = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };

    return show ? (
      ReactDOM.createPortal(
        <div id="modal-inject">
          <div
            style={{
              position: "fixed",
              top: 0,
              bottom: 0,
              left: 0,
              right: 0,
              background: "transparent",
              zIndex: "88",
            }}
            onClick={() => {
              setBlick(true);
              setTimeout(() => {
                setBlick(false);
              }, 250);
            }}
          ></div>

          <div
            ref={modalRef}
            style={{
              background: "#F1F1F1",
              width: customWidth(blick),
              height: blick ? "501px" : "500px",
              position: "absolute",
              zIndex: 111111,
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              boxShadow: "3px 6px 32px -7px rgba(0,0,0,0.75)",
              boxSizing: "border-box",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {isLoading && <Loading />}
            <div
              style={{
                height: "22px",
                background: "white",
                display: "flex",
                justifyContent: "space-between",
                padding: "5px",
                position: "relative",
                alignItems: "center",
                cursor: "grab",
              }}
              onMouseDown={handleMouseDown}
            >
              <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                Search
              </span>
              <button
                className="btn-check-exit-modal"
                style={{
                  padding: "0 5px",
                  borderRadius: "0px",
                  background: "white",
                  color: "black",
                  height: "22px",
                  position: "absolute",
                  top: 0,
                  right: 0,
                }}
                onClick={() => {
                  closeModal();
                }}
              >
                <CloseIcon sx={{ fontSize: "22px" }} />
              </button>
            </div>
            <div
              style={{
                padding: "5px",
              }}
            >
              <TextInput
                containerStyle={{
                  width: "100%",
                }}
                label={{
                  title: "Search : ",
                  style: {
                    fontSize: "12px",
                    fontWeight: "bold",
                    width: "70px",
                    display: "none",
                  },
                }}
                input={{
                  type: "text",
                  style: { width: "100%" },
                  onKeyDown: async (e) => {
                    if (e.code === "NumpadEnter" || e.code === "Enter") {
                      _searchInputValueCache = e.currentTarget.value;
                      mutate({ search: e.currentTarget.value });
                    }

                    if (e.code === "ArrowDown") {
                      const td = document.querySelector(`.td.row-0`);
                      if (td) {
                        const parentElement =
                          tableRef.current.getParentElement();

                        td.focus({
                          preventScroll: true,
                        });
                        parentElement.style.overflow = "hidden";
                        wait(100).then(() => {
                          parentElement.style.overflow = "auto";
                        });
                      }
                      tableRef.current?._setSelectedRow(0);
                    }
                  },
                  onInput: (e) => {
                    if (e.currentTarget.value === "") {
                      mutate({ search: "" });
                    }
                  },
                }}
                inputRef={searchInputRef}
                icon={<SearchIcon sx={{ fontSize: "18px" }} />}
                onIconClick={async (e) => {
                  e.preventDefault();
                  if (searchInputRef.current)
                    _searchInputValueCache = searchInputRef.current.value;

                  mutate({ search: searchInputRef.current?.value });
                }}
              />
            </div>
            <div
              style={{
                flex: 1,
              }}
            >
              <DataGridViewReact
                columns={column}
                height={"100%"}
                ref={tableRef}
                getSelectedItem={getSelectedItem}
                onKeyDown={onKeyDown}
                focusElementOnMaxTop={() => {
                  searchInputRef.current?.focus();
                }}
              />
            </div>
            <div style={{ padding: "0 10px" }}>
              <span style={{ fontSize: "13px", fontWeight: "bold" }}>
                Records: Top {data.length}
              </span>
            </div>
            <style>
              {`
                                    .btn-check-exit-modal:hover{
                                        background:red !important;
                                        color:white !important;
                                    }
                                `}
            </style>
          </div>
        </div>,
        document.getElementById("modal-portal")
      )
    ) : (
      <></>
    );
  };

  return {
    openModal,
    closeModal,
    UpwardTableModalSearch,
    searchInputRef,
  };
};

function useExecuteQueryFromClient() {



  async function executeQueryToClient(query) {
      return await axios.post('/execute-query', { query })
  }

  return {
      executeQueryToClient
  }
}
