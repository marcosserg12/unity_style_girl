import axios from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api/v1'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Accept':           'application/json',
    'X-Requested-With': 'XMLHttpRequest',
    'Content-Type':     'application/json',
  },
})

api.interceptors.request.use(config => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('ug_token')
    if (token) config.headers.Authorization = `Bearer ${token}`

    const cartToken = localStorage.getItem('ug_cart_token')
    if (cartToken) config.headers['X-Cart-Token'] = cartToken
  }
  return config
})

// ─── Upload multipart via fetch nativo ───────────────────────────────────────
// Axios 1.x converte FormData para JSON quando Content-Type é application/json,
// perdendo os arquivos. fetch() lida com FormData nativamente sem esse problema.
export async function apiUpload(
  path: string,
  fd: FormData,
  method: 'POST' | 'PUT' | 'PATCH' = 'POST',
): Promise<any> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('ug_token') : null
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Accept:           'application/json',
      'X-Requested-With': 'XMLHttpRequest',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // NÃO definir Content-Type: o browser define multipart/form-data;boundary=... sozinho
    },
    body: fd,
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err: any = new Error(`HTTP ${res.status}`)
    err.response = { status: res.status, data: body }
    throw err
  }
  return body
}

// Redireciona para login em 401
api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('ug_token')
      window.location.href = '/login'
    }
    return Promise.reject(err)
  }
)

// ─── Funções de API ────────────────────────────────────────────────────────────

export const authApi = {
  login:    (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  register: (data: Record<string, unknown>) =>
    api.post('/auth/register', data),
  logout:   () =>
    api.post('/auth/logout'),
  me:       () =>
    api.get('/auth/me'),
}

export const productsApi = {
  list:   (params?: Record<string, unknown>) =>
    api.get('/products', { params }),
  detail: (slug: string) =>
    api.get(`/products/${slug}`),
}

export const cartApi = {
  get:     () =>
    api.get('/cart'),
  add:     (variant_id: number, quantity: number) =>
    api.post('/cart/items', { variant_id, quantity }),
  update:  (itemId: number, quantity: number) =>
    api.patch(`/cart/items/${itemId}`, { quantity }),
  remove:  (itemId: number) =>
    api.delete(`/cart/items/${itemId}`),
  clear:   () =>
    api.delete('/cart'),
}

export const ordersApi = {
  list:   () =>
    api.get('/orders'),
  detail: (id: number) =>
    api.get(`/orders/${id}`),
  create: (data: Record<string, unknown>) =>
    api.post('/orders', data),
}

export const bannersApi = {
  list: () =>
    api.get('/banners'),
}

export const addressesApi = {
  list:       ()           => api.get('/addresses'),
  create:     (data: Record<string, unknown>) => api.post('/addresses', data),
  setDefault: (id: number) => api.patch(`/addresses/${id}/default`),
  remove:     (id: number) => api.delete(`/addresses/${id}`),
}

export const checkoutApi = {
  createPreference: (shippingAddress: Record<string, unknown>) =>
    api.post('/checkout/preference', { shipping_address: shippingAddress }),
}
