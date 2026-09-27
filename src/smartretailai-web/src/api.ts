import type {
  Category,
  Product,
  Supplier,
} from './types'

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:5169/api'

export type ProductRequest = {
  barcode: string
  name: string
  description: string | null
  categoryId: number | null
  costPrice: number
  sellingPrice: number
  taxRate: number
  minimumStock: number
  reorderQuantity: number
}

export type CategoryRequest = {
  name: string
  description: string | null
}

export type SupplierRequest = {
  name: string
  contactPerson: string | null
  email: string | null
  phone: string | null
  address: string | null
}

async function apiRequest<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, options)

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)

    const message =
      errorBody?.message ??
      errorBody?.title ??
      `Request failed with status ${response.status}.`

    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json() as Promise<T>
}

function jsonOptions(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  }
}

export function getProducts(search = '') {
  const query = new URLSearchParams()

  if (search.trim()) {
    query.set('search', search.trim())
  }

  const queryString = query.toString()

  return apiRequest<Product[]>(
    `/products${queryString ? `?${queryString}` : ''}`,
  )
}

export function createProduct(request: ProductRequest) {
  return apiRequest<Product>(
    '/products',
    jsonOptions('POST', request),
  )
}

export function updateProduct(
  id: number,
  request: ProductRequest,
) {
  return apiRequest<void>(
    `/products/${id}`,
    jsonOptions('PUT', request),
  )
}

export function deleteProduct(id: number) {
  return apiRequest<void>(`/products/${id}`, {
    method: 'DELETE',
  })
}

export function getCategories() {
  return apiRequest<Category[]>('/categories')
}

export function createCategory(request: CategoryRequest) {
  return apiRequest<Category>(
    '/categories',
    jsonOptions('POST', request),
  )
}

export function updateCategory(
  id: number,
  request: CategoryRequest,
) {
  return apiRequest<void>(
    `/categories/${id}`,
    jsonOptions('PUT', request),
  )
}

export function deleteCategory(id: number) {
  return apiRequest<void>(`/categories/${id}`, {
    method: 'DELETE',
  })
}

export function getSuppliers(search = '') {
  const query = new URLSearchParams()

  if (search.trim()) {
    query.set('search', search.trim())
  }

  const queryString = query.toString()

  return apiRequest<Supplier[]>(
    `/suppliers${queryString ? `?${queryString}` : ''}`,
  )
}

export function createSupplier(request: SupplierRequest) {
  return apiRequest<Supplier>(
    '/suppliers',
    jsonOptions('POST', request),
  )
}

export function updateSupplier(
  id: number,
  request: SupplierRequest,
) {
  return apiRequest<void>(
    `/suppliers/${id}`,
    jsonOptions('PUT', request),
  )
}

export function deleteSupplier(id: number) {
  return apiRequest<void>(`/suppliers/${id}`, {
    method: 'DELETE',
  })
}