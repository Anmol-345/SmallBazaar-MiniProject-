"use client";

import "bootstrap/dist/css/bootstrap.min.css";
import { useState, useEffect } from "react";
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

  const updateQty = (index, qty) => {
    const newCart = [...cart];
    newCart[index].qty = qty;
    newCart[index].amount = qty * newCart[index].unit_price;
    setCart(newCart);
  };

  const removeItem = (index) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const addToCart = (product, qty) => {
    const existingIndex = cart.findIndex(
      (item) => item.product_name === product.name
    );
    if (existingIndex !== -1) {
      const newCart = [...cart];
      newCart[existingIndex].qty += qty;
      newCart[existingIndex].amount =
        newCart[existingIndex].qty * newCart[existingIndex].unit_price;
      setCart(newCart);
    } else {
      setCart((prev) => [
        ...prev,
        {
          product_name: product.name,
          unit_price: product.price,
          qty: qty,
          amount: qty * product.price,
        },
      ]);
    }
    handleQtyChange(product.id, 1);
  };

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
      status: "InProcess",
    };

    axios
      .post("http://localhost:5000/orders/place", order)
      .then(() => {
        alert("Order placed successfully!");
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to place order.");
      });
  };

  const closePayment = () => setShowPayment(false);

  const CartBody = (
    <div
      className="d-flex flex-column justify-content-between p-3"
      style={{ height: "calc(100% - 56px)" }}
    >
      {cart.length === 0 ? (
        <p className="text-center text-muted mt-4">Your cart is empty 🛒</p>
      ) : (
        <ul className="list-group mb-3 overflow-auto flex-grow-1 shadow-sm rounded-3">
          {cart.map((item, index) => (
            <li
              key={index}
              className="list-group-item d-flex align-items-center justify-content-between border-0 border-bottom"
            >
              <div className="flex-grow-1">
                <strong>{item.product_name}</strong>
                <div className="d-flex align-items-center mt-1">
                  <span className="me-2 text-secondary">${item.unit_price}</span>
                  <input
                    type="number"
                    min="1"
                    value={item.qty}
                    className="form-control form-control-sm me-2 text-center"
                    style={{ width: "60px" }}
                    onChange={(e) =>
                      updateQty(index, parseInt(e.target.value))
                    }
                  />
                  <span className="fw-bold text-success">
                    ${item.amount.toFixed(2)}
                  </span>
                </div>
              </div>
              <button
                className="btn btn-sm btn-outline-danger ms-2 rounded-pill"
                onClick={() => removeItem(index)}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {cart.length > 0 && (
        <div className="d-flex justify-content-between align-items-center border-top pt-3">
          <strong className="fs-5">
            Total: ${cart.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}
          </strong>
          <button
            className="btn btn-primary rounded-pill px-4"
            onClick={proceedToCheckout}
          >
            Proceed →
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Navbar */}
      <nav
        className="navbar navbar-expand-lg navbar-dark shadow-sm"
        style={{
          background:
            "linear-gradient(90deg, #0d6efd 0%, #6610f2 100%)",
        }}
      >
        <div className="container-fluid">
          <h2 className="text-light fw-bold mb-0">🛍️ SmallBazaar</h2>
          <button
            className="btn btn-outline-light rounded-pill"
            onClick={toggleCart}
          >
            View Cart ({cart.length})
          </button>
        </div>
      </nav>

      {/* Offcanvas Cart */}
      <div
        className={`offcanvas offcanvas-end ${showCart ? "show" : ""}`}
        style={{ visibility: showCart ? "visible" : "hidden", width: "400px" }}
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title fw-semibold">🛒 Your Cart</h5>
          <button
            type="button"
            className="btn-close text-reset"
            onClick={toggleCart}
          ></button>
        </div>
        {CartBody}
      </div>
      {showCart && (
        <div
          className="offcanvas-backdrop fade show"
          onClick={toggleCart}
        ></div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <>
          <div
            className="modal fade show"
            style={{ display: "block", backdropFilter: "blur(3px)" }}
            tabIndex="-1"
            role="dialog"
            aria-modal="true"
          >
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 shadow-lg rounded-4">
                <div className="modal-header bg-primary text-white rounded-top-4">
                  <h5 className="modal-title">Payment Details</h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={closePayment}
                  ></button>
                </div>
                <div className="modal-body">
                  <p className="fs-5">
                    💰 Total Amount:{" "}
                    <strong>
                      ${cart.reduce((sum, item) => sum + item.amount, 0)}
                    </strong>
                  </p>

                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Enter your name"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Address</label>
                    <input
                      type="text"
                      className="form-control"
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Delivery address"
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Contact Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      onChange={(e) => setCustomerContact(e.target.value)}
                      placeholder="e.g. +91 9876543210"
                    />
                  </div>

                  <label className="form-label">Payment Method</label>
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="payment"
                      checked={paymentMode === "Razorpay"}
                      onChange={() => setPaymentMode("Razorpay")}
                    />
                    <label className="form-check-label">Razorpay</label>
                  </div>

                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="payment"
                      checked={paymentMode === "Cod"}
                      onChange={() => setPaymentMode("Cod")}
                    />
                    <label className="form-check-label">
                      Cash on Delivery
                    </label>
                  </div>
                </div>
                <div className="modal-footer border-0">
                  <button
                    className="btn btn-light border rounded-pill"
                    onClick={closePayment}
                  >
                    Cancel
                  </button>
                  <button
                    className="btn btn-success rounded-pill px-4"
                    onClick={() => {
                      closePayment();
                      setCart([]);
                      proceed();
                    }}
                  >
                    Confirm & Buy
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div
            className="modal-backdrop fade show"
            onClick={closePayment}
          ></div>
        </>
      )}

      {/* Hero Section */}
      <div
        className="container-fluid text-center text-white py-5"
        style={{
          background:
            "linear-gradient(120deg, #007bff 0%, #6610f2 100%)",
        }}
      >
        <h1 className="fw-bold">Welcome to SmallBazaar 🛒</h1>
        <p className="lead mb-0">
          Your one-stop destination for all essentials at unbeatable prices.
        </p>
      </div>

      {/* Products Section */}
      <div className="container py-5">
        <h2 className="mb-4 fw-bold text-center text-primary">
          Explore Our Products
        </h2>
        <div className="row">
          {activeProducts.map((product) => {
            const qty = quantities[product.id] || 1;
            return (
              <div key={product.id} className="col-md-4 mb-4">
                <div
                  className="card h-100 border-0 shadow-sm rounded-4"
                  style={{
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-5px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  <img
                    src={`https://dummyimage.com/400x300/007bff/ffffff&text=${product.name
                      .split(" ")
                      .join("+")}`}
                    className="card-img-top rounded-top-4"
                    alt={product.name}
                  />
                  <div className="card-body">
                    <h5 className="card-title fw-semibold">
                      {product.name}
                    </h5>
                    <p className="card-text text-muted small">
                      {product.description}
                    </p>
                    <p className="card-text fs-6 fw-bold text-success">
                      ${product.price}
                    </p>
                    <div className="d-flex align-items-center mb-3">
                      <button
                        className="btn btn-outline-secondary btn-sm rounded-circle"
                        onClick={() =>
                          handleQtyChange(product.id, qty - 1)
                        }
                      >
                        −
                      </button>
                      <span className="mx-3 fw-semibold">{qty}</span>
                      <button
                        className="btn btn-outline-secondary btn-sm rounded-circle"
                        onClick={() =>
                          handleQtyChange(product.id, qty + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                    <button
                      className="btn btn-primary w-100 rounded-pill"
                      onClick={() => addToCart(product, qty)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-light py-3 text-center mt-auto">
        <small>© {new Date().getFullYear()} SmallBazaar — All Rights Reserved</small>
      </footer>
    </>
  );
}
