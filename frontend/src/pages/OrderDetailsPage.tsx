import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ArrowLeftIcon } from 'lucide-react';
import { formatDate, getBadgeVariant, Order } from './OrdersPage';

const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

const OrderDetailsPage: React.FC = () => {
    const { orderId } = useParams<{ orderId: string }>();
    const { isAuthenticated } = useAuth();
    const [order, setOrder] = useState<Order | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrderDetails = async () => {
            if (!isAuthenticated || !orderId) {
                setIsLoading(false);
                setError("Order ID missing or user not authenticated.");
                return;
            }
            setIsLoading(true);
            setError(null);
            try {
                const response = await axiosInstance.get<Order>(`/orders/${orderId}`);
                setOrder(response.data);
            } catch (err: unknown) {
                console.error(`Failed to fetch order ${orderId}:`, err);
                const error = err as { response?: { status?: number; data?: { message?: string } } };
                 if (error.response?.status === 404) {
                    setError("Order not found or you do not have permission to view it.");
                 } else {
                    setError(error.response?.data?.message ?? "Could not load order details.");
                 }
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderDetails();
    }, [isAuthenticated, orderId]);

     if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 space-y-6">
                 <Skeleton className="h-8 w-1/4 mb-6" />
                 <Card>
                    <CardHeader><Skeleton className="h-6 w-3/4" /></CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                 </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Alert variant="destructive">
                    <AlertTitle>Error Loading Order</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
                <Button variant="outline" asChild className="mt-4">
                <Link to="/orders"><ArrowLeftIcon className="w-4 h-4 mr-2"/> Back to Orders</Link>
                </Button>
            </div>
        );
    }

     if (!order) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <p>Order details could not be loaded.</p>
                <Button variant="outline" asChild className="mt-4">
                <Link to="/orders"><ArrowLeftIcon className="w-4 h-4 mr-2"/> Back to Orders</Link>
                </Button>
            </div>
        );
    }

    return (
         <div className="container mx-auto px-4 py-8 space-y-6">
             <Button variant="outline" size="sm" asChild className="mb-4">
                <Link to="/orders"><ArrowLeftIcon className="w-4 h-4 mr-2"/> Back to Orders</Link>
             </Button>

             <Card className="overflow-hidden">
                 <CardHeader className="bg-slate-50/60 dark:bg-slate-800/60 p-4 border-b">
                    <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-2">
                         <div>
                            <CardTitle className="text-xl">Order Details</CardTitle>
                            <CardDescription className="text-xs sm:text-sm mt-1">
                                ID: {order._id} | Placed: {formatDate(order.orderDate)}
                            </CardDescription>
                         </div>
                          <div className="text-right space-y-1">
                            <Badge variant={getBadgeVariant(order.status)}>{order.status}</Badge>
                            <p className="text-lg font-semibold">{formatCurrency(order.totalAmount)}</p>
                          </div>
                    </div>
                 </CardHeader>

                 <CardContent className="p-4 md:p-6 space-y-6">

                    <section>
                        <h3 className="text-lg font-semibold mb-3">Items Ordered</h3>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-[80px] hidden md:table-cell">Image</TableHead>
                                    <TableHead>Product</TableHead>
                                    <TableHead className="text-center">Quantity</TableHead>
                                    <TableHead className="text-right">Price Paid</TableHead>
                                    <TableHead className="text-right">Subtotal</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {order.items.map((item, index) => (
                                    <TableRow key={item.productId._id + '-' + index}>
                                        <TableCell className="hidden md:table-cell">
                                            <img
                                            src={item.imageUrl ?? 'https://via.placeholder.com/60'}
                                            alt={item.name}
                                            className="w-12 h-12 object-cover rounded"
                                        />
                                        </TableCell>
                                        <TableCell className="font-medium">
                                        <div>{item.name}</div>
                                        <div className="text-xs text-muted-foreground">{item.unitQuantity}{item.unit}</div>
                                        </TableCell>
                                        <TableCell className="text-center">{item.quantity}</TableCell>
                                        <TableCell className="text-right">{formatCurrency(item.pricePerUnit)}</TableCell>
                                        <TableCell className="text-right font-medium">{formatCurrency(item.quantity * item.pricePerUnit)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </section>

                     {/* Order Total Summary within details */}
                     <div className="flex justify-end pt-4 border-t">
                         <div className="w-full max-w-xs space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{formatCurrency(order.totalAmount)}</span> {/* Assuming totalAmount is subtotal before tax/ship */}
                            </div>
                             <div className="flex justify-between text-muted-foreground">
                                <span>Taxes</span>
                                <span>--</span>
                            </div>
                             <div className="flex justify-between text-muted-foreground">
                                <span>Shipping</span>
                                <span>--</span>
                            </div>
                             <div className="flex justify-between font-bold text-base pt-2 border-t mt-2">
                                <span>Total</span>
                                <span>{formatCurrency(order.totalAmount)}</span>
                            </div>
                         </div>
                     </div>

                 </CardContent>
             </Card>
         </div>
    );
};

export default OrderDetailsPage;