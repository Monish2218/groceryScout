import { IProduct } from "../models/Product";

export interface ParsedIngredient {
    name: string;
    quantity: {
        value: string;
        unit: string;
    };
}

export interface MappedItem {
    originalIngredientName: string;
    originalQuantity: string;
    matchedProduct: IProduct;
    calculatedQuantityNeeded: number;
    calculationNotes?: string;
}

export interface UnavailableItem {
    originalIngredientName: string;
    originalQuantity: string;
    reason: string;
}

export interface MappingResult {
    matchedItems: MappedItem[];
    unavailableItems: UnavailableItem[];
}