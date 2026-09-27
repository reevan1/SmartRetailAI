import { useEffect, useState, type FormEvent } from 'react'
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../api'
import type {
  Category,
  CategoryFormData,
} from '../types'

const emptyForm: CategoryFormData = {
  name: '',
  description: '',
}

function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [form, setForm] = useState<CategoryFormData>(emptyForm)
  const [editingCategory, setEditingCategory] =
    useState<Category | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadCategories() {
    try {
      setLoading(true)
      setError('')
      setCategories(await getCategories())
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not load categories.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
  let cancelled = false

  getCategories()
    .then((categoryData) => {
      if (!cancelled) {
        setCategories(categoryData)
      }
    })
    .catch((requestError: unknown) => {
      if (!cancelled) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : 'Could not load categories.',
        )
      }
    })
    .finally(() => {
      if (!cancelled) {
        setLoading(false)
      }
    })

  return () => {
    cancelled = true
  }
}, [])

  function openCreateForm() {
    setEditingCategory(null)
    setForm(emptyForm)
    setError('')
    setSuccess('')
    setShowForm(true)
  }

  function openEditForm(category: Category) {
    setEditingCategory(category)
    setForm({
      name: category.name,
      description: category.description ?? '',
    })
    setError('')
    setSuccess('')
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingCategory(null)
    setForm(emptyForm)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const request = {
        name: form.name.trim(),
        description: form.description.trim() || null,
      }

      if (editingCategory) {
        await updateCategory(editingCategory.id, request)
        setSuccess('Category updated successfully.')
      } else {
        await createCategory(request)
        setSuccess('Category created successfully.')
      }

      closeForm()
      await loadCategories()
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not save the category.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(category: Category) {
    if (!window.confirm(`Deactivate "${category.name}"?`)) {
      return
    }

    try {
      setError('')
      setSuccess('')
      await deleteCategory(category.id)
      setSuccess('Category deactivated successfully.')
      await loadCategories()
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not deactivate the category.',
      )
    }
  }

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">CATALOG MANAGEMENT</p>
          <h1>Categories</h1>
          <p className="subtitle">
            Organize products into clear store departments.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={openCreateForm}
        >
          + Add category
        </button>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <span>Active categories</span>
          <strong>{categories.length}</strong>
        </article>
      </section>

      {error && <div className="alert error-alert">{error}</div>}
      {success && (
        <div className="alert success-alert">{success}</div>
      )}

      <section className="catalog-card">
        <div className="catalog-toolbar">
          <div>
            <h2>Category list</h2>
            <p>{categories.length} active categories</p>
          </div>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
                <th>Created</th>
                <th aria-label="Actions"></th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="empty-state">
                    Loading categories…
                  </td>
                </tr>
              ) : categories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="empty-state">
                    No active categories found.
                  </td>
                </tr>
              ) : (
                categories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <strong>{category.name}</strong>
                    </td>
                    <td>
                      {category.description || 'No description'}
                    </td>
                    <td>
                      {new Date(
                        category.createdAtUtc,
                      ).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          onClick={() => openEditForm(category)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="danger-action"
                          onClick={() =>
                            void handleDelete(category)
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

      {showForm && (
        <div className="modal-backdrop" role="presentation">
          <section
            className="product-modal small-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="category-form-title"
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">
                  {editingCategory
                    ? 'EDIT CATEGORY'
                    : 'NEW CATEGORY'}
                </p>
                <h2 id="category-form-title">
                  {editingCategory
                    ? 'Update category'
                    : 'Add category'}
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
              <div className="form-grid single-column-form">
                <label>
                  Category name
                  <input
                    required
                    maxLength={100}
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        name: event.target.value,
                      }))
                    }
                  />
                </label>

                <label>
                  Description
                  <textarea
                    maxLength={500}
                    value={form.description}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
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
                  {saving ? 'Saving…' : 'Save category'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  )
}

export default CategoriesPage