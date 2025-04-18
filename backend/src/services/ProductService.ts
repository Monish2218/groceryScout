import Product, { IProduct } from '../models/Product';

/**
 * Create a new product.
 * @param productData - Data for the new product.
 * @returns The created product.
 */
export const createProduct = async (productData: Partial<IProduct>): Promise<IProduct> => {
    const product = new Product(productData);
    await product.save();
    return product;
};

/**
 * Get all products with optional filtering and pagination.
 * @param query - Optional query parameters (e.g., category, brand).
 * @param page - Page number for pagination.
 * @param limit - Number of items per page.
 * @returns An object containing products and pagination info.
 */
export const getAllProducts = async (
    query: any = {},
    page: number = 1,
    limit: number = 10
): Promise<{ products: IProduct[], total: number, page: number, pages: number }> => {
    const skip = (page - 1) * limit;
    const filter: any = {};
    if (query.category) {
        filter.category = query.category;
    }
    if (query.brand) {
        filter.brand = query.brand;
    }

    const products = await Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Product.countDocuments(filter);

    return {
        products,
        total,
        page,
        pages: Math.ceil(total / limit),
    };
};

 /**
 * Get a single product by its ID.
 * @param id - The ID of the product.
 * @returns The product or null if not found.
 */
export const getProductById = async (id: string): Promise<IProduct | null> => {
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return null;
    }
    return Product.findById(id);
};


/**
 * Update an existing product.
 * @param id - The ID of the product to update.
 * @param updateData - The data to update the product with.
 * @returns The updated product or null if not found.
 */
export const updateProduct = async (id: string, updateData: Partial<IProduct>): Promise<IProduct | null> => {
     if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return null;
    }
    return Product.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
};

/**
 * Delete a product by its ID.
 * @param id - The ID of the product to delete.
 * @returns The deleted product or null if not found.
 */
export const deleteProduct = async (id: string): Promise<IProduct | null> => {
     if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        return null;
    }
    return Product.findByIdAndDelete(id);
};

/**
 * Search products using the text index.
 * @param searchTerm - The term to search for.
 * @param page - Page number for pagination.
 * @param limit - Number of items per page.
 * @returns An object containing search results and pagination info.
*/
export const searchProducts = async (
    searchTerm: string,
    page: number = 1,
    limit: number = 10
): Promise<{ products: IProduct[], total: number, page: number, pages: number }> => {
    const skip = (page - 1) * limit;
    const filter = { $text: { $search: searchTerm } };

    const products = await Product.find(
            filter,
            { score: { $meta: "textScore" } }
        )
        .sort({ score: { $meta: "textScore" } })
        .skip(skip)
        .limit(limit);

    const total = await Product.countDocuments(filter);

    return {
        products,
        total,
        page,
        pages: Math.ceil(total / limit),
    };
}