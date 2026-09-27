export type Category = {
  id: number
  name: string
  description: string | null
  isActive: boolean
  createdAtUtc: string
  updatedAtUtc: string | null
}

export type Supplier = {
  id: number
  name: string
  contactPerson: string | null
  email: string | null
  phone: string | null
  address: string | null
  isActive: boolean
  createdAtUtc: string
  updatedAtUtc: string | null
}

export type Product = {
  id: number
  barcode: string
  name: string
  description: string | null
  categoryId: number | null
  category: Category | null
  costPrice: number
  sellingPrice: number
  taxRate: number
  minimumStock: number
  reorderQuantity: number
  isActive: boolean
  createdAtUtc: string
  updatedAtUtc: string | null
}

export type ProductFormData = {
  barcode: string
  name: string
  description: string
  categoryId: string
  costPrice: string
  sellingPrice: string
  taxRate: string
  minimumStock: string
  reorderQuantity: string
}

export type CategoryFormData = {
  name: string
  description: string
}

export type SupplierFormData = {
  name: string
  contactPerson: string
  email: string
  phone: string
  address: string
}