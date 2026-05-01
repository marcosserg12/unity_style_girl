// ─── Entidades da API ─────────────────────────────────────────────────────────

export interface Category {
  id:            number
  parent_id:     number | null
  name:          string
  slug:          string
  description:   string | null
  image_path:    string | null
  display_order: number
  is_active:     boolean
  children?:     Category[]
}

export interface ProductImage {
  id:            number
  product_id:    number
  path:          string
  url:           string
  alt_text:      string | null
  display_order: number
  is_primary:    boolean
  color:         string | null
}

export interface ProductVariant {
  id:               number
  product_id:       number
  sku:              string
  size:             string | null
  color:            string | null
  color_hex:        string | null
  stock_quantity:   number
  min_stock_alert:  number
  price_modifier:   number
  final_price:      number
  is_active:        boolean
  is_low_stock:     boolean
  is_out_of_stock:  boolean
}

export interface Product {
  id:                   number
  category_id:          number
  name:                 string
  slug:                 string
  short_description:    string | null
  description:          string | null
  price:                number
  sale_price:           number | null
  weight:               number | null
  is_featured:          boolean
  is_new_arrival:       boolean
  is_active:            boolean
  is_on_sale:           boolean
  discount_percentage:  number | null
  total_stock:          number
  meta_title:           string | null
  meta_description:     string | null
  created_at:           string
  updated_at:           string
  category?:            Category
  primary_image?:       ProductImage
  images?:              ProductImage[]
  active_variants?:     ProductVariant[]
}

export interface Banner {
  id:            number
  title:         string
  subtitle:      string | null
  cta_text:      string | null
  cta_link:      string | null
  desktop_url:   string
  mobile_url:    string | null
  display_order: number
  show_badge:    boolean
  badge_label:   string | null
  badge_text:    string | null
  badge_subtext: string | null
  disclaimer:    string | null
  text_position: 'left' | 'right'
  eyebrow_text:  string | null
}

export interface Address {
  id:             number
  user_id?:       number
  label:          string | null
  recipient_name: string
  zip_code:       string
  street:         string
  number:         string
  complement:     string | null
  neighborhood:   string
  city:           string
  state:          string
  is_default:     boolean
  created_at?:    string
}

export interface User {
  id:         number
  name:       string
  email:      string
  role:       'customer' | 'admin'
  phone:      string | null
  cpf:        string | null
  birth_date: string | null
  is_active:  boolean
  addresses?: Address[]
}

export interface OrderItem {
  id:                  number
  order_id:            number
  product_id:          number
  product_variant_id:  number | null
  quantity:            number
  unit_price:          number
  total_price:         number
  product_snapshot:    {
    name:      string
    sku:       string
    size:      string | null
    color:     string | null
    image_url: string | null
  }
}

export interface Order {
  id:                     number
  user_id:                number | null
  order_number:           string
  status:                 'pending' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded'
  status_label:           string
  subtotal:               number
  shipping_cost:          number
  discount_amount:        number
  total:                  number
  payment_method:         string | null
  payment_status:         string
  shipping_address:       Omit<Address, 'id' | 'user_id' | 'label' | 'is_default'>
  tracking_code:          string | null
  items?:                 OrderItem[]
  created_at:             string
}

// ─── Carrinho (estado local Zustand) ─────────────────────────────────────────

export interface CartItem {
  id:           number  // cart_item id
  variant_id:   number
  product_name: string
  sku:          string
  size:         string | null
  color:        string | null
  unit_price:   number
  quantity:     number
  image_url:    string | null
}

// ─── Paginação ────────────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  data:          T[]
  current_page:  number
  last_page:     number
  per_page:      number
  total:         number
  from:          number
  to:            number
}
