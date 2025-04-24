import axiosInstance from './axiosInstance';

interface Product {
    _id: string;
    name: string;
    price: number;
    unit: string;
    unitQuantity: number;
    description?: string;
    imageUrl?: string;
    category?: string;
    brand?: string;
    tags?: string[];
}

interface FetchProductsResponse {
    products: Product[];
    total: number;
    page: number;
    pages: number;
}

interface FetchProductParams {
    page?: number;
    limit?: number;
    category?: string;
    brand?: string;
}

export const fetchProducts = async (params: FetchProductParams = {}): Promise<FetchProductsResponse> => {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.category) queryParams.append('category', params.category);
    if (params.brand) queryParams.append('brand', params.brand);

    const queryString = queryParams.toString();
    const url = '/products' + (queryString ? '?' + queryString : '');

    const response = await axiosInstance.get<FetchProductsResponse>(url);
    console.log("API fetchProducts response:", response.data);
    return response.data;
};