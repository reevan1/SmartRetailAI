import SuppliersPage from './components/SuppliersPage'
import { useEffect, useState, type FormEvent } from 'react'
import {
  createProduct,
  deleteProduct,
  getCategories,
  getProducts,
  updateProduct,
  type ProductRequest,
} from './api'
import CategoriesPage from './components/CategoriesPage'
import type {
  Category,
  Product,
  ProductFormData,
} from './types'
import './App.css'

type Page = 'products' | 'categories' | 'suppliers'

const emptyForm: ProductFormData = {
  barcode: '',
  name: '',
  description: '',
  categoryId: '',
  costPrice: '',
  sellingPrice: '',
  taxRate: '0',
  minimumStock: '0',
  reorderQuantity: '0',
}

function App() {
  const [activePage, setActivePage] =
    useState<Page>('products')
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState<ProductFormData>(emptyForm)
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadProducts(searchTerm = '') {
    try {
      setLoading(true)
      setError('')
      setProducts(await getProducts(searchTerm))
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not load products.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    async function loadPage() {
      try {
        setLoading(true)
        const [productData, categoryData] = await Promise.all([
          getProducts(),
          getCategories(),
        ])

        setProducts(productData)
        setCategories(categoryData)
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Could not load product data.',
        )
      } finally {
        setLoading(false)
      }
    }

    void loadPage()
  }, [])

  useEffect(() => {
    if (activePage !== 'products') {
      return
    }

    const timer = window.setTimeout(() => {
      void loadProducts(search)
    }, 350)

    return () => window.clearTimeout(timer)
  }, [search, activePage])

  function openCreateForm() {
    setEditingProduct(null)
    setForm(emptyForm)
    setError('')
    setSuccess('')
    setShowForm(true)
  }

  function openEditForm(product: Product) {
    setEditingProduct(product)
    setForm({
      barcode: product.barcode,
      name: product.name,
      description: product.description ?? '',
      categoryId: product.categoryId?.toString() ?? '',
      costPrice: product.costPrice.toString(),
      sellingPrice: product.sellingPrice.toString(),
      taxRate: product.taxRate.toString(),
      minimumStock: product.minimumStock.toString(),
      reorderQuantity: product.reorderQuantity.toString(),
    })
    setError('')
    setSuccess('')
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingProduct(null)
    setForm(emptyForm)
  }

  function updateField(
    field: keyof ProductFormData,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function buildRequest(): ProductRequest {
    return {
      barcode: form.barcode.trim(),
      name: form.name.trim(),
      description: form.description.trim() || null,
      categoryId: form.categoryId
        ? Number(form.categoryId)
        : null,
      costPrice: Number(form.costPrice),
      sellingPrice: Number(form.sellingPrice),
      taxRate: Number(form.taxRate),
      minimumStock: Number(form.minimumStock),
      reorderQuantity: Number(form.reorderQuantity),
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const request = buildRequest()

      if (editingProduct) {
        await updateProduct(editingProduct.id, request)
        setSuccess('Product updated successfully.')
      } else {
        await createProduct(request)
        setSuccess('Product created successfully.')
      }

      closeForm()
      await loadProducts(search)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not save the product.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(product: Product) {
    if (!window.confirm(`Deactivate "${product.name}"?`)) {
      return
    }

    try {
      setError('')
      setSuccess('')
      await deleteProduct(product.id)
      setSuccess('Product deactivated successfully.')
      await loadProducts(search)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not deactivate the product.',
      )
    }
  }

  function changePage(page: Page) {
    setShowForm(false)
    setError('')
    setSuccess('')
    setActivePage(page)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">SR</div>
          <div>
            <strong>SmartRetail</strong>
            <span>AI</span>
          </div>
        </div>

        <nav className="navigation" aria-label="Main navigation">
          <button type="button">Dashboard</button>

          <button
            type="button"
            className={activePage === 'products' ? 'active' : ''}
            onClick={() => changePage('products')}
          >
            Products
          </button>

          <button
            type="button"
            className={activePage === 'categories' ? 'active' : ''}
            onClick={() => changePage('categories')}
          >
            Categories
          </button>

          <button
           type="button"
           className={activePage === 'suppliers' ? 'active' : ''}
           onClick={() => changePage('suppliers')}
          >
           Suppliers
          </button>
          <button type="button">Point of Sale</button>
          <button type="button">Inventory</button>
          <button type="button">Reports</button>
        </nav>

        <div className="sidebar-footer">
          <span>SmartRetail AI</span>
          <small>Development workspace</small>
        </div>
      </aside>

      <main className="main-content">
        {activePage === 'categories' ? (
          <CategoriesPage />
        ) : activePage === 'suppliers' ? (
          <SuppliersPage />
        ) : (
          <>
            <header className="page-header">
              <div>
                <p className="eyebrow">CATALOG MANAGEMENT</p>
                <h1>Products</h1>
                <p className="subtitle">
                  Manage product details, pricing, categories,
                  and barcodes.
                </p>
              </div>

              <button
                type="button"
                className="primary-button"
                onClick={openCreateForm}
              >
                + Add product
              </button>
            </header>

            <section className="stats-grid">
              <article className="stat-card">
                <span>Active products</span>
                <strong>{products.length}</strong>
              </article>

              <article className="stat-card">
                <span>Categories in use</span>
                <strong>
                  {
                    new Set(
                      products
                        .map((product) => product.categoryId)
                        .filter(Boolean),
                    ).size
                  }
                </strong>
              </article>

              <article className="stat-card">
                <span>Low-stock rules</span>
                <strong>
                  {
                    products.filter(
                      (product) => product.minimumStock > 0,
                    ).length
                  }
                </strong>
              </article>
            </section>

            {error && (
              <div className="alert error-alert">{error}</div>
            )}

            {success && (
              <div className="alert success-alert">{success}</div>
            )}

            <section className="catalog-card">
              <div className="catalog-toolbar">
                <div>
                  <h2>Product catalog</h2>
                  <p>{products.length} active products</p>
                </div>

                <label className="search-field">
                  <span>Search</span>
                  <input
                    value={search}
                    onChange={(event) =>
                      setSearch(event.target.value)
                    }
                    placeholder="Name or barcode"
                  />
                </label>
              </div>

              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Barcode</th>
                      <th>Category</th>
                      <th>Cost</th>
                      <th>Selling price</th>
                      <th>Minimum stock</th>
                      <th aria-label="Actions"></th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="empty-state">
                          Loading products…
                        </td>
                      </tr>
                    ) : products.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="empty-state">
                          No active products found.
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr key={product.id}>
                          <td>
                            <strong>{product.name}</strong>
                            <span className="description">
                              {product.description ||
                                'No description'}
                            </span>
                          </td>

                          <td className="barcode">
                            {product.barcode}
                          </td>

                          <td>
                            <span className="category-badge">
                              {product.category?.name ??
                                'Uncategorized'}
                            </span>
                          </td>

                          <td>
                            {product.costPrice.toFixed(3)} KWD
                          </td>

                          <td>
                            <strong>
                              {product.sellingPrice.toFixed(3)} KWD
                            </strong>
                          </td>

                          <td>{product.minimumStock}</td>

                          <td>
                            <div className="row-actions">
                              <button
                                type="button"
                                onClick={() =>
                                  openEditForm(product)
                                }
                              >
                                Edit
                              </button>

                              <button
                                type="button"
                                className="danger-action"
                                onClick={() =>
                                  void handleDelete(product)
                                }
                              >
                                Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>

      {showForm && activePage === 'products' && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="product-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="product-form-title"
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">
                  {editingProduct
                    ? 'EDIT PRODUCT'
                    : 'NEW PRODUCT'}
                </p>
                <h2 id="product-form-title">
                  {editingProduct
                    ? 'Update product'
                    : 'Add product'}
                </h2>
              </div>

              <button
                type="button"
                className="close-button"
                onClick={closeForm}
                aria-label="Close"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <label>
                  Product name
                  <input
                    required
                    maxLength={150}
                    value={form.name}
                    onChange={(event) =>
                      updateField('name', event.target.value)
                    }
                  />
                </label>

                <label>
                  Barcode
                  <input
                    required
                    maxLength={50}
                    value={form.barcode}
                    onChange={(event) =>
                      updateField('barcode', event.target.value)
                    }
                  />
                </label>

                <label className="full-width">
                  Description
                  <textarea
                    maxLength={500}
                    value={form.description}
                    onChange={(event) =>
                      updateField(
                        'description',
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label>
                  Category
                  <select
                    value={form.categoryId}
                    onChange={(event) =>
                      updateField(
                        'categoryId',
                        event.target.value,
                      )
                    }
                  >
                    <option value="">Uncategorized</option>
                    {categories.map((category) => (
                      <option
                        key={category.id}
                        value={category.id}
                      >
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label>
                  Tax rate (%)
                  <input
                    required
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={form.taxRate}
                    onChange={(event) =>
                      updateField('taxRate', event.target.value)
                    }
                  />
                </label>

                <label>
                  Cost price (KWD)
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.001"
                    value={form.costPrice}
                    onChange={(event) =>
                      updateField('costPrice', event.target.value)
                    }
                  />
                </label>

                <label>
                  Selling price (KWD)
                  <input
                    required
                    type="number"
                    min="0"
                    step="0.001"
                    value={form.sellingPrice}
                    onChange={(event) =>
                      updateField(
                        'sellingPrice',
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label>
                  Minimum stock
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={form.minimumStock}
                    onChange={(event) =>
                      updateField(
                        'minimumStock',
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label>
                  Reorder quantity
                  <input
                    required
                    type="number"
                    min="0"
                    step="1"
                    value={form.reorderQuantity}
                    onChange={(event) =>
                      updateField(
                        'reorderQuantity',
                        event.target.value,
                      )
                    }
                  />
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeForm}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? 'Saving…'
                    : editingProduct
                      ? 'Save changes'
                      : 'Create product'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}

export default App