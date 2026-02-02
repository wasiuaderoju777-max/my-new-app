import z from "zod";

export const BusinessSchema = z.object({
  id: z.number(),
  user_id: z.string(),
  name: z.string(),
  slug: z.string(),
  description: z.string().optional().nullable(),
  logo_url: z.string().optional().nullable(),
  whatsapp_number: z.string(),
  plan: z.string(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CategorySchema = z.object({
  id: z.number(),
  business_id: z.number(),
  name: z.string(),
  created_at: z.string(),
});

export const ProductSchema = z.object({
  id: z.number(),
  business_id: z.number(),
  category_id: z.number().optional().nullable(),
  name: z.string(),
  price: z.number(),
  image_url: z.string().optional().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const OrderSchema = z.object({
  id: z.number(),
  business_id: z.number(),
  customer_note: z.string().optional().nullable(),
  total_price: z.number(),
  payment_status: z.enum(["pending", "paid", "failed"]).default("pending"),
  items_summary: z.string(), // Text log of what was ordered
  created_at: z.string(),
});

export const ServiceSchema = z.object({
  id: z.number(),
  business_id: z.number(),
  name: z.string(),
  starting_price: z.number(),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Business = z.infer<typeof BusinessSchema>;
export type Category = z.infer<typeof CategorySchema>;
export type Product = z.infer<typeof ProductSchema>;
export type Order = z.infer<typeof OrderSchema>;
export type Service = z.infer<typeof ServiceSchema>;
