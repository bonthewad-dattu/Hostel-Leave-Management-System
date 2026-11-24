import { useEffect, useState } from 'react'
import { Building2, MapPin, Pencil, Plus, RotateCcw, Trash2, Users, X } from 'lucide-react'
import AdminNavbar from '../../components/AdminNavbar'
import ConfirmModal from '../../components/ConfirmModal'
import {
  createHostel,
  deactivateHostel,
  getHostels,
  getUsers,
  reactivateHostel,
  updateHostel,
} from '../../services/adminService'

const emptyHostel = { name: '', location: '', capacity: '', wardenId: '' }

function ManageHostels() {
  const [hostels, setHostels] = useState([])
  const [wardens, setWardens] = useState([])
  const [formData, setFormData] = useState(emptyHostel)
  const [editingId, setEditingId] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hostelToDeactivate, setHostelToDeactivate] = useState(null)
  const [deactivating, setDeactivating] = useState(false)
  const [reactivatingId, setReactivatingId] = useState(null)

  useEffect(() => {
    let active = true
    Promise.all([getHostels({ includeInactive: true }), getUsers({ role: 'warden' })])
      .then(([hostelItems, userData]) => {
        if (!active) return
        setHostels(hostelItems)
        setWardens(userData.items)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    const name = formData.name.trim()
    const location = formData.location.trim()
    const capacity = Number(formData.capacity)

    if (!name || !location || !formData.capacity || !Number.isInteger(capacity) || capacity < 1) {
      setError('Enter a hostel name, location, and a valid capacity greater than zero.')
      return
    }

    setSaving(true)
    try {
      const payload = {
        name,
        location,
        capacity,
        wardenId: formData.wardenId || null,
      }
      if (editingId === null) {
        await createHostel(payload)
      } else {
        await updateHostel(editingId, payload)
      }
      setHostels(await getHostels({ includeInactive: true }))
      setFormData(emptyHostel)
      setEditingId(null)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  function startEditing(hostel) {
    setFormData({
      name: hostel.name || '',
      location: hostel.location || '',
      capacity: String(hostel.capacity || ''),
      wardenId: hostel.wardenId || '',
    })
    setEditingId(hostel.id)
    setError('')
  }

  function cancelEditing() {
    setFormData(emptyHostel)
    setEditingId(null)
    setError('')
  }

  async function confirmDeactivateHostel() {
    if (!hostelToDeactivate) return
    setError('')
    setDeactivating(true)
    try {
      await deactivateHostel(hostelToDeactivate.id)
      setHostels((previous) => previous.map((hostel) => (
        hostel.id === hostelToDeactivate.id ? { ...hostel, isActive: false } : hostel
      )))
      if (editingId === hostelToDeactivate.id) cancelEditing()
      setHostelToDeactivate(null)
    } catch (requestError) {
      setError(requestError.message)
      setHostelToDeactivate(null)
    } finally {
      setDeactivating(false)
    }
  }

  async function restoreHostel(hostel) {
    setError('')
    setReactivatingId(hostel.id)
    try {
      const restoredHostel = await reactivateHostel(hostel.id)
      setHostels((previous) => previous.map((item) => (
        item.id === restoredHostel.id ? restoredHostel : item
      )))
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setReactivatingId(null)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <AdminNavbar />


      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="border-b border-slate-200 pb-7">
          <p className="text-xs font-semibold tracking-[0.16em] text-brand-600">ADMINISTRATION</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Manage hostels</h1>
          <p className="mt-2 text-sm text-slate-500">Manage hostel blocks, locations, capacities, and assigned wardens. Students must enter the configured block name in their profile.</p>
        </div>

        <section className="mt-7 flex flex-col gap-8">
          <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">{editingId === null ? 'Add hostel' : 'Edit hostel'}</h2>
              {editingId !== null && (
                <button type="button" onClick={cancelEditing} aria-label="Cancel editing" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100">
                  <X size={17} />
                </button>
              )}
            </div>


            <div>
              <label htmlFor="hostel-name" className="mb-1.5 block text-sm font-medium">Hostel block name</label>
              <input
                id="hostel-name"
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                placeholder="e.g. North Hall"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"/>

              <p className="mt-1.5 text-xs leading-5 text-slate-500">
                Students must enter this exact block name in their profile.
              </p>
            </div>



            <div>
              <label htmlFor="hostel-location" className="mb-1.5 block text-sm font-medium">Location</label>
              <input
                id="hostel-location"
                value={formData.location}
                onChange={(event) => setFormData({ ...formData, location: event.target.value })}
                placeholder="Campus or address"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"/>
            </div>

            <div className="space-y-5">
              <div>
                <label htmlFor="hostel-capacity" className="mb-1.5 block text-sm font-medium">Capacity</label>
                <input
                  id="hostel-capacity"
                  type="number"
                  min="1"
                  step="1"
                  value={formData.capacity}
                  onChange={(event) => setFormData({ ...formData, capacity: event.target.value })}
                  placeholder="Beds"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"/>
              </div>


              <div>
                <label htmlFor="hostel-warden" className="mb-1.5 block text-sm font-medium">Warden</label>
                <select
                  id="hostel-warden"
                  value={formData.wardenId}
                  onChange={(event) => setFormData({ ...formData, wardenId: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10">
                  <option value="">No warden assigned</option>
                  {wardens.map((warden) => (
                    <option key={warden.id} value={warden.id}>
                      {warden.name} ({warden.email})
                    </option>

                  ))}

                </select>
              </div>

            </div>

            {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

            <button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-60">
              <Plus size={17} />
              {saving ? 'Saving…' : editingId === null ? 'Add hostel' : 'Save changes'}
            </button>
          </form>

          <section aria-label="Hostel list">
            <div className="mb-3 flex items-end justify-between">
              <h2 className="font-semibold">Hostels</h2>
              <span className="text-sm text-slate-500">
                {hostels.filter((hostel) => hostel.isActive).length} active
                {hostels.some((hostel) => !hostel.isActive) && ` · ${hostels.filter((hostel) => !hostel.isActive).length} inactive`}
              </span>
            </div>



            {loading ? (
              <p role="status" className="rounded-xl bg-white p-6 text-sm text-slate-500">Loading hostels…</p>
            ) : hostels.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
                <Building2 className="mx-auto text-brand-600" size={29} />
                <h3 className="mt-3 font-semibold">No hostels added</h3>
                <p className="mt-1 text-sm text-slate-500">Add your first hostel using the form.</p>
              </div>
            ) : (


              <div className="space-y-3">
                {hostels.map((hostel) => (
                  <article key={hostel.id} className={`rounded-2xl border p-5 shadow-sm transition ${hostel.isActive ? 'border-slate-200 bg-white hover:border-brand-200 hover:shadow-md' : 'border-slate-200 bg-slate-50'}`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="truncate font-semibold">{hostel.name}</h3>
                          {!hostel.isActive && (
                            <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600">Inactive</span>
                          )}
                        </div>
                        <p className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                          <MapPin size={14} />
                          {hostel.location}
                        </p>
                        <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
                          <span className="inline-flex items-center gap-1.5"><Users size={15} /> Capacity: {hostel.capacity}</span>
                          {hostel.warden && <span>Warden: {hostel.warden}</span>}
                        </p>
                      </div>
                      {hostel.isActive ? (
                        <div className="flex shrink-0 gap-1">
                          <button type="button" onClick={() => startEditing(hostel)} aria-label={`Edit ${hostel.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-brand-600">
                            <Pencil size={17} />
                          </button>
                          <button type="button" onClick={() => setHostelToDeactivate(hostel)} aria-label={`Deactivate ${hostel.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-rose-50 hover:text-rose-700">
                            <Trash2 size={17} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => restoreHostel(hostel)}
                          disabled={reactivatingId === hostel.id}
                          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <RotateCcw size={16} />
                          {reactivatingId === hostel.id ? 'Restoring…' : 'Reactivate'}
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </section>
      </div>


      <ConfirmModal
        open={Boolean(hostelToDeactivate)}
        title="Deactivate this hostel block?"
        message={`${hostelToDeactivate?.name || 'This hostel block'} will be removed from the active hostel list. Existing student accounts and leave records will be kept. Reactivate it later to use the same block again.`}
        confirmText="Deactivate hostel"
        onConfirm={confirmDeactivateHostel}
        onCancel={() => setHostelToDeactivate(null)}
        variant="warning"
        busy={deactivating}
      />
      
    </main>
  )
}

export default ManageHostels