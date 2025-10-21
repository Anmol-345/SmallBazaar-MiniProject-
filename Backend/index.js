const express = require("express");
const app = express();
const cors = require("cors")
const mysql = require("mysql")

const PORT = 5000

app.use(cors({
    origin: ["http://localhost:9000", "http://localhost:3000"],
    credentials: true,
  }));

// Middleware to parse JSON
app.use(express.json());

let con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "anmol123"
  });

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });

//Switching to main database
con.query("USE inventory");

//Product Routes

app.get("/products/all",(req,res)=>{
    query = "SELECT * FROM products;"
    con.query(query,(err,result)=>{
        res.json(result)
    })
})

app.put("/products/status",(req,res)=>{
    let id = req.body.id
    const query = `
    UPDATE products
    SET status = CASE 
                    WHEN status = 'active' THEN 'inactive'
                    ELSE 'active'
                 END
    WHERE id = ${Number(id)};
    `;
    con.query(query,()=>{

        res.json({ message: "Product status toggled", productId: id });
    })
})

app.put("/products/update",(req,res)=>{
    let stock = req.body.stock
    let price = req.body.price
    let id = req.body.id
    
    let query = `
        UPDATE products
        SET price = ${Number(price)}, 
            stock = ${Number(stock)}
        WHERE id = ${Number(id)};`
    con.query(query,()=>{
            res.json({ message: "Product updated", productId: id });
    })
})

app.post("/products/create",(req,res)=>{
    let name = req.body.name
    let price = req.body.price 
    let stock = req.body.stock

    let query = `INSERT INTO products(name,price,stock) VALUE('${name}',${price},${stock})`
    con.query(query,()=>{
        res.json({message:"Product created",product:{name:name,price:price,stock:stock}})
    })

})

//Order Routes

app.get("/orders/all",(req,res)=>{
    let query = "SELECT * FROM orders;"
    con.query(query,(err,result)=>{
        res.json(result)
    })
})

app.post("/orders/place", (req, res) => {
    const {
        items,
        customer_name,
        customer_address,
        customer_contact,
        modeOfPayment,
        status,
        total_amount
    } = req.body;

    const query = `
        INSERT INTO orders 
        (items, customer_name, customer_address, customer_contact, modeOfPayment, status,total_amount)
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
                message: "Order added successfully",
                orderId: result.insertId,
                order: req.body
            });
        }
    );
});


app.put("/orders/update",(req,res)=>{
    let id = req.body.id
    const query = `
    UPDATE orders
    SET status = CASE 
                    WHEN status = 'InProcess' THEN 'Delivered'
                    ELSE 'InProcess'
                 END
    WHERE id = ${Number(id)};
    `;
    con.query(query,()=>{

        res.json({ message: "Product status toggled", productId: id });
})
})

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });

