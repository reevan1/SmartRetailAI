import { useEffect, useState, type FormEvent } from 'react'
import {
  createSupplier,
  deleteSupplier,
  getSuppliers,
  updateSupplier,
} from '../api'
import type {
  Supplier,
  SupplierFormData,
} from '../types'

const emptyForm: SupplierFormData = {
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  address: '',
}

function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [form, setForm] = useState<SupplierFormData>(emptyForm)
  const [editingSupplier, setEditingSupplier] =
    useState<Supplier | null>(null)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  async function loadSuppliers(searchTerm = '') {
    try {
      setLoading(true)
      setError('')
      setSuppliers(await getSuppliers(searchTerm))
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not load suppliers.',
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSuppliers(search)
    }, 350)

    return () => window.clearTimeout(timer)
  }, [search])

  function openCreateForm() {
    setEditingSupplier(null)
    setForm(emptyForm)
    setError('')
    setSuccess('')
    setShowForm(true)
  }

  function openEditForm(supplier: Supplier) {
    setEditingSupplier(supplier)
    setForm({
      name: supplier.name,
      contactPerson: supplier.contactPerson ?? '',
      email: supplier.email ?? '',
      phone: supplier.phone ?? '',
      address: supplier.address ?? '',
    })
    setError('')
    setSuccess('')
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditingSupplier(null)
    setForm(emptyForm)
  }

  function updateField(
    field: keyof SupplierFormData,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    try {
      setSaving(true)
      setError('')
      setSuccess('')

      const request = {
        name: form.name.trim(),
        contactPerson: form.contactPerson.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        address: form.address.trim() || null,
      }

      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, request)
        setSuccess('Supplier updated successfully.')
      } else {
        await createSupplier(request)
        setSuccess('Supplier created successfully.')
      }

      closeForm()
      await loadSuppliers(search)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not save the supplier.',
      )
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(supplier: Supplier) {
    if (!window.confirm(`Deactivate "${supplier.name}"?`)) {
      return
    }

    try {
      setError('')
      setSuccess('')
      await deleteSupplier(supplier.id)
      setSuccess('Supplier deactivated successfully.')
      await loadSuppliers(search)
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Could not deactivate the supplier.',
      )
    }
  }

  return (
    <>
      <header className="page-header">
        <div>
          <p className="eyebrow">PURCHASING</p>
          <h1>Suppliers</h1>
          <p className="subtitle">
            Manage supplier contacts and purchasing partners.
          </p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={openCreateForm}
        >
          + Add supplier
        </button>
      </header>

      <section className="stats-grid">
        <article className="stat-card">
          <span>Active suppliers</span>
          <strong>{suppliers.length}</strong>
        </article>

        <article className="stat-card">
          <span>With email</span>
          <strong>
            {
              suppliers.filter((supplier) => supplier.email)
                .length
            }
          </strong>
        </article>

        <article className="stat-card">
          <span>With phone</span>
          <strong>
            {
              suppliers.filter((supplier) => supplier.phone)
                .length
            }
          </strong>
        </article>
      </section>

      {error && <div className="alert error-alert">{error}</div>}
      {success && (
        <div className="alert success-alert">{success}</div>
      )}

      <section className="catalog-card">
        <div className="catalog-toolbar">
          <div>
            <h2>Supplier directory</h2>
            <p>{suppliers.length} active suppliers</p>
          </div>

          <label className="search-field">
            <span>Search</span>
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Company, contact, email, or phone"
            />
          </label>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Supplier</th>
                <th>Contact person</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Address</th>
                <th aria-label="Actions"></th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="empty-state">
                    Loading suppliers…
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="empty-state">
                    No active suppliers found.
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td>
                      <strong>{supplier.name}</strong>
                    </td>
                    <td>
                      {supplier.contactPerson || 'Not provided'}
                    </td>
                    <td>{supplier.email || 'Not provided'}</td>
                    <td>{supplier.phone || 'Not provided'}</td>
                    <td>{supplier.address || 'Not provided'}</td>
                    <td>
                      <div className="row-actions">
                        <button
                          type="button"
                          onClick={() => openEditForm(supplier)}
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          className="danger-action"
                          onClick={() =>
                            void handleDelete(supplier)
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
            className="product-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="supplier-form-title"
          >
            <div className="modal-header">
              <div>
                <p className="eyebrow">
                  {editingSupplier
                    ? 'EDIT SUPPLIER'
                    : 'NEW SUPPLIER'}
                </p>
                <h2 id="supplier-form-title">
                  {editingSupplier
                    ? 'Update supplier'
                    : 'Add supplier'}
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
                <label className="full-width">
                  Company name
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
                  Contact person
                  <input
                    maxLength={150}
                    value={form.contactPerson}
                    onChange={(event) =>
                      updateField(
                        'contactPerson',
                        event.target.value,
                      )
                    }
                  />
                </label>

                <label>
                  Phone
                  <input
                    maxLength={30}
                    value={form.phone}
                    onChange={(event) =>
                      updateField('phone', event.target.value)
                    }
                  />
                </label>

                <label className="full-width">
                  Email
                  <input
                    type="email"
                    maxLength={254}
                    value={form.email}
                    onChange={(event) =>
                      updateField('email', event.target.value)
                    }
                  />
                </label>

                <label className="full-width">
                  Address
                  <textarea
                    maxLength={500}
                    value={form.address}
                    onChange={(event) =>
                      updateField('address', event.target.value)
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
                  {saving ? 'Saving…' : 'Save supplier'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </>
  )
}

export default SuppliersPage