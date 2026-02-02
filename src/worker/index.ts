import { Hono } from "hono";
import { createClient, User } from "@supabase/supabase-js";
import { getCookie } from "hono/cookie";

const app = new Hono<{ Bindings: SupabaseEnv; Variables: { user: User } }>();

interface SupabaseEnv {
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  DB: D1Database;
}

const getSupabase = (env: SupabaseEnv) => {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);
};

import { Context } from "hono";

// Middleware to verify Supabase JWT
const authMiddleware = async (c: Context, next: () => Promise<void>) => {
  const authHeader = c.req.header("Authorization");
  let token = "";

  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.substring(7);
  } else {
    token = getCookie(c, "sb-access-token") || "";
  }

  if (!token) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const supabase = getSupabase(c.env);
  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("user", user);
  await next();
};

// Profile & Onboarding endpoints
app.get("/api/profile", authMiddleware, async (c) => {
  const user = c.get("user");
  try {
    let profile = await c.env.DB.prepare("SELECT * FROM profiles WHERE user_id = ?").bind(user.id).first();

    if (!profile) {
      // Create default profile if it doesn't exist
      await c.env.DB.prepare("INSERT INTO profiles (user_id) VALUES (?)").bind(user.id).run();
      profile = await c.env.DB.prepare("SELECT * FROM profiles WHERE user_id = ?").bind(user.id).first();
    }

    return c.json(profile);
  } catch (err) {
    console.error('Profile DB error:', err);
    return c.json({ error: err instanceof Error ? err.message : 'Database error' }, 500);
  }
});

app.post("/api/onboarding/complete", authMiddleware, async (c) => {
  const user = c.get("user");
  try {
    await c.env.DB.prepare("UPDATE profiles SET onboarding_completed = 1, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?").bind(user.id).run();
    return c.json({ success: true });
  } catch (err) {
    console.error('Onboarding update error:', err);
    return c.json({ error: err instanceof Error ? err.message : 'Database error' }, 500);
  }
});

// Business endpoints
app.get("/api/businesses/me", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const supabase = getSupabase(c.env);
  const { data: business, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error || !business) {
    return c.json({ error: "Business not found" }, 404);
  }

  return c.json(business);
});

app.post("/api/businesses", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const body = await c.req.json();
  const supabase = getSupabase(c.env);

  // Check if user already has a business
  const { data: existing } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (existing) {
    return c.json({ error: "Business already exists" }, 400);
  }

  // Check if slug is taken
  const { data: slugTaken } = await supabase
    .from("businesses")
    .select("id")
    .eq("slug", body.slug)
    .single();

  if (slugTaken) {
    return c.json({ error: "This link is already taken" }, 400);
  }

  const { data: business, error: insertError } = await supabase
    .from("businesses")
    .insert({
      user_id: user.id,
      name: body.name,
      slug: body.slug,
      description: body.description,
      logo_url: body.logoUrl,
      whatsapp_number: body.whatsappNumber,
      plan: 'free'
    })
    .select()
    .single();

  if (insertError) {
    return c.json({ error: insertError.message }, 500);
  }

  return c.json(business);
});

app.put("/api/businesses", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const body = await c.req.json();

  if (!body.name || !body.whatsappNumber) {
    return c.json({ error: "Name and WhatsApp number are required" }, 400);
  }

  const supabase = getSupabase(c.env);
  const { data: business, error } = await supabase
    .from("businesses")
    .update({
      name: body.name,
      description: body.description,
      logo_url: body.logoUrl,
      whatsapp_number: body.whatsappNumber,
      updated_at: new Date().toISOString()
    })
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json(business);
});

// Product endpoints
app.get("/api/products", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const supabase = getSupabase(c.env);
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!business) {
    return c.json([]);
  }

  const { data: products, error } = await supabase
    .from("products")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json(products);
});

app.post("/api/products", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const body = await c.req.json();
  const supabase = getSupabase(c.env);

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!business) {
    return c.json({ error: "Business not found" }, 404);
  }

  // Check product limit
  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("business_id", business.id);

  if (count !== null && count >= 50) {
    return c.json({ error: "Product limit reached (50 max)" }, 400);
  }

  const { data: product, error } = await supabase
    .from("products")
    .insert({
      business_id: business.id,
      category_id: body.categoryId,
      name: body.name,
      price: body.price,
      image_url: body.imageUrl
    })
    .select()
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json(product);
});

app.put("/api/products/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const productId = c.req.param("id");
  const body = await c.req.json();
  const supabase = getSupabase(c.env);

  if (!body.name || typeof body.price !== "number") {
    return c.json({ error: "Name and price are required" }, 400);
  }

  // Ensure product belongs to user's business
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!business) {
    return c.json({ error: "Business not found" }, 404);
  }

  const { data: product, error } = await supabase
    .from("products")
    .update({
      category_id: body.categoryId,
      name: body.name,
      price: body.price,
      image_url: body.imageUrl,
      updated_at: new Date().toISOString()
    })
    .eq("id", productId)
    .eq("business_id", business.id)
    .select()
    .single();

  if (error || !product) {
    return c.json({ error: "Product not found or unauthorized" }, 404);
  }

  return c.json(product);
});

app.delete("/api/products/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const productId = c.req.param("id");
  const supabase = getSupabase(c.env);

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!business) {
    return c.json({ error: "Business not found" }, 404);
  }

  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId)
    .eq("business_id", business.id);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ success: true });
});

// Service endpoints
app.get("/api/services", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const supabase = getSupabase(c.env);
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!business) {
    return c.json([]);
  }

  const { data: services, error } = await supabase
    .from("services")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json(services);
});

app.post("/api/services", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const body = await c.req.json();
  const supabase = getSupabase(c.env);

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!business) {
    return c.json({ error: "Business not found" }, 404);
  }

  // Check service limit
  const { count } = await supabase
    .from("services")
    .select("*", { count: "exact", head: true })
    .eq("business_id", business.id);

  if (count !== null && count >= 20) {
    return c.json({ error: "Service limit reached (20 max)" }, 400);
  }

  const { data: service, error } = await supabase
    .from("services")
    .insert({
      business_id: business.id,
      name: body.name,
      starting_price: body.startingPrice
    })
    .select()
    .single();

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json(service);
});

app.put("/api/services/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const serviceId = c.req.param("id");
  const body = await c.req.json();
  const supabase = getSupabase(c.env);

  if (!body.name || typeof body.startingPrice !== "number") {
    return c.json({ error: "Name and starting price are required" }, 400);
  }

  // Ensure service belongs to user's business
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!business) {
    return c.json({ error: "Business not found" }, 404);
  }

  const { data: service, error } = await supabase
    .from("services")
    .update({
      name: body.name,
      starting_price: body.startingPrice,
      updated_at: new Date().toISOString()
    })
    .eq("id", serviceId)
    .eq("business_id", business.id)
    .select()
    .single();

  if (error || !service) {
    return c.json({ error: "Service not found or unauthorized" }, 404);
  }

  return c.json(service);
});

app.delete("/api/services/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  if (!user) {
    return c.json({ error: "Unauthorized" }, 401);
  }
  const serviceId = c.req.param("id");
  const supabase = getSupabase(c.env);

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!business) {
    return c.json({ error: "Business not found" }, 404);
  }

  const { error } = await supabase
    .from("services")
    .delete()
    .eq("id", serviceId)
    .eq("business_id", business.id);

  if (error) {
    return c.json({ error: error.message }, 500);
  }

  return c.json({ success: true });
});

// Category endpoints
app.get("/api/categories", authMiddleware, async (c) => {
  const user = c.get("user");
  const supabase = getSupabase(c.env);

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!business) return c.json([]);

  const { data: categories, error } = await supabase
    .from("categories")
    .select("*")
    .eq("business_id", business.id)
    .order("name", { ascending: true });

  if (error) return c.json({ error: error.message }, 500);
  return c.json(categories);
});

app.post("/api/categories", authMiddleware, async (c) => {
  const user = c.get("user");
  const body = await c.req.json();
  const supabase = getSupabase(c.env);

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!business) return c.json({ error: "Business not found" }, 404);

  const { data: category, error } = await supabase
    .from("categories")
    .insert({ business_id: business.id, name: body.name })
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(category);
});

app.delete("/api/categories/:id", authMiddleware, async (c) => {
  const user = c.get("user");
  const id = c.req.param("id");
  const supabase = getSupabase(c.env);

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!business) return c.json({ error: "Business not found" }, 404);

  const { error } = await supabase
    .from("categories")
    .delete()
    .eq("id", id)
    .eq("business_id", business.id);

  if (error) return c.json({ error: error.message }, 500);
  return c.json({ success: true });
});

// Order endpoints (logging)
app.post("/api/orders", async (c) => {
  const body = await c.req.json();
  const supabase = getSupabase(c.env);

  // No auth required for customers placing orders
  // We identify the business by the ID in the body
  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      business_id: body.businessId,
      customer_note: body.customerNote,
      total_price: body.totalPrice,
      items_summary: body.itemsSummary,
      payment_status: 'pending' // PRD: "Design order objects to support payment status"
    })
    .select()
    .single();

  if (error) return c.json({ error: error.message }, 500);
  return c.json(order);
});

app.get("/api/orders/me", authMiddleware, async (c) => {
  const user = c.get("user");
  const supabase = getSupabase(c.env);

  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!business) return c.json([]);

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  if (error) return c.json({ error: error.message }, 500);
  return c.json(orders);
});

// Public business page endpoint
app.get("/api/businesses/:slug", async (c) => {
  const slug = c.req.param("slug");
  const supabase = getSupabase(c.env);

  const { data: business, error: businessError } = await supabase
    .from("businesses")
    .select("id, name, slug, description, logo_url, whatsapp_number")
    .eq("slug", slug)
    .single();

  if (businessError || !business) {
    return c.json({ error: "Business not found" }, 404);
  }

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  const { data: services } = await supabase
    .from("services")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  const { data: categories } = await supabase
    .from("categories")
    .select("*")
    .eq("business_id", business.id)
    .order("name", { ascending: true });

  return c.json({
    business,
    products: products || [],
    services: services || [],
    categories: categories || []
  });
});

export default app;
