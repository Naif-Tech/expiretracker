import { 
  users, categories, products, notifications,
  type User, type InsertUser,
  type Category, type InsertCategory,
  type Product, type InsertProduct, type ProductWithCategory,
  type Notification, type InsertNotification,
  type DashboardStats
} from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private categories: Map<number, Category> = new Map();
  private products: Map<number, Product> = new Map();
  private notifications: Map<number, Notification> = new Map();
  private currentUserId = 1;
  private currentCategoryId = 1;
  private currentProductId = 1;
  private currentNotificationId = 1;

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Create default user
    const defaultUser: User = {
      id: this.currentUserId++,
      username: "أحمد محمد",
      email: "ahmed@example.com",
      displayName: "أحمد محمد",
      photoURL: null,
      firebaseUID: "default-user",
      createdAt: new Date(),
    };
    this.users.set(defaultUser.id, defaultUser);

    // Create default categories
    const defaultCategories = [
      { nameAr: "مواد غذائية", name: "Food", icon: "🍎", color: "#10B981" },
      { nameAr: "أدوية", name: "Medicine", icon: "💊", color: "#3B82F6" },
      { nameAr: "مستحضرات تجميل", name: "Cosmetics", icon: "🧴", color: "#8B5CF6" },
      { nameAr: "مستلزمات منزلية", name: "Household", icon: "🧽", color: "#F59E0B" },
    ];

    defaultCategories.forEach(cat => {
      const category: Category = {
        id: this.currentCategoryId++,
        name: cat.name,
        nameAr: cat.nameAr,
        icon: cat.icon,
        color: cat.color,
        userId: defaultUser.id,
        isDefault: true,
        createdAt: new Date(),
      };
      this.categories.set(category.id, category);
    });
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByFirebaseUID(firebaseUID: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.firebaseUID === firebaseUID);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      displayName: insertUser.displayName ?? null,
      email: insertUser.email ?? null,
      photoURL: insertUser.photoURL ?? null,
      firebaseUID: insertUser.firebaseUID ?? null,
      id: this.currentUserId++,
      createdAt: new Date(),
    };
    this.users.set(user.id, user);
    
    // Create default categories for new user
    await this.createDefaultCategories(user.id);
    
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Categories
  async getCategories(userId: number): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(cat => cat.userId === userId);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const category: Category = {
      ...insertCategory,
      userId: insertCategory.userId ?? null,
      isDefault: insertCategory.isDefault ?? null,
      id: this.currentCategoryId++,
      createdAt: new Date(),
    };
    this.categories.set(category.id, category);
    return category;
  }

  async updateCategory(id: number, updates: Partial<InsertCategory>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...updates };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
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
    const userProducts = Array.from(this.products.values()).filter(p => p.userId === userId);
    return userProducts.map(product => this.enrichProduct(product));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const product: Product = {
      ...insertProduct,
      userId: insertProduct.userId ?? null,
      nameAr: insertProduct.nameAr ?? null,
      categoryId: insertProduct.categoryId ?? null,
      quantity: insertProduct.quantity ?? null,
      notes: insertProduct.notes ?? null,
      barcode: insertProduct.barcode ?? null,
      imageUrl: insertProduct.imageUrl ?? null,
      isUsed: insertProduct.isUsed ?? null,
      isExpired: insertProduct.isExpired ?? null,
      alertDays: insertProduct.alertDays ?? null,
      id: this.currentProductId++,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.set(product.id, product);
    return product;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updates, updatedAt: new Date() };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  async markProductAsUsed(id: number): Promise<Product | undefined> {
    return this.updateProduct(id, { isUsed: true });
  }

  async markProductAsExpired(id: number): Promise<Product | undefined> {
    return this.updateProduct(id, { isExpired: true });
  }

  async getProductsByCategory(userId: number, categoryId: number): Promise<ProductWithCategory[]> {
    const products = await this.getProducts(userId);
    return products.filter(p => p.categoryId === categoryId);
  }

  async searchProducts(userId: number, query: string): Promise<ProductWithCategory[]> {
    const products = await this.getProducts(userId);
    const searchTerm = query.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(searchTerm) ||
      (p.nameAr && p.nameAr.includes(searchTerm)) ||
      (p.notes && p.notes.toLowerCase().includes(searchTerm))
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
    return Array.from(this.notifications.values()).filter(n => n.userId === userId);
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const notification: Notification = {
      ...insertNotification,
      userId: insertNotification.userId ?? null,
      productId: insertNotification.productId ?? null,
      isRead: insertNotification.isRead ?? null,
      scheduledAt: insertNotification.scheduledAt ?? null,
      sentAt: insertNotification.sentAt ?? null,
      id: this.currentNotificationId++,
      createdAt: new Date(),
    };
    this.notifications.set(notification.id, notification);
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification) return false;
    
    this.notifications.set(id, { ...notification, isRead: true });
    return true;
  }

  private enrichProduct(product: Product): ProductWithCategory {
    const category = product.categoryId ? this.categories.get(product.categoryId) : undefined;
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
      category,
      daysUntilExpiry,
      status,
    };
  }
}

export const storage = new MemStorage();
