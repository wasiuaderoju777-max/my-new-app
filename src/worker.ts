import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";
import { cors } from "hono/cors";

const app = new Hono<{ Bindings: Env; Variables: { user: any } }>();

// Middleware to validate Supabase JWT
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.replace("Bearer ", "");

  // Initialize Supabase client
  // We use the ANON key here because we just want to verify the user's JWT.
  // The D1 database is separate from Supabase DB, so we are just using Supabase for Auth identification.
  const supabase = createClient(c.env.SUPABASE_URL, c.env.SUPABASE_SERVICE_ROLE_KEY);

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("user", user);
  await next();
};

app.use("/*", cors());

app.get("/", (c) => c.text("WhatsOrder API is running"));

// Business endpoints
app.post("/api/businesses", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();

  if (!body.name || body.name.length > 100) return c.json({ error: "Name too long" }, 400);
  if (!body.slug || !/^[a-z0-9-]+$/.test(body.slug)) return c.json({ error: "Invalid slug" }, 400);
  if (!body.whatsappNumber) return c.json({ error: "WhatsApp required" }, 400);

  // Check if user already has a business
  const existing = await c.env.DB.prepare("SELECT id FROM businesses WHERE user_id = ?").bind(user.id).first();
  if (existing) return c.json({ error: "Business already exists" }, 400);

  // Check if slug is taken
  const slugExists = await c.env.DB.prepare("SELECT id FROM businesses WHERE slug = ?").bind(body.slug).first();
  if (slugExists) return c.json({ error: "Link taken" }, 400);

  // Insert business
  // Added 'onboarding_completed' as per plan
  const result = await c.env.DB.prepare(
    "INSERT INTO businesses (user_id, name, slug, whatsapp_number, description, logo_url, plan, onboarding_completed) VALUES (?, ?, ?, ?, ?, ?, 'free', 1)"
  ).bind(user.id, body.name, body.slug, body.whatsappNumber, body.description || null, body.logoUrl || null).run();

  const business = await c.env.DB.prepare("SELECT * FROM businesses WHERE id = ?").bind(result.meta.last_row_id).first();
  return c.json(business, 201);
});

app.get("/api/businesses/me", authMiddleware, async (c) => {
  const user = c.get("user");
  const business = await c.env.DB.prepare("SELECT * FROM businesses WHERE user_id = ?").bind(user.id).first();
  if (!business) return c.json({ error: "No business found" }, 404);
  return c.json(business);
});

app.put("/api/businesses", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();

  await c.env.DB.prepare(
    "UPDATE businesses SET name = ?, whatsapp_number = ?, description = ?, logo_url = ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?"
  ).bind(body.name, body.whatsappNumber, body.description || null, body.logoUrl || null, user.id).run();

  const business = await c.env.DB.prepare("SELECT * FROM businesses WHERE user_id = ?").bind(user.id).first();
  return c.json(business);
});

// Public Business Access
app.get("/api/businesses/:slug", async (c) => {
  const slug = c.req.param("slug");
  const business = await c.env.DB.prepare("SELECT * FROM businesses WHERE slug = ?").bind(slug).first();
  if (!business) return c.json({ error: "Business not found" }, 404);

  const productsRaw = await c.env.DB.prepare("SELECT * FROM products WHERE business_id = ? ORDER BY created_at DESC").bind(business.id).all();
  const servicesRaw = await c.env.DB.prepare("SELECT * FROM services WHERE business_id = ? ORDER BY created_at DESC").bind(business.id).all();
  const categoriesRaw = await c.env.DB.prepare("SELECT * FROM categories WHERE business_id = ? ORDER BY name ASC").bind(business.id).all();

  return c.json({
    business,
    products: productsRaw.results,
    services: servicesRaw.results,
    categories: categoriesRaw.results
  });
});

// Category endpoints
app.post("/api/categories", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const business = await c.env.DB.prepare("SELECT id FROM businesses WHERE user_id = ?").bind(user.id).first();
  if (!business) return c.json({ error: "No business" }, 404);

  const result = await c.env.DB.prepare(
    "INSERT INTO categories (business_id, name) VALUES (?, ?)"
  ).bind(business.id, body.name).run();

  const category = await c.env.DB.prepare("SELECT * FROM categories WHERE id = ?").bind(result.meta.last_row_id).first();
  return c.json(category, 201);
});

app.delete("/api/categories/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const business = await c.env.DB.prepare("SELECT id FROM businesses WHERE user_id = ?").bind(user.id).first();
  if (!business) return c.json({ error: "No business" }, 404);
  await c.env.DB.prepare("DELETE FROM categories WHERE id = ? AND business_id = ?").bind(id, business.id).run();
  return c.json({ success: true });
});

// Product endpoints
app.post("/api/products", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const business = await c.env.DB.prepare("SELECT id FROM businesses WHERE user_id = ?").bind(user.id).first();
  if (!business) return c.json({ error: "No business" }, 404);

  const result = await c.env.DB.prepare(
    "INSERT INTO products (business_id, category_id, name, price, image_url) VALUES (?, ?, ?, ?, ?)"
  ).bind(business.id, body.categoryId || null, body.name, body.price, body.imageUrl || null).run();

  const product = await c.env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(result.meta.last_row_id).first();
  return c.json(product, 201);
});

app.put("/api/products/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const body = await c.req.json();
  const business = await c.env.DB.prepare("SELECT id FROM businesses WHERE user_id = ?").bind(user.id).first();
  if (!business) return c.json({ error: "No business" }, 404);

  await c.env.DB.prepare(
    "UPDATE products SET name = ?, price = ?, category_id = ?, image_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND business_id = ?"
  ).bind(body.name, body.price, body.categoryId || null, body.imageUrl || null, id, business.id).run();

  const product = await c.env.DB.prepare("SELECT * FROM products WHERE id = ?").bind(id).first();
  return c.json(product);
});

app.delete("/api/products/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const business = await c.env.DB.prepare("SELECT id FROM businesses WHERE user_id = ?").bind(user.id).first();
  if (!business) return c.json({ error: "No business" }, 404);
  await c.env.DB.prepare("DELETE FROM products WHERE id = ? AND business_id = ?").bind(id, business.id).run();
  return c.json({ success: true });
});

// Service endpoints
app.post("/api/services", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const business = await c.env.DB.prepare("SELECT id FROM businesses WHERE user_id = ?").bind(user.id).first();
  if (!business) return c.json({ error: "No business" }, 404);

  const result = await c.env.DB.prepare(
    "INSERT INTO services (business_id, name, starting_price) VALUES (?, ?, ?)"
  ).bind(business.id, body.name, body.startingPrice).run();

  const service = await c.env.DB.prepare("SELECT * FROM services WHERE id = ?").bind(result.meta.last_row_id).first();
  return c.json(service, 201);
});

app.delete("/api/services/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const business = await c.env.DB.prepare("SELECT id FROM businesses WHERE user_id = ?").bind(user.id).first();
  if (!business) return c.json({ error: "No business" }, 404);
  await c.env.DB.prepare("DELETE FROM services WHERE id = ? AND business_id = ?").bind(id, business.id).run();
  return c.json({ success: true });
});

// Order Logs (Internal Reporting)
app.post("/api/orders", async (c) => {
  const body = await c.req.json();
  await c.env.DB.prepare(
    "INSERT INTO orders (business_id, customer_note, total_price, status, items_summary) VALUES (?, ?, ?, 'pending', ?)"
  ).bind(body.businessId, body.customerNote || null, body.totalPrice, body.itemsSummary).run();
  return c.json({ success: true }, 201);
});

app.get("/api/orders/me", authMiddleware, async (c) => {
  const user = c.get("user");
  const business = await c.env.DB.prepare("SELECT id FROM businesses WHERE user_id = ?").bind(user.id).first();
  if (!business) return c.json([], 200);

  const orders = await c.env.DB.prepare(
    "SELECT * FROM orders WHERE business_id = ? ORDER BY created_at DESC"
  ).bind(business.id).all();
  return c.json(orders.results);
});

export default app;
