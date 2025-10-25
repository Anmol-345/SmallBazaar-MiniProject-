"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table"
import OrderDetails from "@/components/orderDetails"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

export default function SalesPage() {
  const [orders, setOrders] = useState([])
  const [statusFilter, setStatusFilter] = useState("")
  const [paymentFilter, setPaymentFilter] = useState("")

  const statusOptions = ["InProcess", "Delivered"]
  const paymentOptions = ["Cod", "Razorpay"]

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const res = await axios.get("https://small-bazaar-mini-project.vercel.app/orders/all")
      const parsed = res.data.map(order => ({
        ...order,
        items: typeof order.items === "string" ? JSON.parse(order.items) : order.items
      }))
      setOrders(parsed)
    } catch (err) {
      console.error(err)
    }
  }

  const filteredOrders = orders.filter(order => {
    return (
      (statusFilter ? order.status === statusFilter : true) &&
      (paymentFilter ? order.modeOfPayment === paymentFilter : true)
    )
  })

  const totalSales = filteredOrders.reduce((sum, order) => sum + order.total_amount, 0)
  const totalOrders = filteredOrders.length

  const productSales = {}
  filteredOrders.forEach(order => {
    order.items.forEach(item => {
      if (!productSales[item.product_name]) productSales[item.product_name] = 0
      productSales[item.product_name] += item.amount
    })
  })

  return (
    <div className="flex justify-center items-start bg-background p-4">
      <div className="w-full max-w-6xl overflow-hidden rounded-lg border bg-card shadow-sm">
        <div className="p-4 space-y-6">

          {/* Summary Cards */}
          <div className="flex gap-4">
            <div className="bg-card p-4 rounded-lg shadow flex-1">
              <h3 className="text-sm font-medium text-muted-foreground">Total Orders</h3>
              <p className="text-xl font-bold">{totalOrders}</p>
            </div>
            <div className="bg-card p-4 rounded-lg shadow flex-1">
              <h3 className="text-sm font-medium text-muted-foreground">Total Sales</h3>
              <p className="text-xl font-bold">₹{totalSales}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            {/* Status Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {statusFilter ? statusFilter : "All Status"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel>Status</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setStatusFilter("")}>All Status</DropdownMenuItem>
                  {statusOptions.map(status => (
                    <DropdownMenuItem key={status} onClick={() => setStatusFilter(status)}>
                      {status}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Payment Mode Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {paymentFilter ? paymentFilter : "All Payment Modes"}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel>Mode of Payment</DropdownMenuLabel>
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => setPaymentFilter("")}>All Payment Modes</DropdownMenuItem>
                  {paymentOptions.map(mode => (
                    <DropdownMenuItem key={mode} onClick={() => setPaymentFilter(mode)}>
                      {mode}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Product-wise Sales Table */}
          <div className="overflow-x-auto bg-card rounded-lg p-4">
            <h2 className="mb-2 font-medium">Product-wise Sales</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Total Sold Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Object.entries(productSales).map(([product, amount]) => (
                  <TableRow key={product}>
                    <TableCell>{product}</TableCell>
                    <TableCell>₹{amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto bg-card rounded-lg p-4">
            <h2 className="mb-2 font-medium">Orders</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer Name</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Mode</TableHead>
                  <TableHead>Ordered At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map(order => (
                  <TableRow key={order.id}>
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.customer_name}</TableCell>
                    <TableCell>
                      <OrderDetails order={order} />
                    </TableCell>
                    <TableCell>₹{order.total_amount}</TableCell>
                    <TableCell>{order.status}</TableCell>
                    <TableCell>{order.modeOfPayment}</TableCell>
                    <TableCell>{new Date(order.ordered_at).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

        </div>
      </div>
    </div>
  )
}
