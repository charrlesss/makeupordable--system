import {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  TextInput,
  TextAreaInput,
  TextFormatedInput,
} from "./component/UpwardFields";
import { wait } from "./lib/wait";
import axios from "axios";
import { useMutation } from "react-query";
import { Loading } from "./component/Loading";
import Swal from "sweetalert2";
import {
  DataGridViewReact,
  useUpwardTableModalSearchSafeMode,
} from "./component/DataGridViewReact";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import { height } from "@mui/system";

const URL = `http://localhost:2125`;

const productColumns = [
  { key: "ProductCode", label: "Product Code", width: 100 },
  { key: "ProductName", label: "Product Name", width: 500 },
  {
    key: "quantity",
    label: "Quantity",
    width: 100,
    type: "number",
  },
  { key: "price", label: "Item Price", width: 100, type: "number" },
  { key: "id", label: "", width: 0, hide: true },
];
function App() {
  const [id, setID] = useState(null);
  const tableRef = useRef(null);
  const modalRef = useRef(null);
  const inputSearchRef = useRef(null);

  const codeRef = useRef(null);
  const prodcutNameRef = useRef(null);
  const quantityRef = useRef(null);
  const priceRef = useRef(null);

  const { mutate: mutateCode, isLoading: isLoadingCode } = useMutation({
    mutationKey: "unique-code",
    mutationFn: async (variable) =>
      await axios.post(`${URL}/generate-code`, variable),
    onSuccess: (response) => {
      if (response.data.success) {
        wait(50).then(() => {
          if (codeRef.current) {
            codeRef.current.value = response.data.uniqueCode;
          }
        });
      }
    },
  });

  const { mutate: mutateSave, isLoading: isLoadingSave } = useMutation({
    mutationKey: "save",
    mutationFn: async (variable) =>
      await axios.post(`${URL}/add-product`, variable),
    onSuccess: (response) => {
      if (response.data.success) {
        wait(100).then(() => {
          resetRow();
          tableRef.current.setDataFormated(
            response.data.data.map((itm) => {
              itm.price = parseFloat(
                itm.price.toString().replace(/,/g, "")
              ).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });
              return itm;
            })
          );
        });

        return Swal.fire({
          position: "center",
          icon: "success",
          title: response.data.message,
          timer: 1500,
        });
      }

      Swal.fire({
        position: "center",
        icon: "error",
        title: response.data.message,
        timer: 1500,
      });
    },
  });

  const { mutate: mutateUpdate, isLoading: isLoadingUpdate } = useMutation({
    mutationKey: "update",
    mutationFn: async (variable) =>
      await axios.post(`${URL}/update-product`, variable),
    onSuccess: (response) => {
      if (response.data.success) {
        resetRow();
        wait(100).then(() => {
          tableRef.current.setDataFormated(
            response.data.data.map((itm) => {
              itm.price = parseFloat(
                itm.price.toString().replace(/,/g, "")
              ).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });
              return itm;
            })
          );
        });

        return Swal.fire({
          position: "center",
          icon: "success",
          title: response.data.message,
          timer: 1500,
        });
      }

      Swal.fire({
        position: "center",
        icon: "error",
        title: response.data.message,
        timer: 1500,
      });
    },
  });

  const { mutate: mutateDeleteItem, isLoading: isLoadingDeleteItem } =
    useMutation({
      mutationKey: "delete-item",
      mutationFn: async (variable) =>
        await axios.post(`${URL}/delete`, variable),
      onSuccess: (response) => {
        wait(100).then(() => {
          tableRef.current.setDataFormated(
            response.data.data.map((itm) => {
              itm.price = parseFloat(
                itm.price.toString().replace(/,/g, "")
              ).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });
              return itm;
            })
          );
        });
      },
    });

  const { mutate: mutateProductList, isLoading: isLoadingProductList } =
    useMutation({
      mutationKey: "product-list",
      mutationFn: async (variable) =>
        await axios.post(`${URL}/product-list`, variable),
      onSuccess: (response) => {
        wait(100).then(() => {
          tableRef.current.setDataFormated(
            response.data.data.map((itm) => {
              itm.price = parseFloat(
                itm.price.toString().replace(/,/g, "")
              ).toLocaleString("en-US", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              });
              return itm;
            })
          );
        });
      },
    });

  const handleSaveItem = () => {
    if (codeRef.current?.value === "") {
      codeRef.current.focus();
      return alert("Product Code is Required Field!");
    } else if (prodcutNameRef.current?.value === "") {
      prodcutNameRef.current.focus();
      return alert("Product Name is Required Field!");
    } else if (parseInt(quantityRef.current?.value) <= 0) {
      quantityRef.current.focus();
      return alert("Quantity must be greater than 0!");
    } else if (parseInt(priceRef.current?.value) <= 0) {
      priceRef.current.focus();
      return alert("Price must be greater than 0!");
    } else {
      if (id) {
        const isConfim = window.confirm(
          `Are you sure you want to update this code : ${codeRef.current?.value}`
        );
        if (isConfim) {
          mutateUpdate({
            id,
            ProductCode: codeRef.current?.value,
            ProductName: prodcutNameRef.current?.value,
            quantity: quantityRef.current?.value,
            price: priceRef.current?.value,
          });
        }
      } else {
        mutateSave({
          ProductCode: codeRef.current?.value,
          ProductName: prodcutNameRef.current?.value,
          quantity: quantityRef.current?.value,
          price: priceRef.current?.value,
        });
      }
    }
  };

  const mutateProductListRef = useRef(mutateProductList);
  const mutateCodeRef = useRef(mutateCode);

  const resetRow = () => {
    mutateCodeRef.current({});
    if (codeRef.current) {
      codeRef.current.value = "";
    }
    if (prodcutNameRef.current) {
      prodcutNameRef.current.value = "";
    }
    if (quantityRef.current) {
      quantityRef.current.value = "0";
    }
    if (priceRef.current) {
      priceRef.current.value = "0.00";
    }
  };

  useEffect(() => {
    mutateProductListRef.current({ search: "" });
    mutateCodeRef.current({});
  }, []);

  return (
    <>
      {(isLoadingSave ||
        isLoadingUpdate ||
        isLoadingProductList ||
        isLoadingDeleteItem ||
        isLoadingCode) && <Loading />}
      <ModalCheck
        ref={modalRef}
        handleOnSave={() => {}}
        handleOnClose={() => {}}
      />
      <div
        style={{
          padding: "10px",
          display: "flex",
          flexDirection: "column",
          flex: 1,
        }}
      >
        <div
          style={{
            width: "50%",
            border: "1px solid #9ca3af",
            boxSizing: "border-box",
            padding: "10px",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            rowGap: "5px",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "-12px",
              left: "20px",
              fontSize: "14px",
              background: "#F1F1F1",
              padding: "0 2px",
              fontWeight: "bold",
            }}
          >
            Product Information
          </span>

          <TextInput
            containerStyle={{
              width: "50%",
            }}
            label={{
              title: "Code :",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "100px",
              },
            }}
            input={{
              type: "text",
              style: { width: "calc(100% - 100px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  prodcutNameRef.current.focus();
                }
              },
            }}
            inputRef={codeRef}
          />
          <TextAreaInput
            containerStyle={{
              width: "100%",
            }}
            label={{
              title: "Product Name :",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "100px",
              },
            }}
            textarea={{
              rows: 2,
              style: {
                width: "calc(100% - 100px) ",
                textTransform: "uppercase",
              },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  quantityRef.current?.focus();
                }
              },
            }}
            _inputRef={prodcutNameRef}
          />
          <TextInput
            containerStyle={{
              width: "200px",
            }}
            label={{
              title: "Quantity :",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "100px",
              },
            }}
            input={{
              defaultValue: "0",
              type: "number",
              style: { width: "calc(100% - 100px) ", textAlign: "right" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  priceRef.current?.focus();
                }
              },
              onFocus: (e) => {
                quantityRef.current?.select();
              },
            }}
            inputRef={quantityRef}
          />
          <TextFormatedInput
            label={{
              title: "Price : ",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "95px",
              },
            }}
            input={{
              defaultValue: "0.00",
              type: "text",
              style: { width: "190px" },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  handleSaveItem();
                }
              },
            }}
            inputRef={priceRef}
          />
          <button
            style={{ background: "#4bc96c", cursor: "pointer" }}
            onClick={handleSaveItem}
          >
            Save
          </button>
        </div>
        <br />
        <div
          style={{
            display: "flex",
            columnGap: "10px",
          }}
        >
          <button
            style={{
              width: "200px",
              background: "#4bc96c",
              cursor: "pointer",
            }}
            onClick={() => {
              modalRef.current.showModal();
            }}
          >
            MAKE A PAYMENT
          </button>
          <button
            style={{
              width: "200px",
              background: "#4bc96c",
              cursor: "pointer",
            }}
            onClick={() => {
              // modalRef.current.showModal();
            }}
          >
            GENERATE PDF REPORT
          </button>
          <button
            style={{
              width: "200px",
              background: "#4bc96c",
              cursor: "pointer",
            }}
            onClick={() => {
              // modalRef.current.showModal();
            }}
          >
            GENERATE EXCEL REPORT
          </button>
        </div>
        <br />
        <div
          style={{
            width: "70%",
            border: "1px solid #9ca3af",
            boxSizing: "border-box",
            padding: "10px",
            position: "relative",
            display: "flex",
            flexDirection: "column",
            rowGap: "5px",
          }}
        >
          <span
            style={{
              position: "absolute",
              top: "-12px",
              left: "20px",
              fontSize: "14px",
              background: "#F1F1F1",
              padding: "0 2px",
              fontWeight: "bold",
            }}
          >
            Product List
          </span>
          <TextInput
            containerStyle={{
              width: "100%",
            }}
            label={{
              title: "Search Item :",
              style: {
                fontSize: "12px",
                fontWeight: "bold",
                width: "100px",
              },
            }}
            input={{
              type: "text",
              style: { width: "calc(100% - 100px) " },
              onKeyDown: (e) => {
                if (e.code === "NumpadEnter" || e.code === "Enter") {
                  mutateProductListRef.current({
                    search: e.currentTarget.value,
                  });
                }
              },
            }}
            icon={<SearchIcon sx={{ fontSize: "18px" }} />}
            onIconClick={(e) => {
              e.preventDefault();
              if (inputSearchRef.current)
                mutateProductListRef.current({
                  search: inputSearchRef.current.value,
                });
            }}
            inputRef={inputSearchRef}
          />
          <div style={{ width: "100%", height: "auto" }}>
            <DataGridViewReact
              ref={tableRef}
              columns={productColumns}
              height="300px"
              getSelectedItem={(rowItm) => {
                if (rowItm) {
                  setID(rowItm[4]);
                  if (codeRef.current) {
                    codeRef.current.value = rowItm[0];
                  }
                  if (prodcutNameRef.current) {
                    prodcutNameRef.current.value = rowItm[1];
                  }
                  if (quantityRef.current) {
                    quantityRef.current.value = rowItm[2];
                  }
                  if (priceRef.current) {
                    priceRef.current.value = rowItm[3];
                  }
                } else {
                  resetRow();
                  setID(null);
                }
              }}
              onKeyDown={(rowItm, rowIdx, e) => {
                if (e.code === "Delete" || e.code === "Backspace") {
                  const isConfim = window.confirm(
                    `Are you sure you want to delete this row code: ${rowItm[0]}?`
                  );
                  if (isConfim) {
                    const rowID = rowItm[4];
                    mutateDeleteItem({ rowID });
                    return;
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
const ModalCheck = forwardRef(
  ({ handleOnSave, handleOnClose, hasSelectedRow }, ref) => {
    const modalRef = useRef(null);
    const isMoving = useRef(false);
    const offset = useRef({ x: 0, y: 0 });

    const [showModal, setShowModal] = useState(false);
    const [handleDelayClose, setHandleDelayClose] = useState(false);
    const [blick, setBlick] = useState(false);

    const tableRef = useRef(null);
    const searchRef = useRef(null);

    const ORNum = useRef(null);

    const productCodeRef = useRef(null);
    const productNameRef = useRef(null);
    const productQuantityRef = useRef(null);
    const productTotalQuantityStorageRef = useRef(null);
    const productTotalQuantityRef = useRef(null);
    const productPriceRef = useRef(null);
    const productId = useRef(null);
    const productTotalRef = useRef(null);

    const productGrandTotalRef = useRef(null);

    const addTransaction = () => {
      const data = tableRef.current.getData();
      const newData = [
        productCodeRef.current.textContent,
        productNameRef.current.textContent,
        productQuantityRef.current?.value,
        productTotalRef.current.textContent,
        productId.current,
      ];
      const mutateData = [...data, newData];
      tableRef.current.setData(mutateData);

      productGrandTotalRef.current.textContent = mutateData
        .reduce((t, itm) => {
          t += parseFloat(itm[3].toString().replace(/,/g, ""));
          return t;
        }, 0)
        .toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        });
    };
    const closeDelay = () => {
      setHandleDelayClose(true);
      setTimeout(() => {
        setShowModal(false);
        setHandleDelayClose(false);
        handleOnClose();
      }, 100);
    };
    const closeDelayRef = useRef(closeDelay);

    const {
      UpwardTableModalSearch: ProductUpwardTableModalSearch,
      openModal: productOpenModal,
      closeModal: productCloseModal,
    } = useUpwardTableModalSearchSafeMode({
      size: "small",
      link: `${URL}/product-list`,
      column: productColumns,
      getSelectedItem: async (rowItm, _, rowIdx, __) => {
        if (rowItm) {
          productId.current = rowItm[4];
          if (productCodeRef.current) {
            productCodeRef.current.textContent = rowItm[0];
          }
          if (productNameRef.current) {
            productNameRef.current.textContent = rowItm[1];
          }
          if (productQuantityRef.current) {
            productQuantityRef.current.value = "1";
          }

          productTotalQuantityStorageRef.current = rowItm[2]
          productTotalQuantityRef.current.textContent = rowItm[2]
          if (productPriceRef.current) {
            productPriceRef.current.textContent = parseFloat(
              rowItm[3].toString().replace(/,/g, "")
            ).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          }
          if (productTotalRef.current) {
            productTotalRef.current.textContent = parseFloat(
              rowItm[3].toString().replace(/,/g, "")
            ).toLocaleString("en-US", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            });
          }

          productCloseModal();
        }
      },
    });

    useImperativeHandle(ref, () => ({
      showModal: () => {
        setShowModal(true);
      },
      clsoeModal: () => {
        setShowModal(false);
      },
      getRefs: () => {
        const refs = {};
        return refs;
      },
    }));

    useEffect(() => {
      window.addEventListener("keydown", (e) => {
        if (e.key === "Escape") {
          closeDelayRef.current();
        }
      });
    }, []);

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

    return showModal ? (
      <>
        <ProductUpwardTableModalSearch />
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
            height: blick ? "602px" : "600px",
            width: blick ? "80.3%" : "80%",
            border: "1px solid #64748b",
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
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
              cursor: "grab",
            }}
            onMouseDown={handleMouseDown}
          >
            <span style={{ fontSize: "13px", fontWeight: "bold" }}>
              Payment Details
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
                closeDelay();
              }}
            >
              <CloseIcon sx={{ fontSize: "22px" }} />
            </button>
          </div>
          <div
            style={{
              flex: 1,
              background: "#F1F1F1",
              padding: "5px",
              display: "flex",
            }}
          >
            <div
              style={{
                width: "100%",
              }}
            >
              <div style={{ display: "flex", columnGap: "50px" }}>
                <TextInput
                  containerStyle={{
                    width: "50%",
                  }}
                  label={{
                    title: "Search  Product:",
                    style: {
                      fontSize: "12px",
                      fontWeight: "bold",
                      width: "100px",
                    },
                  }}
                  input={{
                    type: "text",
                    style: { width: "calc(100% - 100px) " },
                    onKeyDown: (e) => {
                      if (e.code === "NumpadEnter" || e.code === "Enter") {
                        productOpenModal(e.currentTarget.value);
                      }
                    },
                  }}
                  inputRef={searchRef}
                />
                <div
                  style={{
                    display: "flex",
                    columnGap: "10px",
                  }}
                >
                  <strong>OR No. :</strong>
                  <strong ref={ORNum}></strong>
                </div>
              </div>
              <div
                style={{
                  fontSize: "12px",
                  margin: "10px",
                  display: "flex",
                  flexDirection: "column",
                  rowGap: "7px",
                }}
              >
                <div style={{ display: "flex", columnGap: "10px" }}>
                  <strong>PRODUCT CODE :</strong>
                  <strong ref={productCodeRef}></strong>
                </div>
                <div style={{ display: "flex", columnGap: "10px" }}>
                  <strong>PRODUCT NAME :</strong>
                  <strong ref={productNameRef}></strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    columnGap: "10px",
                  }}
                >
                  <TextInput
                    containerStyle={{
                      width: "220px",
                    }}
                    label={{
                      title: "Quantity :",
                      style: {
                        fontSize: "12px",
                        fontWeight: "bold",
                        width: "120px",
                      },
                    }}
                    input={{
                      defaultValue: "1",
                      type: "number",
                      style: {
                        width: "calc(100% - 120px) ",
                        textAlign: "right",
                      },
                      onFocus: (e) => {
                        productQuantityRef.current?.select();
                      },
                      onChange: (e) => {
                        let input = parseInt(e.currentTarget.value);
                        let inputTotalQuantity = parseInt(
                          productTotalQuantityStorageRef.current
                        );
                        let price = parseFloat(
                          productPriceRef.current.textContent
                            .toString()
                            .replace(/,/g, "")
                        );
                        if (input > inputTotalQuantity) {
                          e.currentTarget.value = '1'
                          return alert("Invalid Quantity");
                        }
                    
                        productTotalQuantityRef.current.textContent =  inputTotalQuantity - input
                        if (productTotalRef.current) {
                          productTotalRef.current.textContent = (
                            price * input
                          ).toLocaleString("en-US", {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          });
                        }
                      },
                    }}
                    inputRef={productQuantityRef}
                  />
                  <span> ---           Total Stock:</span>
                  <strong ref={productTotalQuantityRef}></strong>
                </div>
                <div style={{ display: "flex", columnGap: "10px" }}>
                  <strong>PRICE :</strong>
                  <strong ref={productPriceRef}></strong>
                </div>
                <div style={{ display: "flex", columnGap: "10px" }}>
                  <strong>TOTAL :</strong>
                  <strong ref={productTotalRef}></strong>
                </div>
                <button
                  style={{
                    background: "#4bc96c",
                    cursor: "pointer",
                    width: "150px",
                  }}
                  onClick={addTransaction}
                >
                  Add Transaction
                </button>
              </div>
              <div style={{ width: "100%", height: "auto" }}>
                <DataGridViewReact
                  ref={tableRef}
                  columns={productColumns}
                  height="300px"
                  getSelectedItem={(rowItm) => {}}
                  onKeyDown={(rowItm, rowIdx, e) => {
                    if (e.code === "Delete" || e.code === "Backspace") {
                      const isConfim = window.confirm(
                        `Are you sure you want to delete this row code: ${rowItm[0]}?`
                      );
                      if (isConfim) {
                        const rowID = rowItm[4];
                        // mutateDeleteItem({ rowID });
                        return;
                      }
                    }
                  }}
                />
              </div>
              <div
                style={{ display: "flex", columnGap: "10px", marginTop: "5px" }}
              >
                <strong style={{ color: "gray" }}>GRAND TOTAL :</strong>
                <strong ref={productGrandTotalRef}></strong>
              </div>
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  columnGap: "10px",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  style={{
                    background: "#4bc96c",
                    cursor: "pointer",
                    width: "150px",
                  }}
                >
                  Save
                </button>
                <button
                  style={{
                    background: "red",
                    cursor: "pointer",
                    width: "150px",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
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
      </>
    ) : null;
  }
);

export default App;
