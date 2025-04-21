// src/pages/OrdersPage.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext'; // To ensure user is logged in

// Interface matching backend IOrder structure
interface OrderItem {
    productId: { _id: string; name?: string }; // Adjust if needed
    name: string;
    imageUrl?: string;
    quantity: number;
    pricePerUnit: number;
    unit: string;
    unitQuantity: number;
}

interface Order {
    _id: string;
    userId: string;
    items: OrderItem[];
    totalAmount: number;
    status: string; // 'Pending', 'Confirmed', etc.
    orderDate: string; // Date will likely be string from JSON
    createdAt: string;
    updatedAt: string;
}

// Helper to format date
const formatDate = (dateString: string): string => {
     try {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric',
            // hour: '2-digit', minute: '2-digit' // Optional: Add time
        });
     } catch (e : unknown) {
        console.error("Error formatting date:", e);
        return "Invalid Date";
     }
};

const OrdersPage: React.FC = () => {
    const { isAuthenticated } = useAuth(); // Ensure user is authenticated before fetching
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoadingOrders, setIsLoadingOrders] = useState<boolean>(true);
    const [ordersError, setOrdersError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!isAuthenticated) {
                 setIsLoadingOrders(false);
                 setOrdersError("Please log in to view orders."); // Should be handled by ProtectedRoute, but good failsafe
                 return;
             }

            setIsLoadingOrders(true);
            setOrdersError(null);
            try {
                const response = await axiosInstance.get<Order[]>('/orders'); // Expect array of Orders
                setOrders(response.data);
            } catch (err: unknown) {
                console.error("Failed to fetch orders:", err);
                const error = err as { response?: { data?: { message?: string } } };
                setOrdersError(error.response?.data?.message ?? "Could not load order history.");
            } finally {
                setIsLoadingOrders(false);
            }
        };

        fetchOrders();
    }, [isAuthenticated]); // Re-fetch if auth state changes (e.g., on login)

    // --- Render Logic ---

    if (isLoadingOrders) {
        return <div className="text-center p-10">Loading order history...</div>;
    }

    if (ordersError) {
        return <div className="text-center p-10 text-red-600">Error: {ordersError}</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-4">Your Orders</h1>

            {orders.length === 0 ? (
                <div className="text-center p-10 bg-white rounded-lg shadow">
                    <p className="text-gray-600 mb-4">You haven't placed any orders yet.</p>
                    <Link
                        to="/"
                        className="px-6 py-2 bg-green-600 text-white font-semibold rounded-lg shadow hover:bg-green-700 transition duration-150"
                    >
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Map over orders and display summary cards */}
                    {orders.map((order) => (
                        <div key={order._id} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
                            <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
                                <div>
                                    <p className="text-sm text-gray-500">Order Placed</p>
                                    <p className="font-medium">{formatDate(order.orderDate)}</p>
                                </div>
                                <div>
                                     <p className="text-sm text-gray-500">Total Amount</p>
                                     <p className="font-medium">₹{order.totalAmount.toFixed(2)}</p>
                                </div>
                                 <div>
                                     <p className="text-sm text-gray-500">Order ID</p>
                                     <p className="font-mono text-xs text-gray-700">{order._id}</p>
                                </div>
                                 <div>
                                     <p className="text-sm text-gray-500">Status</p>
                                     <span className={`px-2 py-1 text-xs font-semibold rounded-full ${ order.status === 'Delivered' ? 'bg-green-100 text-green-800' : order.status === 'Cancelled' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                         {order.status}
                                     </span>
                                </div>
                                {/* Optional: Link/Button to Order Details Page */}
                                {/* <Link to={`/orders/${order._id}`} className="text-sm text-green-600 hover:underline">View Details</Link> */}
                            </div>

                            {/* Optionally display first few items */}
                            <div className="border-t pt-4 mt-4 space-y-2">
                                 <h4 className="text-sm font-semibold text-gray-700 mb-2">Items:</h4>
                                {order.items.slice(0, 3).map((item, index) => ( // Show first 3 items as preview
                                     <div key={item.productId._id + '-' + index} className="flex items-center space-x-3 text-sm">
                                         <img src={item.imageUrl ?? 'https://via.placeholder.com/40'} alt={item.name} className="w-8 h-8 object-cover rounded flex-shrink-0"/>
                                         <span>{item.name} (x{item.quantity})</span>
                                     </div>
                                 ))}
                                 {order.items.length > 3 && <p className="text-xs text-gray-500 mt-1">... and {order.items.length - 3} more items.</p>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default OrdersPage;