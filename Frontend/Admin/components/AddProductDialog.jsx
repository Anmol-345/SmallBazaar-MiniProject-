"use client";

import { useState } from "react";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddProductDialog({ onAdded }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    status: "Active",
    stock: "",  // new stock field
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    // Edge case checks
    if (!form.name || !form.description || !form.price || !form.stock) {
      alert("⚠️ Please fill all required fields!");
      return;
    }

    try {
      await axios.post("https://small-bazaar-mini-project.vercel.app/products/add", {
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        status: form.status,
        stock: parseInt(form.stock), // include stock
      });

      alert("✅ Product added successfully!");
      setForm({ name: "", description: "", price: "", status: "Active", stock: "" });
      setOpen(false);
      onAdded(); // refresh product list
    } catch (error) {
      console.error("Error adding product:", error);
      alert("❌ Failed to add product. Check backend connection.");
    }
  };

  return (
    <>
      <Button onClick={() => setOpen(true)} className="mb-4 rounded-lg">
        ➕ Add Product
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Product</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div>
              <Label className="my-2">Product Name</Label>
              <Input
                name="name"
                placeholder="Enter product name"
                value={form.name}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label className="my-2">Description</Label>
              <Input
                name="description"
                placeholder="Short description"
                value={form.description}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label className="my-2">Price</Label>
              <Input
                name="price"
                type="number"
                placeholder="Enter price"
                value={form.price}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label className="my-2">Stock</Label>
              <Input
                name="stock"
                type="number"
                placeholder="Enter stock quantity"
                value={form.stock}
                onChange={handleChange}
              />
            </div>
            <div>
              <Label className="my-2">Status</Label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border rounded-md p-2"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Add Product</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
