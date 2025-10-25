const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mysql = require("mysql2/promise"); // use promise version for async/await
const url = require("url");

dotenv.config();
const app = express();
app.use(express.json());

// ✅ CORS setup - allow your frontends
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:9000",
      "https://small-bazaar-mini-project-4vja.vercel.app", // admin frontend
      "https://small-bazaar-mini-project-wskh.vercel.app", // main frontend
    ],
    credentials: true,
  })
);

// ✅ Parse and connect to Railway MySQL using a pool
const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error("❌ DATABASE_URL not found in env");
  process.exit(1);
}

const params = url.parse(dbUrl);
const [user, password] = params.auth.split(":");

const pool = mysql.createPool({
  host: params.hostname,
  user,
  password,
  database: params.pathname.replace("/", ""),
  port: params.port,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// 🩺 Health Check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running fine 🚀" });
});

// 🧠 Test DB connection
app.get("/test-db", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT NOW() AS time");
    res.json({ success: true, message: "✅ Database connected!", result: rows });
  } catch (err) {
    console.error("❌ Database test failed:", err);
    res.status(500).json({ success: false, error: err });
  }
});

// Execute arbitrary query endpoint
app.post("/execute-query", async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ message: "Query is required" });

  const forbidden = ["DROP", "DELETE", "TRUNCATE", "ALTER"];
  for (let cmd of forbidden) {
    if (query.toUpperCase().includes(cmd))
      return res.status(403).json({ message: `Forbidden command: ${cmd}` });
  }

  try {
    const [result] = await pool.query(query);
    res.json({ success: true, result });
  } catch (err) {
    console.error("Query execution error:", err);
    res.status(500).json({ message: "Query execution failed", error: err });
  }
});

// 🛍️ Product Routes
app.post("/products/add", async (req, res) => {
  const { name, description, price, status, stock } = req.body;
  if (!name || !description || !price || stock === undefined)
    return res.status(400).json({ message: "All fields are required" });

  const sql =
    "INSERT INTO products (name, description, price, status, stock) VALUES (?, ?, ?, ?, ?)";
  const values = [name, description, price, status || "Active", stock];

  try {
    const [result] = await pool.query(sql, values);
    res.status(201).json({ message: "✅ Product added successfully!", id: result.insertId });
  } catch (err) {
    console.error("❌ Error inserting product:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

app.get("/products/all", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM products");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

app.put("/products/status", async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ message: "Product ID required" });

  const query = `
    UPDATE products
    SET status = CASE WHEN status = 'active' THEN 'inactive' ELSE 'active' END
    WHERE id = ?;
  `;
  try {
    await pool.query(query, [id]);
    res.json({ message: "Product status toggled", productId: id });
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err });
  }
});

app.put("/products/update", async (req, res) => {
  const { id, stock, price } = req.body;
  if (!id) return res.status(400).json({ message: "Product ID required" });

  const query = "UPDATE products SET price = ?, stock = ? WHERE id = ?";
  try {
    await pool.query(query, [price, stock, id]);
    res.json({ message: "Product updated", productId: id });
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err });
  }
});

// 🧾 Order Routes
app.get("/orders/all", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM orders");
    res.json(rows);
  } catch (err) {
    console.error("❌ Error fetching orders:", err);
    res.status(500).json({ message: "Database error", error: err });
  }
});

app.post("/orders/place", async (req, res) => {
  const { items, customer_name, customer_address, customer_contact, modeOfPayment, status, total_amount } = req.body;
  if (!items || !customer_name) return res.status(400).json({ message: "Missing required fields" });

  const query = `
    INSERT INTO orders
    (items, customer_name, customer_address, customer_contact, modeOfPayment, status, total_amount)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  try {
    const [result] = await pool.query(query, [
      items,
      customer_name,
      customer_address,
      customer_contact,
      modeOfPayment,
      status,
      total_amount,
    ]);
    res.json({ message: "✅ Order added successfully", orderId: result.insertId, order: req.body });
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err });
  }
});

app.put("/orders/update", async (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ message: "Order ID required" });

  const query = `
    UPDATE orders
    SET status = CASE WHEN status = 'InProcess' THEN 'Delivered' ELSE 'InProcess' END
    WHERE id = ?;
  `;
  try {
    await pool.query(query, [id]);
    res.json({ message: "Order status toggled", orderId: id });
  } catch (err) {
    res.status(500).json({ message: "Database error", error: err });
  }
});

// 🚀 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
