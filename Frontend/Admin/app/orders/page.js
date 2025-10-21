"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import OrderDetails from "@/components/orderDetails"
import CustomerDetails from "@/components/customerDetails"

export default function OrdersPage() {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await axios.get("http://localhost:5000/orders/all")
      // Parse items JSON only if it's a string
      const parsedOrders = res.data.map(order => ({
        ...order,
        items:
          typeof order.items === "string" ? JSON.parse(order.items) : order.items,
      }))
      setOrders(parsedOrders)
    } catch (err) {
      console.error("Error fetching orders:", err)
    }
  }

  // Toggle status function
  const toggleStatus = async (id) => {
    try {
      await axios.put("http://localhost:5000/orders/update", { id })
      fetchOrders() // refresh after update
    } catch (err) {
      console.error("Error toggling status:", err)
    }
  }

  return (
<div className="flex justify-center items-start bg-background p-4">
  <div className="w-full max-w-6xl overflow-hidden rounded-lg border bg-card shadow-sm">
    {/* Vertical scroll only */}
    <div className="overflow-y-auto max-h-[80vh]">
      <Table className="w-full">
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Order Id.</TableHead>
            <TableHead>Customer Details</TableHead>
            <TableHead>Order Items</TableHead>
            <TableHead>Mode of Payment</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Ordered At</TableHead>
            <TableHead>Toggle Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>
                <div className="space-y-1">
                  <CustomerDetails order={order} />
                </div>
              </TableCell>
              <TableCell>
                <OrderDetails order={order} />
              </TableCell>
              <TableCell>{order.modeOfPayment}</TableCell>
              <TableCell>{order.status}</TableCell>
              <TableCell>{new Date(order.ordered_at).toLocaleString()}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleStatus(order.id)}
                >
                  Toggle
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
</div>

  )
}
