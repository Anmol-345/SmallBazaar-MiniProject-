const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mysql = require("mysql2");
const url = require("url");

dotenv.config();

const app = express();
app.use(express.json());

// ✅ CORS setup
app.use(
  cors({
    origin: ["http://localhost:9000", "http://localhost:3000"],
    credentials: true,
  })
);

// ✅ Parse and connect to Railway MySQL
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("❌ DATABASE_URL not found in .env");
  process.exit(1);
}

const params = url.parse(dbUrl);
const [user, password] = params.auth.split(":");

const con = mysql.createConnection({
  host: params.hostname,
  user: user,
  password: password,
  database: params.pathname.replace("/", ""),
  port: params.port,
});

con.connect((err) => {
  if (err) {
    console.error("❌ Database connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL on Railway!");
  }
});

// 🩺 Health Check Endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running fine 🚀" });
});

// 🧠 Test DB Connection
app.get("/test-db", (req, res) => {
  con.query("SELECT NOW() AS time", (err, result) => {
    if (err) {
      console.error("❌ Database test failed:", err);
      res.status(500).json({ success: false, error: "Database connection failed" });
    } else {
      res.json({ success: true, message: "✅ Database connected!", result });
    }
  });
});

// Endpoint to execute arbitrary SQL queries (use carefully)
app.post("/execute-query", (req, res) => {
    const { query } = req.body;
  
    if (!query) {
      return res.status(400).json({ message: "Query is required in req.body" });
    }
  
    // Optional: restrict dangerous commands (DROP, DELETE without WHERE, etc.)
    const forbidden = ["DROP", "DELETE", "TRUNCATE", "ALTER"];
    for (let cmd of forbidden) {
      if (query.toUpperCase().includes(cmd)) {
        return res.status(403).json({ message: `Forbidden command detected: ${cmd}` });
      }
    }
  
    con.query(query, (err, result) => {
      if (err) {
        console.error("Query execution error:", err);
        return res.status(500).json({ message: "Query execution failed", error: err });
      }
      res.json({ success: true, result });
    });
  });
  


// 🛍️ Product Routes
app.post("/products/add", (req, res) => {
  const { name, description, price, status, stock } = req.body;

  if (!name || !description || !price || stock === undefined) {
    return res.status(400).json({ message: "All fields are required." });
  }

  const sql =
    "INSERT INTO products (name, description, price, status, stock) VALUES (?, ?, ?, ?, ?)";
  const values = [name, description, price, status || "Active", stock];

  con.query(sql, values, (err, result) => {
    if (err) {
      console.error("❌ Error inserting product:", err);
      return res.status(500).json({ message: "Database error." });
    }
    res.status(201).json({ message: "✅ Product added successfully!", id: result.insertId });
  });
});

app.get("/products/all", (req, res) => {
  const query = "SELECT * FROM products;";
  con.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching products:", err);
      return res.status(500).json({ message: "Database error." });
    }
    res.json(result);
  });
});

app.put("/products/status", (req, res) => {
  const id = req.body.id;
  if (!id) return res.status(400).json({ message: "Product ID required." });

  const query = `
    UPDATE products
    SET status = CASE 
                    WHEN status = 'active' THEN 'inactive'
                    ELSE 'active'
                 END
    WHERE id = ?;
  `;
  con.query(query, [id], (err) => {
    if (err) return res.status(500).json({ message: "Database error." });
    res.json({ message: "Product status toggled", productId: id });
  });
});

app.put("/products/update", (req, res) => {
  const { id, stock, price } = req.body;
  if (!id) return res.status(400).json({ message: "Product ID required." });

  const query = `
    UPDATE products
    SET price = ?, 
        stock = ?
    WHERE id = ?;
  `;
  con.query(query, [price, stock, id], (err) => {
    if (err) return res.status(500).json({ message: "Database error." });
    res.json({ message: "Product updated", productId: id });
  });
});

// 🧾 Order Routes
app.get("/orders/all", (req, res) => {
  const query = "SELECT * FROM orders;";
  con.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching orders:", err);
      return res.status(500).json({ message: "Database error." });
    }
    res.json(result);
  });
});

app.post("/orders/place", (req, res) => {
  const {
    items,
    customer_name,
    customer_address,
    customer_contact,
    modeOfPayment,
    status,
    total_amount,
  } = req.body;

  if (!items || !customer_name) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const query = `
    INSERT INTO orders 
    (items, customer_name, customer_address, customer_contact, modeOfPayment, status, total_amount)
    VALUES (?, ?, ?, ?, ?, ?, ?);
  `;

  con.query(
    query,
    [items, customer_name, customer_address, customer_contact, modeOfPayment, status, total_amount],
    (err, result) => {
      if (err) {
        console.error("Insert failed:", err);
        return res.status(500).json({ message: "Failed to place order", error: err });
      }
      res.json({
        message: "✅ Order added successfully",
        orderId: result.insertId,
        order: req.body,
      });
    }
  );
});

app.put("/orders/update", (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ message: "Order ID required." });

  const query = `
    UPDATE orders
    SET status = CASE 
                    WHEN status = 'InProcess' THEN 'Delivered'
                    ELSE 'InProcess'
                 END
    WHERE id = ?;
  `;
  con.query(query, [id], (err) => {
    if (err) return res.status(500).json({ message: "Database error." });
    res.json({ message: "Order status toggled", orderId: id });
  });
});

// 🚀 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
