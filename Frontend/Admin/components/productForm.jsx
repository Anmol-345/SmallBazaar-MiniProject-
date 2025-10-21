"use client";

import * as React from "react";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import axios from "axios";

export default function EditProductDialog({ product, onUpdate }) {
  const [open, setOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    price: product.price,
    stock: product.stock,
  });

  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put("http://localhost:5000/products/update", {
        id: product.id,
        ...formData,
      });
      setOpen(false);
      onUpdate(); // Refresh products list in parent
    } catch (err) {
      console.error(err);
    }
  };

  const FormContent = (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div>
        <Label htmlFor="price">Price</Label>
        <Input id="price" type="number" value={formData.price} onChange={handleChange} />
      </div>
      <div>
        <Label htmlFor="stock">Stock</Label>
        <Input id="stock" type="number" value={formData.stock} onChange={handleChange} />
      </div>
      <Button type="submit">Save changes</Button>
    </form>
  );

  // Desktop — Dialog
  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="outline">Edit</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
            <DialogDescription>Update product details below.</DialogDescription>
          </DialogHeader>
          {FormContent}
        </DialogContent>
      </Dialog>
    );
  }

  // Mobile — Drawer
  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button variant="outline">Edit</Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Edit Product</DrawerTitle>
          <DrawerDescription>Update product details below.</DrawerDescription>
        </DrawerHeader>
        <div className="px-4">{FormContent}</div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
