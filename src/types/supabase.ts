
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRoleType =
  | 'super_admin'
  | 'admin'
  | 'catalog_manager'
  | 'inventory_manager'
  | 'order_manager'
  | 'support_agent'
  | 'customer';

export type OrderStatusType =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'refunded';

export type PaymentStatusType =
  | 'pending'
  | 'authorized'
  | 'paid'
  | 'failed'
  | 'refunded'
  | 'partially_refunded';

export type Database = {
  
  "public": {
          Tables: {
            "admin_audit_logs": {
                  Row: {
                    "action": string,"admin_id": string | null,"after_values": Json | null,"before_values": Json | null,"created_at": string | null,"entity_id": string | null,"entity_type": string,"id": string,"ip_address": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"admin_id"?: string | null,"after_values"?: Json | null,"before_values"?: Json | null,"created_at"?: string | null,"entity_id"?: string | null,"entity_type": string,"id"?: string,"ip_address"?: string | null
                  }
                  Update: {
                    "action"?: string,"admin_id"?: string | null,"after_values"?: Json | null,"before_values"?: Json | null,"created_at"?: string | null,"entity_id"?: string | null,"entity_type"?: string,"id"?: string,"ip_address"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"admin_emails": {
                  Row: {
                    "created_at": string,"email": string,"is_active": boolean,"notes": string | null,"role": Database["public"]['Enums']["user_role_type"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"email": string,"is_active"?: boolean,"notes"?: string | null,"role"?: Database["public"]['Enums']["user_role_type"],"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"email"?: string,"is_active"?: boolean,"notes"?: string | null,"role"?: Database["public"]['Enums']["user_role_type"],"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"banners": {
                  Row: {
                    "banner_type": string,"created_at": string | null,"description": string | null,"desktop_image_url": string,"display_order": number | null,"id": string,"is_active": boolean | null,"mobile_image_url": string,"primary_cta_label": string | null,"primary_cta_link": string | null,"secondary_cta_label": string | null,"secondary_cta_link": string | null,"tagline": string | null,"title_line_1": string,"title_line_2": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "banner_type": string,"created_at"?: string | null,"description"?: string | null,"desktop_image_url": string,"display_order"?: number | null,"id"?: string,"is_active"?: boolean | null,"mobile_image_url": string,"primary_cta_label"?: string | null,"primary_cta_link"?: string | null,"secondary_cta_label"?: string | null,"secondary_cta_link"?: string | null,"tagline"?: string | null,"title_line_1": string,"title_line_2"?: string | null
                  }
                  Update: {
                    "banner_type"?: string,"created_at"?: string | null,"description"?: string | null,"desktop_image_url"?: string,"display_order"?: number | null,"id"?: string,"is_active"?: boolean | null,"mobile_image_url"?: string,"primary_cta_label"?: string | null,"primary_cta_link"?: string | null,"secondary_cta_label"?: string | null,"secondary_cta_link"?: string | null,"tagline"?: string | null,"title_line_1"?: string,"title_line_2"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"cart_items": {
                  Row: {
                    "cart_id": string,"created_at": string | null,"id": string,"product_id": string,"quantity": number,"selected": boolean | null,"updated_at": string | null,"variant_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "cart_id": string,"created_at"?: string | null,"id"?: string,"product_id": string,"quantity"?: number,"selected"?: boolean | null,"updated_at"?: string | null,"variant_id"?: string | null
                  }
                  Update: {
                    "cart_id"?: string,"created_at"?: string | null,"id"?: string,"product_id"?: string,"quantity"?: number,"selected"?: boolean | null,"updated_at"?: string | null,"variant_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "cart_items_cart_id_fkey"
      columns: ["cart_id"]
isOneToOne: false
      referencedRelation: "carts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "cart_items_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "cart_items_variant_id_fkey"
      columns: ["variant_id"]
isOneToOne: false
      referencedRelation: "product_variants"
      referencedColumns: ["id"]
    }
                  ]
                },"carts": {
                  Row: {
                    "created_at": string | null,"guest_token": string | null,"id": string,"updated_at": string | null,"user_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string | null,"guest_token"?: string | null,"id"?: string,"updated_at"?: string | null,"user_id"?: string | null
                  }
                  Update: {
                    "created_at"?: string | null,"guest_token"?: string | null,"id"?: string,"updated_at"?: string | null,"user_id"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"categories": {
                  Row: {
                    "created_at": string | null,"description": string | null,"display_order": number | null,"id": string,"image_url": string | null,"is_active": boolean | null,"name": string,"parent_id": string | null,"seo_description": string | null,"seo_title": string | null,"slug": string,"updated_at": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string | null,"description"?: string | null,"display_order"?: number | null,"id"?: string,"image_url"?: string | null,"is_active"?: boolean | null,"name": string,"parent_id"?: string | null,"seo_description"?: string | null,"seo_title"?: string | null,"slug": string,"updated_at"?: string | null
                  }
                  Update: {
                    "created_at"?: string | null,"description"?: string | null,"display_order"?: number | null,"id"?: string,"image_url"?: string | null,"is_active"?: boolean | null,"name"?: string,"parent_id"?: string | null,"seo_description"?: string | null,"seo_title"?: string | null,"slug"?: string,"updated_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "categories_parent_id_fkey"
      columns: ["parent_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    }
                  ]
                },"collection_products": {
                  Row: {
                    "collection_id": string,"created_at": string | null,"display_order": number | null,"id": string,"product_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "collection_id": string,"created_at"?: string | null,"display_order"?: number | null,"id"?: string,"product_id": string
                  }
                  Update: {
                    "collection_id"?: string,"created_at"?: string | null,"display_order"?: number | null,"id"?: string,"product_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "collection_products_collection_id_fkey"
      columns: ["collection_id"]
isOneToOne: false
      referencedRelation: "collections"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "collection_products_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"collections": {
                  Row: {
                    "banner_image": string | null,"created_at": string | null,"description": string | null,"display_order": number | null,"id": string,"is_active": boolean | null,"slug": string,"title": string,"updated_at": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "banner_image"?: string | null,"created_at"?: string | null,"description"?: string | null,"display_order"?: number | null,"id"?: string,"is_active"?: boolean | null,"slug": string,"title": string,"updated_at"?: string | null
                  }
                  Update: {
                    "banner_image"?: string | null,"created_at"?: string | null,"description"?: string | null,"display_order"?: number | null,"id"?: string,"is_active"?: boolean | null,"slug"?: string,"title"?: string,"updated_at"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"contact_messages": {
                  Row: {
                    "created_at": string | null,"email": string,"full_name": string,"id": string,"message": string,"phone": string | null,"status": string | null,"subject": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string | null,"email": string,"full_name": string,"id"?: string,"message": string,"phone"?: string | null,"status"?: string | null,"subject"?: string | null
                  }
                  Update: {
                    "created_at"?: string | null,"email"?: string,"full_name"?: string,"id"?: string,"message"?: string,"phone"?: string | null,"status"?: string | null,"subject"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"content_pages": {
                  Row: {
                    "content_markdown": string,"id": string,"seo_description": string | null,"seo_title": string | null,"slug": string,"title": string,"updated_at": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "content_markdown": string,"id"?: string,"seo_description"?: string | null,"seo_title"?: string | null,"slug": string,"title": string,"updated_at"?: string | null
                  }
                  Update: {
                    "content_markdown"?: string,"id"?: string,"seo_description"?: string | null,"seo_title"?: string | null,"slug"?: string,"title"?: string,"updated_at"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"coupon_redemptions": {
                  Row: {
                    "coupon_id": string,"created_at": string | null,"discount_applied_inr": number,"id": string,"order_id": string | null,"user_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "coupon_id": string,"created_at"?: string | null,"discount_applied_inr": number,"id"?: string,"order_id"?: string | null,"user_id"?: string | null
                  }
                  Update: {
                    "coupon_id"?: string,"created_at"?: string | null,"discount_applied_inr"?: number,"id"?: string,"order_id"?: string | null,"user_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "coupon_redemptions_coupon_id_fkey"
      columns: ["coupon_id"]
isOneToOne: false
      referencedRelation: "coupons"
      referencedColumns: ["id"]
    }
                  ]
                },"coupons": {
                  Row: {
                    "code": string,"created_at": string | null,"discount_type": string,"discount_value": number,"end_date": string | null,"id": string,"is_active": boolean | null,"max_discount_inr": number | null,"min_order_amount_inr": number | null,"per_customer_limit": number | null,"start_date": string | null,"usage_limit": number | null,"used_count": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "code": string,"created_at"?: string | null,"discount_type": string,"discount_value": number,"end_date"?: string | null,"id"?: string,"is_active"?: boolean | null,"max_discount_inr"?: number | null,"min_order_amount_inr"?: number | null,"per_customer_limit"?: number | null,"start_date"?: string | null,"usage_limit"?: number | null,"used_count"?: number | null
                  }
                  Update: {
                    "code"?: string,"created_at"?: string | null,"discount_type"?: string,"discount_value"?: number,"end_date"?: string | null,"id"?: string,"is_active"?: boolean | null,"max_discount_inr"?: number | null,"min_order_amount_inr"?: number | null,"per_customer_limit"?: number | null,"start_date"?: string | null,"usage_limit"?: number | null,"used_count"?: number | null
                  }
                  Relationships: [
                    
                  ]
                },"customer_activity_logs": {
                  Row: {
                    "activity_type": string,"created_at": string | null,"id": string,"ip_address": string | null,"metadata": Json | null,"session_id": string | null,"user_agent": string | null,"user_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "activity_type": string,"created_at"?: string | null,"id"?: string,"ip_address"?: string | null,"metadata"?: Json | null,"session_id"?: string | null,"user_agent"?: string | null,"user_id"?: string | null
                  }
                  Update: {
                    "activity_type"?: string,"created_at"?: string | null,"id"?: string,"ip_address"?: string | null,"metadata"?: Json | null,"session_id"?: string | null,"user_agent"?: string | null,"user_id"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"customer_addresses": {
                  Row: {
                    "address_type": string | null,"apartment": string | null,"city": string,"country": string | null,"created_at": string | null,"full_name": string,"id": string,"is_default": boolean | null,"landmark": string | null,"phone": string,"pincode": string,"state": string,"street_address": string,"updated_at": string | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "address_type"?: string | null,"apartment"?: string | null,"city": string,"country"?: string | null,"created_at"?: string | null,"full_name": string,"id"?: string,"is_default"?: boolean | null,"landmark"?: string | null,"phone": string,"pincode": string,"state": string,"street_address": string,"updated_at"?: string | null,"user_id": string
                  }
                  Update: {
                    "address_type"?: string | null,"apartment"?: string | null,"city"?: string,"country"?: string | null,"created_at"?: string | null,"full_name"?: string,"id"?: string,"is_default"?: boolean | null,"landmark"?: string | null,"phone"?: string,"pincode"?: string,"state"?: string,"street_address"?: string,"updated_at"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"customer_preferences": {
                  Row: {
                    "created_at": string | null,"favorite_fabrics": (string)[] | null,"id": string,"newsletter_subscribed": boolean | null,"preferred_occasions": (string)[] | null,"sms_updates_enabled": boolean | null,"updated_at": string | null,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string | null,"favorite_fabrics"?: (string)[] | null,"id"?: string,"newsletter_subscribed"?: boolean | null,"preferred_occasions"?: (string)[] | null,"sms_updates_enabled"?: boolean | null,"updated_at"?: string | null,"user_id": string
                  }
                  Update: {
                    "created_at"?: string | null,"favorite_fabrics"?: (string)[] | null,"id"?: string,"newsletter_subscribed"?: boolean | null,"preferred_occasions"?: (string)[] | null,"sms_updates_enabled"?: boolean | null,"updated_at"?: string | null,"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"homepage_sections": {
                  Row: {
                    "content": Json | null,"display_order": number | null,"id": string,"is_active": boolean | null,"section_key": string,"subtitle": string | null,"title": string,"updated_at": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "content"?: Json | null,"display_order"?: number | null,"id"?: string,"is_active"?: boolean | null,"section_key": string,"subtitle"?: string | null,"title": string,"updated_at"?: string | null
                  }
                  Update: {
                    "content"?: Json | null,"display_order"?: number | null,"id"?: string,"is_active"?: boolean | null,"section_key"?: string,"subtitle"?: string | null,"title"?: string,"updated_at"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"inventory_movements": {
                  Row: {
                    "created_at": string | null,"created_by": string | null,"id": string,"new_quantity": number,"previous_quantity": number,"product_id": string,"quantity_changed": number,"reason": string,"reference_id": string | null,"variant_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string | null,"created_by"?: string | null,"id"?: string,"new_quantity": number,"previous_quantity": number,"product_id": string,"quantity_changed": number,"reason": string,"reference_id"?: string | null,"variant_id"?: string | null
                  }
                  Update: {
                    "created_at"?: string | null,"created_by"?: string | null,"id"?: string,"new_quantity"?: number,"previous_quantity"?: number,"product_id"?: string,"quantity_changed"?: number,"reason"?: string,"reference_id"?: string | null,"variant_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "inventory_movements_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "inventory_movements_variant_id_fkey"
      columns: ["variant_id"]
isOneToOne: false
      referencedRelation: "product_variants"
      referencedColumns: ["id"]
    }
                  ]
                },"inventory_reservations": {
                  Row: {
                    "created_at": string | null,"expires_at": string,"id": string,"is_confirmed": boolean | null,"product_id": string,"quantity": number,"session_or_cart_id": string,"variant_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string | null,"expires_at": string,"id"?: string,"is_confirmed"?: boolean | null,"product_id": string,"quantity": number,"session_or_cart_id": string,"variant_id"?: string | null
                  }
                  Update: {
                    "created_at"?: string | null,"expires_at"?: string,"id"?: string,"is_confirmed"?: boolean | null,"product_id"?: string,"quantity"?: number,"session_or_cart_id"?: string,"variant_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "inventory_reservations_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "inventory_reservations_variant_id_fkey"
      columns: ["variant_id"]
isOneToOne: false
      referencedRelation: "product_variants"
      referencedColumns: ["id"]
    }
                  ]
                },"navigation_items": {
                  Row: {
                    "created_at": string | null,"display_order": number | null,"id": string,"is_active": boolean | null,"name": string,"parent_id": string | null,"path": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string | null,"display_order"?: number | null,"id"?: string,"is_active"?: boolean | null,"name": string,"parent_id"?: string | null,"path": string
                  }
                  Update: {
                    "created_at"?: string | null,"display_order"?: number | null,"id"?: string,"is_active"?: boolean | null,"name"?: string,"parent_id"?: string | null,"path"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "navigation_items_parent_id_fkey"
      columns: ["parent_id"]
isOneToOne: false
      referencedRelation: "navigation_items"
      referencedColumns: ["id"]
    }
                  ]
                },"newsletter_subscribers": {
                  Row: {
                    "created_at": string | null,"email": string,"id": string,"is_active": boolean | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string | null,"email": string,"id"?: string,"is_active"?: boolean | null
                  }
                  Update: {
                    "created_at"?: string | null,"email"?: string,"id"?: string,"is_active"?: boolean | null
                  }
                  Relationships: [
                    
                  ]
                },"order_items": {
                  Row: {
                    "created_at": string | null,"id": string,"image_url": string | null,"order_id": string,"product_id": string | null,"product_sku": string | null,"product_title": string,"quantity": number,"total_price_inr": number,"unit_price_inr": number,"variant_details": Json | null,"variant_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string | null,"id"?: string,"image_url"?: string | null,"order_id": string,"product_id"?: string | null,"product_sku"?: string | null,"product_title": string,"quantity": number,"total_price_inr": number,"unit_price_inr": number,"variant_details"?: Json | null,"variant_id"?: string | null
                  }
                  Update: {
                    "created_at"?: string | null,"id"?: string,"image_url"?: string | null,"order_id"?: string,"product_id"?: string | null,"product_sku"?: string | null,"product_title"?: string,"quantity"?: number,"total_price_inr"?: number,"unit_price_inr"?: number,"variant_details"?: Json | null,"variant_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "order_items_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "order_items_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "order_items_variant_id_fkey"
      columns: ["variant_id"]
isOneToOne: false
      referencedRelation: "product_variants"
      referencedColumns: ["id"]
    }
                  ]
                },"order_status_history": {
                  Row: {
                    "changed_by": string | null,"created_at": string | null,"id": string,"new_status": Database["public"]['Enums']["order_status_type"],"note": string | null,"order_id": string,"previous_status": Database["public"]['Enums']["order_status_type"] | null
                  }
                  ComputedFields: never
                  Insert: {
                    "changed_by"?: string | null,"created_at"?: string | null,"id"?: string,"new_status": Database["public"]['Enums']["order_status_type"],"note"?: string | null,"order_id": string,"previous_status"?: Database["public"]['Enums']["order_status_type"] | null
                  }
                  Update: {
                    "changed_by"?: string | null,"created_at"?: string | null,"id"?: string,"new_status"?: Database["public"]['Enums']["order_status_type"],"note"?: string | null,"order_id"?: string,"previous_status"?: Database["public"]['Enums']["order_status_type"] | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "order_status_history_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    }
                  ]
                },"orders": {
                  Row: {
                    "admin_notes": string | null,"billing_address": NonNullable<Json>,"coupon_code": string | null,"courier_name": string | null,"created_at": string | null,"customer_email": string,"customer_name": string,"customer_notes": string | null,"customer_phone": string,"delivery_option": string | null,"discount_inr": number | null,"id": string,"idempotency_key": string | null,"order_number": string,"order_status": Database["public"]['Enums']["order_status_type"] | null,"payment_method": string,"payment_status": Database["public"]['Enums']["payment_status_type"] | null,"shipping_address": NonNullable<Json>,"shipping_fee_inr": number | null,"subtotal_inr": number,"tax_amount_inr": number | null,"total_inr": number,"tracking_id": string | null,"updated_at": string | null,"user_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "admin_notes"?: string | null,"billing_address": NonNullable<Json>,"coupon_code"?: string | null,"courier_name"?: string | null,"created_at"?: string | null,"customer_email": string,"customer_name": string,"customer_notes"?: string | null,"customer_phone": string,"delivery_option"?: string | null,"discount_inr"?: number | null,"id"?: string,"idempotency_key"?: string | null,"order_number": string,"order_status"?: Database["public"]['Enums']["order_status_type"] | null,"payment_method": string,"payment_status"?: Database["public"]['Enums']["payment_status_type"] | null,"shipping_address": NonNullable<Json>,"shipping_fee_inr"?: number | null,"subtotal_inr": number,"tax_amount_inr"?: number | null,"total_inr": number,"tracking_id"?: string | null,"updated_at"?: string | null,"user_id"?: string | null
                  }
                  Update: {
                    "admin_notes"?: string | null,"billing_address"?: NonNullable<Json>,"coupon_code"?: string | null,"courier_name"?: string | null,"created_at"?: string | null,"customer_email"?: string,"customer_name"?: string,"customer_notes"?: string | null,"customer_phone"?: string,"delivery_option"?: string | null,"discount_inr"?: number | null,"id"?: string,"idempotency_key"?: string | null,"order_number"?: string,"order_status"?: Database["public"]['Enums']["order_status_type"] | null,"payment_method"?: string,"payment_status"?: Database["public"]['Enums']["payment_status_type"] | null,"shipping_address"?: NonNullable<Json>,"shipping_fee_inr"?: number | null,"subtotal_inr"?: number,"tax_amount_inr"?: number | null,"total_inr"?: number,"tracking_id"?: string | null,"updated_at"?: string | null,"user_id"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"payment_events": {
                  Row: {
                    "created_at": string | null,"event_type": string,"id": string,"payload": NonNullable<Json>,"payment_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string | null,"event_type": string,"id"?: string,"payload": NonNullable<Json>,"payment_id"?: string | null
                  }
                  Update: {
                    "created_at"?: string | null,"event_type"?: string,"id"?: string,"payload"?: NonNullable<Json>,"payment_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "payment_events_payment_id_fkey"
      columns: ["payment_id"]
isOneToOne: false
      referencedRelation: "payments"
      referencedColumns: ["id"]
    }
                  ]
                },"payments": {
                  Row: {
                    "amount_inr": number,"created_at": string | null,"currency": string | null,"error_code": string | null,"error_description": string | null,"id": string,"order_id": string,"payment_method_details": Json | null,"provider": string,"provider_order_id": string | null,"provider_payment_id": string | null,"provider_signature": string | null,"status": Database["public"]['Enums']["payment_status_type"],"updated_at": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "amount_inr": number,"created_at"?: string | null,"currency"?: string | null,"error_code"?: string | null,"error_description"?: string | null,"id"?: string,"order_id": string,"payment_method_details"?: Json | null,"provider": string,"provider_order_id"?: string | null,"provider_payment_id"?: string | null,"provider_signature"?: string | null,"status"?: Database["public"]['Enums']["payment_status_type"],"updated_at"?: string | null
                  }
                  Update: {
                    "amount_inr"?: number,"created_at"?: string | null,"currency"?: string | null,"error_code"?: string | null,"error_description"?: string | null,"id"?: string,"order_id"?: string,"payment_method_details"?: Json | null,"provider"?: string,"provider_order_id"?: string | null,"provider_payment_id"?: string | null,"provider_signature"?: string | null,"status"?: Database["public"]['Enums']["payment_status_type"],"updated_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "payments_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    }
                  ]
                },"product_media": {
                  Row: {
                    "alt_text": string | null,"created_at": string | null,"display_order": number | null,"id": string,"is_primary": boolean | null,"media_type": string | null,"product_id": string,"storage_path": string | null,"title": string | null,"url": string,"variant_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "alt_text"?: string | null,"created_at"?: string | null,"display_order"?: number | null,"id"?: string,"is_primary"?: boolean | null,"media_type"?: string | null,"product_id": string,"storage_path"?: string | null,"title"?: string | null,"url": string,"variant_id"?: string | null
                  }
                  Update: {
                    "alt_text"?: string | null,"created_at"?: string | null,"display_order"?: number | null,"id"?: string,"is_primary"?: boolean | null,"media_type"?: string | null,"product_id"?: string,"storage_path"?: string | null,"title"?: string | null,"url"?: string,"variant_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "product_media_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "product_media_variant_id_fkey"
      columns: ["variant_id"]
isOneToOne: false
      referencedRelation: "product_variants"
      referencedColumns: ["id"]
    }
                  ]
                },"product_reviews": {
                  Row: {
                    "content": string | null,"created_at": string | null,"id": string,"photos": (string)[] | null,"product_id": string,"rating": number,"reviewer_name": string,"status": string | null,"title": string | null,"user_id": string | null,"verified_purchase": boolean | null
                  }
                  ComputedFields: never
                  Insert: {
                    "content"?: string | null,"created_at"?: string | null,"id"?: string,"photos"?: (string)[] | null,"product_id": string,"rating": number,"reviewer_name": string,"status"?: string | null,"title"?: string | null,"user_id"?: string | null,"verified_purchase"?: boolean | null
                  }
                  Update: {
                    "content"?: string | null,"created_at"?: string | null,"id"?: string,"photos"?: (string)[] | null,"product_id"?: string,"rating"?: number,"reviewer_name"?: string,"status"?: string | null,"title"?: string | null,"user_id"?: string | null,"verified_purchase"?: boolean | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "product_reviews_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"product_variants": {
                  Row: {
                    "attributes": Json | null,"color_hex": string | null,"color_name": string | null,"created_at": string | null,"dimensions_cm": Json | null,"id": string,"is_active": boolean | null,"price_adjustment_inr": number | null,"product_id": string,"size": string | null,"sku": string | null,"stock_quantity": number,"updated_at": string | null,"variant_name": string | null,"weight_grams": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "attributes"?: Json | null,"color_hex"?: string | null,"color_name"?: string | null,"created_at"?: string | null,"dimensions_cm"?: Json | null,"id"?: string,"is_active"?: boolean | null,"price_adjustment_inr"?: number | null,"product_id": string,"size"?: string | null,"sku"?: string | null,"stock_quantity"?: number,"updated_at"?: string | null,"variant_name"?: string | null,"weight_grams"?: number | null
                  }
                  Update: {
                    "attributes"?: Json | null,"color_hex"?: string | null,"color_name"?: string | null,"created_at"?: string | null,"dimensions_cm"?: Json | null,"id"?: string,"is_active"?: boolean | null,"price_adjustment_inr"?: number | null,"product_id"?: string,"size"?: string | null,"sku"?: string | null,"stock_quantity"?: number,"updated_at"?: string | null,"variant_name"?: string | null,"weight_grams"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "product_variants_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"products": {
                  Row: {
                    "artisan_info": string | null,"blouse_description": string | null,"blouse_included": boolean | null,"brand": string | null,"care_instructions": string | null,"category_id": string | null,"color_description": string | null,"cost_price_inr": number | null,"country_of_origin": string | null,"created_at": string | null,"description": string | null,"discount_percent": number | null,"embroidery_details": string | null,"fabric": string | null,"id": string,"in_stock": boolean | null,"is_bestseller": boolean | null,"is_featured": boolean | null,"is_festive": boolean | null,"is_new": boolean | null,"mrp_inr": number,"occasion": string | null,"pattern": string | null,"price_inr": number,"product_type": string | null,"published_at": string | null,"rating": number | null,"reviews_count": number | null,"saree_length": string | null,"seo_description": string | null,"seo_title": string | null,"short_description": string | null,"sku": string | null,"slug": string,"sold_count": number | null,"specifications": Json | null,"status": string | null,"stock_quantity": number | null,"subtitle": string | null,"title": string,"updated_at": string | null,"weaving_style": string | null,"zari_details": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "artisan_info"?: string | null,"blouse_description"?: string | null,"blouse_included"?: boolean | null,"brand"?: string | null,"care_instructions"?: string | null,"category_id"?: string | null,"color_description"?: string | null,"cost_price_inr"?: number | null,"country_of_origin"?: string | null,"created_at"?: string | null,"description"?: string | null,"discount_percent"?: number | null,"embroidery_details"?: string | null,"fabric"?: string | null,"id"?: string,"in_stock"?: boolean | null,"is_bestseller"?: boolean | null,"is_featured"?: boolean | null,"is_festive"?: boolean | null,"is_new"?: boolean | null,"mrp_inr": number,"occasion"?: string | null,"pattern"?: string | null,"price_inr": number,"product_type"?: string | null,"published_at"?: string | null,"rating"?: number | null,"reviews_count"?: number | null,"saree_length"?: string | null,"seo_description"?: string | null,"seo_title"?: string | null,"short_description"?: string | null,"sku"?: string | null,"slug": string,"sold_count"?: number | null,"specifications"?: Json | null,"status"?: string | null,"stock_quantity"?: number | null,"subtitle"?: string | null,"title": string,"updated_at"?: string | null,"weaving_style"?: string | null,"zari_details"?: string | null
                  }
                  Update: {
                    "artisan_info"?: string | null,"blouse_description"?: string | null,"blouse_included"?: boolean | null,"brand"?: string | null,"care_instructions"?: string | null,"category_id"?: string | null,"color_description"?: string | null,"cost_price_inr"?: number | null,"country_of_origin"?: string | null,"created_at"?: string | null,"description"?: string | null,"discount_percent"?: number | null,"embroidery_details"?: string | null,"fabric"?: string | null,"id"?: string,"in_stock"?: boolean | null,"is_bestseller"?: boolean | null,"is_featured"?: boolean | null,"is_festive"?: boolean | null,"is_new"?: boolean | null,"mrp_inr"?: number,"occasion"?: string | null,"pattern"?: string | null,"price_inr"?: number,"product_type"?: string | null,"published_at"?: string | null,"rating"?: number | null,"reviews_count"?: number | null,"saree_length"?: string | null,"seo_description"?: string | null,"seo_title"?: string | null,"short_description"?: string | null,"sku"?: string | null,"slug"?: string,"sold_count"?: number | null,"specifications"?: Json | null,"status"?: string | null,"stock_quantity"?: number | null,"subtitle"?: string | null,"title"?: string,"updated_at"?: string | null,"weaving_style"?: string | null,"zari_details"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "products_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "avatar_url": string | null,"created_at": string | null,"date_of_birth": string | null,"email": string,"full_name": string,"id": string,"phone": string | null,"preferred_language": string | null,"updated_at": string | null,"whatsapp_opt_in": boolean | null
                  }
                  ComputedFields: never
                  Insert: {
                    "avatar_url"?: string | null,"created_at"?: string | null,"date_of_birth"?: string | null,"email": string,"full_name": string,"id": string,"phone"?: string | null,"preferred_language"?: string | null,"updated_at"?: string | null,"whatsapp_opt_in"?: boolean | null
                  }
                  Update: {
                    "avatar_url"?: string | null,"created_at"?: string | null,"date_of_birth"?: string | null,"email"?: string,"full_name"?: string,"id"?: string,"phone"?: string | null,"preferred_language"?: string | null,"updated_at"?: string | null,"whatsapp_opt_in"?: boolean | null
                  }
                  Relationships: [
                    
                  ]
                },"refunds": {
                  Row: {
                    "amount_inr": number,"created_at": string | null,"id": string,"notes": string | null,"order_id": string,"processed_by": string | null,"refund_reference": string | null,"return_request_id": string | null,"status": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "amount_inr": number,"created_at"?: string | null,"id"?: string,"notes"?: string | null,"order_id": string,"processed_by"?: string | null,"refund_reference"?: string | null,"return_request_id"?: string | null,"status"?: string | null
                  }
                  Update: {
                    "amount_inr"?: number,"created_at"?: string | null,"id"?: string,"notes"?: string | null,"order_id"?: string,"processed_by"?: string | null,"refund_reference"?: string | null,"return_request_id"?: string | null,"status"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "refunds_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "refunds_return_request_id_fkey"
      columns: ["return_request_id"]
isOneToOne: false
      referencedRelation: "return_requests"
      referencedColumns: ["id"]
    }
                  ]
                },"return_requests": {
                  Row: {
                    "admin_notes": string | null,"created_at": string | null,"customer_comments": string | null,"id": string,"order_id": string,"reason": string,"status": string | null,"supporting_images": (string)[] | null,"updated_at": string | null,"user_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "admin_notes"?: string | null,"created_at"?: string | null,"customer_comments"?: string | null,"id"?: string,"order_id": string,"reason": string,"status"?: string | null,"supporting_images"?: (string)[] | null,"updated_at"?: string | null,"user_id"?: string | null
                  }
                  Update: {
                    "admin_notes"?: string | null,"created_at"?: string | null,"customer_comments"?: string | null,"id"?: string,"order_id"?: string,"reason"?: string,"status"?: string | null,"supporting_images"?: (string)[] | null,"updated_at"?: string | null,"user_id"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "return_requests_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    }
                  ]
                },"service_benefits": {
                  Row: {
                    "created_at": string | null,"description": string,"display_order": number | null,"icon_name": string,"id": string,"is_active": boolean | null,"title": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string | null,"description": string,"display_order"?: number | null,"icon_name": string,"id"?: string,"is_active"?: boolean | null,"title": string
                  }
                  Update: {
                    "created_at"?: string | null,"description"?: string,"display_order"?: number | null,"icon_name"?: string,"id"?: string,"is_active"?: boolean | null,"title"?: string
                  }
                  Relationships: [
                    
                  ]
                },"shipments": {
                  Row: {
                    "actual_delivery": string | null,"courier_partner": string | null,"created_at": string | null,"current_status": string | null,"estimated_delivery": string | null,"history": Json | null,"id": string,"order_id": string,"tracking_number": string,"tracking_url": string | null,"updated_at": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "actual_delivery"?: string | null,"courier_partner"?: string | null,"created_at"?: string | null,"current_status"?: string | null,"estimated_delivery"?: string | null,"history"?: Json | null,"id"?: string,"order_id": string,"tracking_number": string,"tracking_url"?: string | null,"updated_at"?: string | null
                  }
                  Update: {
                    "actual_delivery"?: string | null,"courier_partner"?: string | null,"created_at"?: string | null,"current_status"?: string | null,"estimated_delivery"?: string | null,"history"?: Json | null,"id"?: string,"order_id"?: string,"tracking_number"?: string,"tracking_url"?: string | null,"updated_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "shipments_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    }
                  ]
                },"shipping_zones": {
                  Row: {
                    "created_at": string | null,"express_rate_inr": number | null,"free_shipping_threshold_inr": number | null,"id": string,"is_active": boolean | null,"standard_rate_inr": number | null,"states": (string)[],"zone_name": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string | null,"express_rate_inr"?: number | null,"free_shipping_threshold_inr"?: number | null,"id"?: string,"is_active"?: boolean | null,"standard_rate_inr"?: number | null,"states": (string)[],"zone_name": string
                  }
                  Update: {
                    "created_at"?: string | null,"express_rate_inr"?: number | null,"free_shipping_threshold_inr"?: number | null,"id"?: string,"is_active"?: boolean | null,"standard_rate_inr"?: number | null,"states"?: (string)[],"zone_name"?: string
                  }
                  Relationships: [
                    
                  ]
                },"site_settings": {
                  Row: {
                    "description": string | null,"id": string,"key": string,"updated_at": string | null,"value": NonNullable<Json>
                  }
                  ComputedFields: never
                  Insert: {
                    "description"?: string | null,"id"?: string,"key": string,"updated_at"?: string | null,"value": NonNullable<Json>
                  }
                  Update: {
                    "description"?: string | null,"id"?: string,"key"?: string,"updated_at"?: string | null,"value"?: NonNullable<Json>
                  }
                  Relationships: [
                    
                  ]
                },"support_tickets": {
                  Row: {
                    "created_at": string | null,"customer_email": string,"customer_name": string,"id": string,"message": string,"priority": string | null,"status": string | null,"subject": string,"ticket_number": string,"updated_at": string | null,"user_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string | null,"customer_email": string,"customer_name": string,"id"?: string,"message": string,"priority"?: string | null,"status"?: string | null,"subject": string,"ticket_number": string,"updated_at"?: string | null,"user_id"?: string | null
                  }
                  Update: {
                    "created_at"?: string | null,"customer_email"?: string,"customer_name"?: string,"id"?: string,"message"?: string,"priority"?: string | null,"status"?: string | null,"subject"?: string,"ticket_number"?: string,"updated_at"?: string | null,"user_id"?: string | null
                  }
                  Relationships: [
                    
                  ]
                },"user_roles": {
                  Row: {
                    "assigned_by": string | null,"created_at": string | null,"id": string,"role": Database["public"]['Enums']["user_role_type"],"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "assigned_by"?: string | null,"created_at"?: string | null,"id"?: string,"role"?: Database["public"]['Enums']["user_role_type"],"user_id": string
                  }
                  Update: {
                    "assigned_by"?: string | null,"created_at"?: string | null,"id"?: string,"role"?: Database["public"]['Enums']["user_role_type"],"user_id"?: string
                  }
                  Relationships: [
                    
                  ]
                },"wishlist_items": {
                  Row: {
                    "created_at": string | null,"id": string,"product_id": string,"wishlist_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string | null,"id"?: string,"product_id": string,"wishlist_id": string
                  }
                  Update: {
                    "created_at"?: string | null,"id"?: string,"product_id"?: string,"wishlist_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "wishlist_items_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "wishlist_items_wishlist_id_fkey"
      columns: ["wishlist_id"]
isOneToOne: false
      referencedRelation: "wishlists"
      referencedColumns: ["id"]
    }
                  ]
                },"wishlists": {
                  Row: {
                    "created_at": string | null,"guest_token": string | null,"id": string,"user_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string | null,"guest_token"?: string | null,"id"?: string,"user_id"?: string | null
                  }
                  Update: {
                    "created_at"?: string | null,"guest_token"?: string | null,"id"?: string,"user_id"?: string | null
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "get_my_role_info":
{ Args: Record<PropertyKey, never>; Returns: Json
                           },
            "has_role":
{ Args: { "required_role": Database["public"]['Enums']["user_role_type"] }; Returns: boolean
                           },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"process_checkout_atomic":
{ Args: { "p_billing_address": Json,"p_cart_items": Json,"p_coupon_code": string,"p_customer_email": string,"p_customer_name": string,"p_customer_phone": string,"p_delivery_option": string,"p_idempotency_key": string,"p_payment_method": string,"p_shipping_address": Json,"p_user_id": string }; Returns: Json
                           },
"show_limit":
{ Args: Record<PropertyKey, never>; Returns: number
                           },
"show_trgm":
{ Args: { "": string }; Returns: (string)[]
                           }
          }
          Enums: {
            "order_status_type": "pending"|"confirmed"|"processing"|"packed"|"shipped"|"out_for_delivery"|"delivered"|"cancelled"|"returned"|"refunded","payment_status_type": "pending"|"authorized"|"paid"|"failed"|"refunded"|"partially_refunded","user_role_type": "super_admin"|"admin"|"catalog_manager"|"inventory_manager"|"order_manager"|"support_agent"|"customer"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "public": {
          Enums: {
            "order_status_type": ["pending", "confirmed", "processing", "packed", "shipped", "out_for_delivery", "delivered", "cancelled", "returned", "refunded"],"payment_status_type": ["pending", "authorized", "paid", "failed", "refunded", "partially_refunded"],"user_role_type": ["super_admin", "admin", "catalog_manager", "inventory_manager", "order_manager", "support_agent", "customer"]
          }
        }
} as const
