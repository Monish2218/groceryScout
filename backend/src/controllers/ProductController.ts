import { Request, Response } from 'express';
import * as ProductService from '../services/ProductService';

export const create = async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await ProductService.createProduct(req.body);
    res.status(201).json(product);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    if (error instanceof Error && error.name === 'ValidationError') {
         res.status(400).json({ message: 'Validation Error', errors: errorMessage });
    } else {
        console.error('Create Product Error:', error);
        res.status(500).json({ message: 'Server error creating product', error: errorMessage });
    }
  }
};

export const getAll = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const query = req.query;

    const result = await ProductService.getAllProducts(query, page, limit);
    res.status(200).json(result);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Get All Products Error:', error);
    res.status(500).json({ message: 'Server error retrieving products', error: errorMessage });
  }
};

export const getById = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const product = await ProductService.getProductById(id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.status(200).json(product);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Get Product By ID Error:', error);
     if (errorMessage === 'Invalid product ID format') {
         res.status(400).json({ message: errorMessage });
     } else {
        res.status(500).json({ message: 'Server error retrieving product', error: errorMessage });
     }
  }
};

export const update = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const product = await ProductService.updateProduct(id, req.body);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.status(200).json(product);
  } catch (error: unknown) {
     const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
     if (errorMessage === 'Invalid product ID format') {
         res.status(400).json({ message: errorMessage });
     } else if (error instanceof Error && error.name === 'ValidationError') {
         res.status(400).json({ message: 'Validation Error', errors: errorMessage });
     }
     else {
        console.error('Update Product Error:', error);
        res.status(500).json({ message: 'Server error updating product', error: errorMessage });
     }
  }
};

export const remove = async (req: Request, res: Response): Promise<void> => {
  try {
    const id = req.params.id;
    const product = await ProductService.deleteProduct(id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.status(200).json({ message: 'Product deleted successfully', product });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
     if (errorMessage === 'Invalid product ID format') {
         res.status(400).json({ message: errorMessage });
     } else {
        console.error('Delete Product Error:', error);
        res.status(500).json({ message: 'Server error deleting product', error: errorMessage });
     }
  }
};

export const search = async (req: Request, res: Response): Promise<void> => {
    try {
      const searchTerm = req.query.q as string;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!searchTerm) {
        res.status(400).json({ message: 'Search term (q) is required' });
        return;
      }

      const results = await ProductService.searchProducts(searchTerm, page, limit);
      res.status(200).json(results);

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Search Products Error:', error);
      res.status(500).json({ message: 'Server error searching products', error: errorMessage });
    }
}