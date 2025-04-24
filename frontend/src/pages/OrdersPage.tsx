import React from 'react';
import { Link } from 'react-router-dom';

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ListOrderedIcon, InboxIcon } from 'lucide-react';
import { useFetchOrders } from '@/queries/useOrderQueries';

export const formatDate = (dateString: string): string => {
    try {
       return new Date(dateString).toLocaleDateString('en-IN', {
           year: 'numeric', month: 'long', day: 'numeric',
       });
    } catch (e : unknown) {
       console.error("Error formatting date:", e);
       return "Invalid Date";
    }
};

export const getBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status.toLowerCase()) {
        case 'delivered': return 'default';
        case 'shipped': return 'default';
        case 'processing': return 'secondary';
        case 'confirmed': return 'secondary';
        case 'pending': return 'outline';
        case 'cancelled': return 'destructive';
        default: return 'secondary';
    }
};

const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

const OrdersPage: React.FC = () => {
    const {
        data: orders = [],
        isLoading: isLoadingOrders,
        isError: isOrdersError,
        error: ordersError,
    } = useFetchOrders();

    if (isLoadingOrders) {
        return (
            <div className="container mx-auto px-4 py-8 space-y-6">
                 <Skeleton className="h-8 w-1/4 mb-6" />
                 {[...Array(3)].map((_, i) => (
                    <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2 mt-1" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6 mt-2" />
                        </CardContent>
                        <CardFooter>
                            <Skeleton className="h-8 w-24" />
                        </CardFooter>
                    </Card>
                 ))}
            </div>
        );
    }

    if (isOrdersError) {
        return (
            <div className="container mx-auto px-4 py-8">
                 <Alert variant="destructive">
                    <AlertTitle>Error Loading Orders</AlertTitle>
                    <AlertDescription>{ordersError.message ?? 'Could not load orders.'}</AlertDescription>
                 </Alert>
            </div>
        );
    }

    if (!isLoadingOrders && orders.length === 0) {
        return (
             <div className="container mx-auto px-4 py-8 text-center flex flex-col items-center">
                <InboxIcon className="w-16 h-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-700 mb-2">No Orders Yet!</h2>
                <p className="text-gray-500 mb-6">Your past orders will appear here once you place them.</p>
                <Button asChild>
                    <Link to="/">Start Shopping</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 space-y-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800 flex items-center">
                    <ListOrderedIcon className="w-7 h-7 mr-2 text-green-600"/> Your Orders
                </h1>
            </div>

            {orders.map((order) => (
                <Card key={order._id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="p-4 bg-slate-50/60 dark:bg-slate-800/60">
                         {/* Flex container for header content */}
                         <div className="flex flex-wrap justify-between items-start gap-x-4 gap-y-2">
                            {/* Order Info */}
                            <div className="flex-1 min-w-[200px]">
                                <CardTitle className="text-base sm:text-lg mb-1">
                                    Order #{order._id.substring(order._id.length - 6)} {/* Use last 6 chars */}
                                </CardTitle>
                                <CardDescription className="text-xs sm:text-sm">
                                    Placed on: {formatDate(order.orderDate)}
                                </CardDescription>
                            </div>
                             {/* Status and Total */}
                            <div className="flex-shrink-0 text-right space-y-1">
                                <Badge
                                    variant={getBadgeVariant(order.status)}
                                    className="text-xs sm:text-sm"
                                >
                                    {order.status}
                                 </Badge>
                                <p className="text-sm sm:text-base font-semibold">{formatCurrency(order.totalAmount)}</p>
                             </div>
                         </div>
                    </CardHeader>
                    <CardContent className="p-4 text-sm">
                         {/* Display a preview of items or item count */}
                         <p className="text-gray-600">{order.items.length} item(s)</p>
                         {/* Maybe show first 1-2 item names briefly */}
                         <p className="text-gray-500 text-xs truncate mt-1" title={order.items.map(i => i.name).join(', ')}>
                             {order.items.map(i => i.name).slice(0, 2).join(', ')}{order.items.length > 2 ? '...' : ''}
                         </p>
                    </CardContent>
                    <CardFooter className="p-4 border-t bg-slate-50/60 dark:bg-slate-800/60 justify-end">
                        <Button variant="outline" size="sm" asChild>
                            <Link to={`/orders/${order._id}`}>View Details</Link>
                        </Button>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
};

export default OrdersPage;