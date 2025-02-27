const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const { format } = require("date-fns");
const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: ["http://localhost:3000"],
  })
);

// Function to generate a random alphanumeric code
function generateUniqueCode(length = 8) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < length; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Function to generate and ensure a unique ProductCode
async function generateAndStoreUniqueCode() {
  let isUnique = false;
  let newCode;

  while (!isUnique) {
    newCode = generateUniqueCode(); // Generate a random code

    // Check if the code already exists in the database
    const existingProduct = await prisma.$queryRawUnsafe(
      `select * from  products where ProductCode = ?`,
      newCode
    );

    if (existingProduct.length <= 0) {
      isUnique = true;
    }
  }

  return newCode;
}

// generate code
app.post("/generate-code", async (req, res) => {
  try {
    const uniqueCode = await generateAndStoreUniqueCode();
    res.send({
      message: "Update Item Successfully",
      success: true,
      uniqueCode,
    });
  } catch (error) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      uniqueCode: "",
    });
  }
});

// Update Product
app.post("/update-product", async (req, res) => {
  try {
    await prisma.$queryRawUnsafe(
      `delete FROM products where id = ?`,
      req.body.id
    );
    await prisma.$queryRawUnsafe(
      `delete FROM journal where id = ?`,
      req.body.id
    );

    req.body.quantity = parseInt(req.body.quantity);
    req.body.price = parseInt(req.body.price.toString().replace(/,/g, ""));
    await prisma.products.create({ data: req.body });

    const data = await prisma.$queryRawUnsafe(
      `SELECT * FROM products a 
      WHERE 
         a.ProductName LIKE ? 
         OR a.ProductCode LIKE ? 
         OR a.quantity LIKE ? 
         OR a.price LIKE ?`,
      `%%`,
      `%%`,
      `%%`,
      `%%`
    );

    await prisma.journal.create({
      data: {
        ProductCode: req.body.ProductCode,
        ProductID: "",
        ProductName: req.body.ProductName,
        quantity: req.body.quantity,
        credit: "0.00",
        debit: req.body.price,
      },
    });

    res.send({
      message: "Update Item Successfully",
      success: true,
      data,
    });
  } catch (error) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      data,
    });
  }
});
// Add Product
app.post("/add-product", async (req, res) => {
  try {
    const existingProduct = await prisma.$queryRawUnsafe(
      `select * from  products where ProductCode = ?`,
      req.body.ProductCode
    );

    if (existingProduct.length > 0) {
      const data = await prisma.$queryRawUnsafe(
        `SELECT * FROM products a 
        WHERE 
           a.ProductName LIKE ? 
           OR a.ProductCode LIKE ? 
           OR a.quantity LIKE ? 
           OR a.price LIKE ?`,
        `%%`,
        `%%`,
        `%%`,
        `%%`
      );

      return res.send({
        message: `Product Code is Already Exist.`,
        success: false,
        data,
      });
    }

    req.body.quantity = parseInt(req.body.quantity);
    req.body.price = parseInt(req.body.price.toString().replace(/,/g, ""));
    await prisma.products.create({ data: req.body });

    setTimeout(async () => {
      const getLastID = await prisma.$queryRawUnsafe(
        "SELECT id FROM products a order by a.id limit 1"
      );

      await prisma.journal.create({
        data: {
          ProductCode: req.body.ProductCode,
          ProductID: `${getLastID[0].id}`,
          ProductName: req.body.ProductName,
          quantity: req.body.quantity,
          credit: "0.00",
          debit: req.body.price,
        },
      });

      const data = await prisma.$queryRawUnsafe(
        `SELECT * FROM products a 
        WHERE 
           a.ProductName LIKE ? 
           OR a.ProductCode LIKE ? 
           OR a.quantity LIKE ? 
           OR a.price LIKE ?`,
        `%%`,
        `%%`,
        `%%`,
        `%%`
      );

      res.send({
        message: "Add Item Successfully",
        success: true,
        data,
      });
    }, 250);
  } catch (error) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      data,
    });
  }
});

app.post("/delete", async (req, res) => {
  try {
    await prisma.$queryRawUnsafe(
      `delete FROM products where id = ?`,
      req.body.rowID
    );

    const data = await prisma.$queryRawUnsafe(
      `SELECT * FROM products a 
      WHERE 
         a.ProductName LIKE ? 
         OR a.ProductCode LIKE ? 
         OR a.quantity LIKE ? 
         OR a.price LIKE ?`,
      `%%`,
      `%%`,
      `%%`,
      `%%`
    );

    res.send({
      message: "Add Item Successfully",
      success: true,
      data,
    });
  } catch (error) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      data,
    });
  }
});
//  Product Lsit
app.post("/product-list", async (req, res) => {
  try {
    const data = await prisma.$queryRawUnsafe(
      `SELECT * FROM products a 
    WHERE 
       a.ProductName LIKE ? 
       OR a.ProductCode LIKE ? 
       OR a.quantity LIKE ? 
       OR a.price LIKE ?`,
      `%${req.body.search}%`,
      `%${req.body.search}%`,
      `%${req.body.search}%`,
      `%${req.body.search}%`
    );
    res.send({
      message: "Add Item Successfully",
      success: true,
      data,
    });
  } catch (error) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      data: [],
    });
  }
});

app.post("/generate-orno", async (req, res) => {
  try {
    const rows = await prisma.$queryRawUnsafe(`
      SELECT 
          lpad(CAST(SUBSTRING_INDEX(ORNum, '.', - 1) AS UNSIGNED) + 1 ,4 ,'0') AS ORNo
      FROM
          Collection
          group by ORNum
          order by ORNum desc
          limit 1 
  `);

    let NewRefCode = rows.length > 0 ? rows[0].ORNo : "0001";

    res.send({
      message: "Generate OR Successfully",
      success: true,
      data: `${format(new Date(), "yyMM")}.${NewRefCode}`,
    });
  } catch (error) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      data: [],
    });
  }
});
app.post("/save-orno", async (req, res) => {
  try {
    const orlist = await prisma.$queryRawUnsafe(`select * from collection where ORNum = '${req.body.ORNum}'`)
    if(orlist.length > 0){
      return  res.send({
        message: `OR No. ${req.body.ORNum} is already exist`,
        success: true,
        data,
      });
    }
    const list = req.body.data;

    for (const itm of list) {
      await prisma.collection.create({
        data:{
          ORNum:req.body.ORNum,
          ProductCode:itm[0],
          ProductName:itm[1],
          ProductID:`${itm[4]}`,
          quantity:parseInt(itm[2]),
          TotalPrice:parseFloat(itm[3].replace(/,/g,''))
        }
      })

      await prisma.journal.create({
        data: {
          ProductCode: itm[0],
          ProductID: req.body.ORNum,
          ProductName: itm[1],
          quantity: parseInt(itm[2]),
          credit: "0.00",
          debit: parseFloat(itm[3].replace(/,/g,'')),
        },
      });

      await prisma.$queryRawUnsafe(`update  products a set  quantity = ${itm[5] - parseInt(itm[2])} where id = ${itm[4]}`)



    }

    const data = await prisma.$queryRawUnsafe(
      `SELECT * FROM products a 
      WHERE 
         a.ProductName LIKE ? 
         OR a.ProductCode LIKE ? 
         OR a.quantity LIKE ? 
         OR a.price LIKE ?`,
      `%%`,
      `%%`,
      `%%`,
      `%%`
    );

    res.send({
      message: "Add Item Successfully",
      success: true,
      data,
    });
  } catch (error) {
    console.log(error.message);
    res.send({
      message: `We're experiencing a server issue. Please try again in a few minutes. If the issue continues, report it to IT with the details of what you were doing at the time.`,
      success: false,
      data: [],
    });
  }
});

// Start Server
const PORT = process.env.PORT || 2125;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
