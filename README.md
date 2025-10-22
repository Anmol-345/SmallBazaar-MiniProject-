# SmallBazaar 🛒

SmallBazaar is a full-stack inventory and e-commerce management system.  
It includes **Admin dashboards** to manage products and orders, **Sales analytics**, and a **Customer-facing store** with cart and payment functionality.

---

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [Project Structure](#project-structure)
- [Backend Setup](#backend-setup)
- [Admin Frontend Setup](#admin-frontend-setup)
- [Store Frontend Setup](#store-frontend-setup)
- [Usage](#usage)
- [Author](#author)

---

## Features

### Admin Dashboard
- View all orders and toggle status (`InProcess` ↔ `Delivered`).
- View all products, update stock and price.
- Create new products.
- Admin Sales Page with:
  - Total Orders & Total Sales summary.
  - Product-wise sales table.
  - Filter orders by **Status** and **Payment Mode**.

### Store Frontend
- Browse all **active products**.
- Adjust quantity and add to cart.
- View and edit cart in **offcanvas sidebar**.
- Proceed to payment with:
  - Customer details (Name, Address, Contact)
  - Payment mode selection (Razorpay / Cash on Delivery)
- Place orders which are sent to backend and stored in **MySQL**.

---

## Technologies Used
- **Backend:** Node.js, Express.js, MySQL  
- **Frontend:** Next.js (React), Bootstrap, Tailwind CSS, ShadeCN components  
- **Others:** Axios for API calls, CORS for cross-origin support  

---

## Project Structure

```
SmallBazaar/
├── Backend
│   ├── index.js           # Express server
│   ├── package.json
│   └── .gitignore
└── Frontend
    ├── Admin
    │   ├── app
    │   │   ├── orders/page.js
    │   │   ├── products/page.js
    │   │   └── page.js      # Sales Page
    │   └── components       # Reusable UI components
    └── store
        ├── app/page.js       # Customer store page
        └── public            # Images & icons
```

---

## Backend Setup

1. Navigate to the backend folder:
   ```bash
   cd Backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure MySQL:
   - Ensure MySQL is running.
   - Update credentials in `index.js`:
     ```javascript
     let con = mysql.createConnection({
         host: "localhost",
         user: "root",
         password: "yourpassword"
     });
     ```
   - Ensure database `inventory` exists with tables `products` and `orders`.
4. Start the server:
   ```bash
   node index.js
   ```
   Server runs on **http://localhost:5000**

---

## Admin Frontend Setup

1. Navigate to admin frontend:
   ```bash
   cd Frontend/Admin
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   App store runs on **http://localhost:9000**

---

## Store Frontend Setup

1. Navigate to store frontend:
   ```bash
   cd Frontend/store
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   App admin runs on **http://localhost:3000**

---

## Usage

### Admin
- Open **Admin Dashboard** at `http://localhost:9000`
- Manage products:
  - Toggle status
  - Update stock/price
  - Add new products
- View orders:
  - Toggle order status
  - Filter orders
- Sales analytics page shows total orders, total sales, and product-wise sales.

### Customer Store
- Open **Store** at `http://localhost:3000`
- Browse active products, select quantity, and add to cart.
- Open cart sidebar to update quantities or remove items.
- Proceed to payment:
  - Fill customer details
  - Select payment mode
  - Click **Buy** to place order
- Orders are sent to backend and stored in MySQL.

---

## Author

- **Name:** Anmol Sinha  
- **GitHub:** [Anmol-345](https://github.com/Anmol-345)  
- **X (Twitter):** [@AnmolSinha2103](https://x.com/AnmolSinha2103)  

---

*SmallBazaar is a personal project demonstrating a full-stack inventory & e-commerce app with modern frontend and backend integration.*
