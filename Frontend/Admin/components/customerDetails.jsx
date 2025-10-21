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

export default function CustomerDetails({ order }) {
    return (
        <>
            <Dialog>
                <DialogTrigger asChild>
                    <Button variant="outline">View Customer</Button>
                </DialogTrigger>
                <DialogHeader>
                </DialogHeader>
                <DialogContent>
                    <DialogDescription>
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="h-9 py-2">Name</TableHead>
                                    <TableHead className="h-9 py-2">Contact</TableHead>
                                    <TableHead className="h-9 py-2">Address</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="py-2">{order.customer_name}</TableCell>
                                    <TableCell className="py-2">{order.customer_contact}</TableCell>
                                    <TableCell className="py-2">{order.customer_address}</TableCell>
                                </TableRow>
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
        </>
    )
}