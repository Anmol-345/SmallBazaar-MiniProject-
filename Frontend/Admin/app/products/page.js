"use client"

import { useEffect, useState } from "react";
import axios from "axios"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import EditProductDialog from "@/components/productForm";

import { Button } from "@/components/ui/button";
import AddProductDialog from "@/components/AddProductDialog";

export default function Products() {

  const [products,setProducts] = useState([])


    useEffect(()=>{
        mutate()
    },[])

  const mutate = async ()=>{
    try {
        const response = await axios.get("https://small-bazaar-mini-project.vercel.app/products/all");
        setProducts(response.data)
        console.log(response.data)
      } catch (error) {
        console.error("Error fetching data:", error);
        return null; // or []
      }
  }


  const toggleStatus = async (id)=>{
    try {
        const response = await axios.put(`https://small-bazaar-mini-project.vercel.app/products/status`,{id:id});
        mutate()
      } catch (error) {
        console.error("Error toggling status:", error);
      }
  }

  


  return (
    <>
<div className="flex flex-col items-center bg-background p-4">
  {/* Top bar: Add button + total products */}
  <div className="w-full max-w-6xl flex justify-between items-center mb-4">
    <div className="text-lg font-bold text-white">
      Total Products: {products.length}
    </div>
    <AddProductDialog onAdded={mutate} />
  </div>

  {/* Table container */}
  <div className="w-full max-w-6xl overflow-hidden rounded-lg border bg-card shadow-sm">
    <div className="overflow-x-auto">
      <div className="overflow-y-auto max-h-[80vh] scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-gray-900">
        {products.length === 0 ? (
          <p className="text-center text-gray-500 py-6">
            No products available.
          </p>
        ) : (
          <Table className="w-full">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead>Product Id.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Created At</TableHead>
                <TableHead>Status Toggle</TableHead>
                <TableHead>Update</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((element) => (
                <TableRow key={element.id}>
                  <TableCell>{element.id}</TableCell>
                  <TableCell>{element.name}</TableCell>
                  <TableCell>{element.price}</TableCell>
                  <TableCell>{element.status}</TableCell>
                  <TableCell>{element.stock}</TableCell>
                  <TableCell>{element.created_at}</TableCell>
                  <TableCell>
                    <Button onClick={() => toggleStatus(element.id)}>Toggle Status</Button>
                  </TableCell>
                  <TableCell>
                    <EditProductDialog product={element} onUpdate={mutate} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  </div>
</div>


    </>
  );
}
