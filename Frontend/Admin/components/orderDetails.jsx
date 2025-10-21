'use client'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose,
    DialogFooter
} from "@/components/ui/dialog";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import { Button } from "@/components/ui/button";

export default function OrderDetails({ order }) {
    if (!order || !order.items) return null;
  
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">View Items</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogDescription>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Product</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.items.map((element, index) => (
                  <TableRow key={index}>
                    <TableCell>{element.product_name}</TableCell>
                    <TableCell>{element.unit_price}</TableCell>
                    <TableCell>{element.qty}</TableCell>
                    <TableCell>{element.amount}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </DialogDescription>
          <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Close</Button>
                        </DialogClose>
                    </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }