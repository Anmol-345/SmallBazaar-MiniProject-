const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mysql = require("mysql2");

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

// ✅ Parse DATABASE_URL
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("❌ DATABASE_URL not found in environment variables");
  process.exit(1);
}

const parsed = new URL(dbUrl);

// ✅ MySQL Pool
const pool = mysql.createPool({
  host: parsed.hostname,
  user: parsed.username,
  password: parsed.password,
  database: parsed.pathname.replace("/", ""),
  port: parsed.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Helper to query using pool
const query = (sql, params) =>
  new Promise((resolve, reject) => {
    pool.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });

// 🩺 Health Check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running 🚀" });
});

// 🧠 Test DB
app.get("/test-db", async (req, res) => {
  try {
    const result = await query("SELECT NOW() AS time");
    res.json({ success: true, result });
  } catch (err) {
    console.error("❌ DB test failed:", err);
    res.status(500).json({ success: false, error: err });
  }
});

// 🚀 Execute arbitrary query (optional, be careful)
app.post("/execute-query", async (req, res) => {
  const { query: sql } = req.body;
  if (!sql) return res.status(400).json({ message: "Query is required" });

  const forbidden = ["DROP", "DELETE", "TRUNCATE", "ALTER"];
  for (let cmd of forbidden) {
    if (sql.toUpperCase().includes(cmd))
      return res.status(403).json({ message: `Forbidden command detected: ${cmd}` });
  }

  try {
    const result = await query(sql);
    res.json({ success: true, result });
  } catch (err) {
    console.error("Query execution error:", err);
    res.status(500).json({ message: "Query failed", error: err });
  }
});

// 🛍️ Product Routes
app.post("/products/add", async (req, res) => {
  const { name, description, price, status = "Active", stock } = req.body;
  if (!name || !description || price === undefined || stock === undefined)
    return res.status(400).json({ message: "All fields are required." });

  try {
    const result = await query(
      "INSERT INTO products (name, description, price, status, stock) VALUES (?, ?, ?, ?, ?)",
      [name, description, price, status, stock]
    );
    res.status(201).json({ message: "✅ Product added", id: result.insertId });
  } catch (err) {
    console.error("❌ Error adding product:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

app.get("/products/all", async (req, res) => {
  try {
    const results = await query("SELECT * FROM products");
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

app.put("/products/status", async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ message: "Product ID required" });

  try {
    await query(
      `UPDATE products
       SET status = CASE WHEN status='active' THEN 'inactive' ELSE 'active' END
       WHERE id=?`,
      [id]
    );
    res.json({ message: "Product status toggled", productId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

app.put("/products/update", async (req, res) => {
  const { id, price, stock } = req.body;
  if (!id) return res.status(400).json({ message: "Product ID required" });

  try {
    await query(
      `UPDATE products SET price=?, stock=? WHERE id=?`,
      [price, stock, id]
    );
    res.json({ message: "Product updated", productId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

// 🧾 Order Routes
app.get("/orders/all", async (req, res) => {
  try {
    const results = await query("SELECT * FROM orders");
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

app.post("/orders/place", async (req, res) => {
  const {
    items,
    customer_name,
    customer_address,
    customer_contact,
    modeOfPayment,
    status,
    total_amount,
  } = req.body;

  if (!items || !customer_name)
    return res.status(400).json({ message: "Missing required fields." });

  try {
    const result = await query(
      `INSERT INTO orders 
       (items, customer_name, customer_address, customer_contact, modeOfPayment, status, total_amount)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [items, customer_name, customer_address, customer_contact, modeOfPayment, status, total_amount]
    );
    res.json({ message: "✅ Order added", orderId: result.insertId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to place order", error: err });
  }
});

app.put("/orders/update", async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ message: "Order ID required" });

  try {
    await query(
      `UPDATE orders
       SET status = CASE WHEN status='InProcess' THEN 'Delivered' ELSE 'InProcess' END
       WHERE id=?`,
      [id]
    );
    res.json({ message: "Order status toggled", orderId: id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

// 🚀 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
