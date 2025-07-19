import { 
  users, categories, products, notifications,
  type User, type InsertUser,
  type Category, type InsertCategory,
  type Product, type InsertProduct, type ProductWithCategory,
  type Notification, type InsertNotification,
  type DashboardStats
} from "@shared/schema";
import { db } from "./db";
import { eq, and, sql, like } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByFirebaseUID(firebaseUID: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined>;

  // Categories
  getCategories(userId: number): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, updates: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  createDefaultCategories(userId: number): Promise<Category[]>;

  // Products
  getProducts(userId: number): Promise<ProductWithCategory[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  markProductAsUsed(id: number): Promise<Product | undefined>;
  markProductAsExpired(id: number): Promise<Product | undefined>;
  getProductsByCategory(userId: number, categoryId: number): Promise<ProductWithCategory[]>;
  searchProducts(userId: number, query: string): Promise<ProductWithCategory[]>;

  // Dashboard & Analytics
  getDashboardStats(userId: number): Promise<DashboardStats>;
  getExpiringProducts(userId: number, days: number): Promise<ProductWithCategory[]>;

  // Notifications
  getNotifications(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  constructor() {
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    // Check if default user exists
    const [existingUser] = await db.select().from(users).where(eq(users.firebaseUID, "default-user"));
    
    if (!existingUser) {
      // Create default user
      const [defaultUser] = await db
        .insert(users)
        .values({
          username: "أحمد محمد",
          email: "ahmed@example.com",
          displayName: "أحمد محمد",
          photoURL: null,
          firebaseUID: "default-user",
        })
        .returning();

      // Create default categories
      await this.createDefaultCategories(defaultUser.id);
    }
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByFirebaseUID(firebaseUID: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUID, firebaseUID));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    
    // Create default categories for new user
    await this.createDefaultCategories(user.id);
    
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Categories
  async getCategories(userId: number): Promise<Category[]> {
    return await db.select().from(categories).where(eq(categories.userId, userId));
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category || undefined;
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const [category] = await db
      .insert(categories)
      .values(insertCategory)
      .returning();
    return category;
  }

  async updateCategory(id: number, updates: Partial<InsertCategory>): Promise<Category | undefined> {
    const [category] = await db
      .update(categories)
      .set(updates)
      .where(eq(categories.id, id))
      .returning();
    return category || undefined;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async createDefaultCategories(userId: number): Promise<Category[]> {
    const defaultCategories = [
      { nameAr: "مواد غذائية", name: "Food", icon: "🍎", color: "#10B981" },
      { nameAr: "أدوية", name: "Medicine", icon: "💊", color: "#3B82F6" },
      { nameAr: "مستحضرات تجميل", name: "Cosmetics", icon: "🧴", color: "#8B5CF6" },
      { nameAr: "مستلزمات منزلية", name: "Household", icon: "🧽", color: "#F59E0B" },
    ];

    const createdCategories: Category[] = [];
    for (const cat of defaultCategories) {
      const category = await this.createCategory({
        name: cat.name,
        nameAr: cat.nameAr,
        icon: cat.icon,
        color: cat.color,
        userId,
        isDefault: true,
      });
      createdCategories.push(category);
    }
    return createdCategories;
  }

  // Products
  async getProducts(userId: number): Promise<ProductWithCategory[]> {
    const productsWithCategories = await db
      .select({
        product: products,
        category: categories,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.userId, userId));

    return productsWithCategories.map(({ product, category }) => 
      this.enrichProduct(product, category)
    );
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values(insertProduct)
      .returning();
    return product;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const [product] = await db
      .update(products)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return product || undefined;
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async markProductAsUsed(id: number): Promise<Product | undefined> {
    return this.updateProduct(id, { isUsed: true });
  }

  async markProductAsExpired(id: number): Promise<Product | undefined> {
    return this.updateProduct(id, { isExpired: true });
  }

  async getProductsByCategory(userId: number, categoryId: number): Promise<ProductWithCategory[]> {
    const productsWithCategories = await db
      .select({
        product: products,
        category: categories,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(and(eq(products.userId, userId), eq(products.categoryId, categoryId)));

    return productsWithCategories.map(({ product, category }) => 
      this.enrichProduct(product, category)
    );
  }

  async searchProducts(userId: number, query: string): Promise<ProductWithCategory[]> {
    const productsWithCategories = await db
      .select({
        product: products,
        category: categories,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(
        and(
          eq(products.userId, userId),
          sql`(
            ${products.name} ILIKE ${`%${query}%`} OR 
            ${products.nameAr} ILIKE ${`%${query}%`} OR 
            ${products.notes} ILIKE ${`%${query}%`}
          )`
        )
      );

    return productsWithCategories.map(({ product, category }) => 
      this.enrichProduct(product, category)
    );
  }

  // Dashboard & Analytics
  async getDashboardStats(userId: number): Promise<DashboardStats> {
    const products = await this.getProducts(userId);
    
    const stats: DashboardStats = {
      total: products.length,
      expired: products.filter(p => p.status === 'expired').length,
      expiring: products.filter(p => p.status === 'expiring').length,
      fresh: products.filter(p => p.status === 'fresh').length,
      used: products.filter(p => p.isUsed).length,
    };
    
    return stats;
  }

  async getExpiringProducts(userId: number, days: number): Promise<ProductWithCategory[]> {
    const products = await this.getProducts(userId);
    return products.filter(p => 
      p.daysUntilExpiry <= days && 
      p.daysUntilExpiry >= 0 && 
      !p.isUsed && 
      !p.isExpired
    );
  }

  // Notifications
  async getNotifications(userId: number): Promise<Notification[]> {
    return await db.select().from(notifications).where(eq(notifications.userId, userId));
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const [notification] = await db
      .insert(notifications)
      .values(insertNotification)
      .returning();
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const result = await db
      .update(notifications)
      .set({ isRead: true })
      .where(eq(notifications.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  private enrichProduct(product: Product, category?: Category | null): ProductWithCategory {
    const now = new Date();
    const expiryDate = new Date(product.expiryDate);
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    let status: 'fresh' | 'expiring' | 'expired' = 'fresh';
    if (product.isExpired || daysUntilExpiry < 0) {
      status = 'expired';
    } else if (daysUntilExpiry <= (product.alertDays || 7)) {
      status = 'expiring';
    }

    return {
      ...product,
      category: category || undefined,
      daysUntilExpiry,
      status,
    };
  }
}

export const storage = new DatabaseStorage();
