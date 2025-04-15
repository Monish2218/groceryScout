// In server.ts, after connectDB() (FOR DEV ONLY)
import Product from '../models/Product';
const seedDatabase = async () => {
  try {
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('No products found, seeding database...');
      const productsToSeed = [
         { name: "Onion", category: "Vegetables", price: 40, unit: "kg", unitQuantity: 1, tags: ["vegetable", "onion", "pyaz", "kanda"] },
         { name: "Tomato", category: "Vegetables", price: 30, unit: "kg", unitQuantity: 1, tags: ["vegetable", "tomato", "tamatar"] },
         { name: "Amul Taaza Paneer", category: "Dairy", brand: "Amul", price: 80, unit: "g", unitQuantity: 200, tags: ["paneer", "cottage cheese", "dairy", "amul"] },
         { name: "Aashirvaad Select Atta", category: "Grains & Flour", brand: "Aashirvaad", price: 550, unit: "kg", unitQuantity: 5, tags: ["atta", "flour", "wheat", "aashirvaad", "whole wheat flour"] },
         { name: "Tata Salt Iodized", category: "Spices & Masalas", brand: "Tata", price: 25, unit: "kg", unitQuantity: 1, tags: ["salt", "tata", "iodized salt", "namak"] },
         { name: "Fortune Sunlite Refined Sunflower Oil", category: "Oils & Ghee", brand: "Fortune", price: 130, unit: "l", unitQuantity: 1, tags: ["oil", "sunflower oil", "refined oil", "fortune", "cooking oil"] },
      ];
      await Product.insertMany(productsToSeed);
      console.log('Database seeded successfully!');
    } else {
       console.log('Database already contains products, skipping seed.');
    }
  } catch (error) {
    console.error('Error seeding database:', error);
  }
};
export default seedDatabase; // export the function