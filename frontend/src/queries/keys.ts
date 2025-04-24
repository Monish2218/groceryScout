export const queryKeys = {
    products: (params?: unknown) => ['products', params].filter(Boolean),
    product: (id: string) => ['product', id],
    cart: ['cart'],
    orders: ['orders'],
    order: (id: string | undefined) => ['order', id],
    user: ['user', 'me'],
};