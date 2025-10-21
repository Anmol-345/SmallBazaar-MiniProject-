"use client";

import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import axios from "axios";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [activeProducts, setActiveProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [quantities, setQuantities] = useState({}); 

  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [customerContact, setCustomerContact] = useState("");

  const [paymentMode, setPaymentMode] = useState("Razorpay");


  const toggleCart = () => setShowCart(!showCart);


  const handleQtyChange = (id, value) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: value < 1 ? 1 : value,
    }));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5000/products/all");
      setProducts(res.data);
      setActiveProducts(res.data.filter((p) => p.status === "Active"));
    } catch (err) {
      console.error(err);
    }
  };

  // Update cart item quantity
  const updateQty = (index, qty) => {
    const newCart = [...cart];
    newCart[index].qty = qty;
    newCart[index].amount = qty * newCart[index].unit_price;
    setCart(newCart);
  };

  // Remove item from cart
  const removeItem = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  // Add item to cart
  const addToCart = (product, qty) => {
    const existingIndex = cart.findIndex(item => item.product_name === product.name);
    if (existingIndex !== -1) {
      const newCart = [...cart];
      newCart[existingIndex].qty += qty;
      newCart[existingIndex].amount = newCart[existingIndex].qty * newCart[existingIndex].unit_price;
      setCart(newCart);
    } else {
      setCart((prev) => [
        ...prev,
        {
          product_name: product.name,
          unit_price: product.price,
          qty: qty,
          amount: qty * product.price,
        }
      ]);
    }
    handleQtyChange(product.id, 1); // reset quantity
  };

  // Proceed to payment
  const proceedToCheckout = () => {
    setShowPayment(true);
  };

  const proceed = () => {
    let order = {
      customer_name: customerName,
      customer_address: customerAddress,
      customer_contact: customerContact,
      items: JSON.stringify(cart),
      total_amount: cart.reduce((sum, item) => sum + item.amount, 0),
      modeOfPayment: paymentMode,
      status:"InProcess"
    }
    
    axios.post("http://localhost:5000/orders/place", order)
      .then((res) => {
        alert("Order placed successfully!");
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to place order.");
      });

  }

  const closePayment = () => setShowPayment(false);

  // Cart body (reusable)
  const CartBody = (
    <div className="d-flex flex-column justify-content-between" style={{ height: 'calc(100% - 56px)' }}>
      {cart.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <ul className="list-group mb-3 overflow-auto flex-grow-1">
          {cart.map((item, index) => (
            <li key={index} className="list-group-item d-flex align-items-center justify-content-between">
              <div className="flex-grow-1">
                <strong>{item.product_name}</strong>
                <div className="d-flex align-items-center mt-1">
                  <span className="me-2">${item.unit_price}</span>
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    className="form-control form-control-sm me-2"
                    style={{ width: "60px" }}
                    onChange={(e) => updateQty(index, parseInt(e.target.value))}
                  />
                  <span className="fw-bold">${item.amount}</span>
                </div>
              </div>
              <button className="btn btn-sm btn-danger ms-2" onClick={() => removeItem(index)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {cart.length > 0 && (
        <div className="d-flex justify-content-between align-items-center mt-auto pt-2 border-top">
          <strong>Total: ${cart.reduce((sum, item) => sum + item.amount, 0)}</strong>
          <button className="btn btn-primary" onClick={proceedToCheckout}>Proceed</button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Navbar */}
      <nav className="navbar navbar-dark bg-dark">
        <div className="container-fluid">
          <h2 style={{ color: "white" }}>SmallBazaar</h2>
          <button className="btn btn-outline-light" onClick={toggleCart}>
            View Cart ({cart.length})
          </button>
        </div>
      </nav>

      {/* Offcanvas Cart */}
      <div className={`offcanvas offcanvas-end ${showCart ? "show" : ""}`} style={{ visibility: showCart ? "visible" : "hidden" }}>
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">Your Cart</h5>
          <button type="button" className="btn-close text-reset" onClick={toggleCart}></button>
        </div>
        {CartBody}
      </div>
      {showCart && <div className="offcanvas-backdrop fade show" onClick={toggleCart}></div>}

      {/* Payment Modal */}
      {showPayment && (
  <>
    <div className="modal fade show" style={{ display: "block" }} tabIndex="-1" role="dialog" aria-modal="true">
      <div className="modal-dialog modal-dialog-scrollable">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Payment</h5>
            <button type="button" className="btn-close" onClick={closePayment}></button>
          </div>
          <div className="modal-body">
            <p>Total Amount: ${cart.reduce((sum, item) => sum + item.amount, 0)}</p>

            <div className="mb-3">
              <label className="form-label">Name</label>
              <input type="text" className="form-control" onChange={(e)=>setCustomerName(e.target.value)} />
            </div>

            <div className="mb-3">
              <label className="form-label">Address</label>
              <input type="text" className="form-control" onChange={(e)=>setCustomerAddress(e.target.value)} />
            </div>

            <div className="mb-3">
              <label className="form-label">Contact</label>
              <input type="tel" className="form-control" onChange={(e)=>setCustomerContact(e.target.value)} />
            </div>

            <label className="form-label">Mode of payment</label>
            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="radioDefault"
                id="radioDefault1"
                checked={paymentMode === "Razorpay"}
                onChange={() => setPaymentMode("Razorpay")}
              />
              <label className="form-check-label" htmlFor="radioDefault1">Razorpay</label>
            </div>

            <div className="form-check">
              <input
                className="form-check-input"
                type="radio"
                name="radioDefault"
                id="radioDefault2"
                checked={paymentMode === "Cod"}
                onChange={() => setPaymentMode("Cod")}
              />
              <label className="form-check-label" htmlFor="radioDefault2">Cash on delivery</label>
            </div>
          </div>

          <div className="modal-footer">
            <button className="btn btn-secondary" onClick={closePayment}>Cancel</button>
            <button className="btn btn-success" onClick={() => { closePayment(); setCart([]); proceed(); }}>Buy</button>
          </div>
        </div>
      </div>
    </div>
    <div className="modal-backdrop fade show" onClick={closePayment}></div>
  </>
)}


      {/* Products Section */}
      <div className="container my-4 p-3 border rounded">
        <h1>Welcome to SmallBazaar!</h1>
        <p>Your one-stop shop for all your needs.</p>
      </div>

      <div className="container">
        <hr />
        <div className="row">
          {activeProducts.map((product) => {
            const qty = quantities[product.id] || 1;
            return (
              <div key={product.id} className="col-md-4 mb-4">
                <div className="card" style={{ width: "100%" }}>
                  <img
                    src={`https://dummyimage.com/400x300/000/fff&text=${product.name.split(" ").join("+")}`}
                    className="card-img-top"
                    alt={product.name}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{product.name}</h5>
                    <p className="card-text">{product.description}</p>
                    <p className="card-text"><strong>Price: ${product.price}</strong></p>
                    <div className="d-flex align-items-center mb-2">
                      <button className="btn btn-secondary btn-sm" onClick={() => handleQtyChange(product.id, qty - 1)}>-</button>
                      <span className="mx-2">{qty}</span>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleQtyChange(product.id, qty + 1)}>+</button>
                    </div>

                    <button className="btn btn-primary" onClick={() => addToCart(product, qty)}>Add to Cart</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
