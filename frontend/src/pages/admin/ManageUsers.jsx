import { useEffect, useState } from 'react'
import { Pencil, Plus, Search, ShieldCheck, UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import AdminNavbar from '../../components/AdminNavbar'
import ConfirmModal from '../../components/ConfirmModal'
import Pagination from '../../components/Pagination'
import {
  createUser,
  getHostels,
  getUsers,
  updateUser,
} from '../../services/adminService'
import { isValidCollegeRollNumber, isValidPhone } from '../../utils/validators'

const emptyUser = {
  name: '',
  email: '',
  password: '',
  role: 'student',
  rollNumber: '',
  phoneNumber: '',
  hostelBlock: '',
}

function ManageUsers() {
  const [users, setUsers] = useState([])
  const [hostels, setHostels] = useState([])
  const [pagination, setPagination] = useState(null)
  const [formData, setFormData] = useState(emptyUser)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('All')
  const [page, setPage] = useState(1)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [userToDeactivate, setUserToDeactivate] = useState(null)
  const [updatingUser, setUpdatingUser] = useState(false)
  const [userToEdit, setUserToEdit] = useState(null)
  const [editFormData, setEditFormData] = useState(null)
  const [editError, setEditError] = useState('')
  const [savingEdit, setSavingEdit] = useState(false)

  useEffect(() => {
    let active = true
    getHostels()
      .then((items) => {
        if (active) setHostels(items)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    const params = {
      page,
      limit: 20,
      ...(roleFilter === 'All' ? {} : { role: roleFilter }),
      ...(search.trim() ? { search: search.trim() } : {}),
    }
    getUsers(params)
      .then((result) => {
        if (!active) return
        setUsers(result.items)
        setPagination(result.pagination)
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
  }, [roleFilter, search, page])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    const name = formData.name.trim()
    const email = formData.email.trim().toLowerCase()

    if (!name || !email || !formData.password) {
      setError('Enter the user’s name, email address, and password.')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long.')
      return
    }

    if (formData.role === 'student' && !isValidPhone(formData.phoneNumber)) {
      setError('Enter a valid 10-digit Indian mobile number for the student.')
      return
    }

    if (formData.role === 'student' && !isValidCollegeRollNumber(formData.rollNumber)) {
      setError('Use the college roll number format 26A100.')
      return
    }

    setSaving(true)
    try {
      await createUser({
        ...formData,
        name,
        email,
        hostelBlock: formData.hostelBlock.trim(),
      })
      const { items } = await getUsers({
        page,
        limit: 20,
        ...(roleFilter === 'All' ? {} : { role: roleFilter }),
        ...(search.trim() ? { search: search.trim() } : {}),
      })
      setUsers(items)
      setFormData(emptyUser)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  async function toggleStatus(user) {
    setError('')
    if (user.active !== false) {
      setUserToDeactivate(user)
      return
    }

    try {
      const updatedUser = await updateUser(user.id, { active: true })
      setUsers((previous) => previous.map((item) => item.id === user.id ? updatedUser : item))
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  async function confirmDeactivateUser() {
    if (!userToDeactivate) return
    setError('')
    setUpdatingUser(true)
    try {
      const updatedUser = await updateUser(userToDeactivate.id, { active: false })
      setUsers((previous) => previous.map((item) => item.id === updatedUser.id ? updatedUser : item))
      setUserToDeactivate(null)
    } catch (requestError) {
      setError(requestError.message)
      setUserToDeactivate(null)
    } finally {
      setUpdatingUser(false)
    }
  }

  function startEditingUser(user) {
    setUserToEdit(user)
    setEditFormData({
      name: user.name,
      email: user.email,
      rollNumber: user.rollNumber || '',
      phoneNumber: user.phoneNumber || '',
      hostelBlock: user.hostelBlock || '',
    })
    setEditError('')
  }

  async function handleEditSubmit(event) {
    event.preventDefault()
    if (!userToEdit || !editFormData) return

    setEditError('')
    const name = editFormData.name.trim()
    const email = editFormData.email.trim().toLowerCase()
    if (!name || !email) {
      setEditError('Enter the user’s name and email address.')
      return
    }

    const updates = { name, email }
    if (userToEdit.role === 'student') {
      const rollNumber = editFormData.rollNumber.trim().toUpperCase()
      const phoneNumber = editFormData.phoneNumber.trim()
      const hostelBlock = editFormData.hostelBlock.trim()
      if (rollNumber !== (userToEdit.rollNumber || '')) {
        if (!isValidCollegeRollNumber(rollNumber)) {
          setEditError('Use the college roll number format 26A100.')
          return
        }
        updates.rollNumber = rollNumber
      }
      if (phoneNumber !== (userToEdit.phoneNumber || '')) {
        if (!isValidPhone(phoneNumber)) {
          setEditError('Enter a valid 10-digit Indian mobile number.')
          return
        }
        updates.phoneNumber = phoneNumber
      }
      if (hostelBlock !== (userToEdit.hostelBlock || '')) {
        if (!hostelBlock) {
          setEditError('Choose an active hostel block.')
          return
        }
        updates.hostelBlock = hostelBlock
      }
    }

    setSavingEdit(true)
    try {
      await updateUser(userToEdit.id, updates)
      const result = await getUsers({
        page,
        limit: 20,
        ...(roleFilter === 'All' ? {} : { role: roleFilter }),
        ...(search.trim() ? { search: search.trim() } : {}),
      })
      setUsers(result.items)
      setPagination(result.pagination)
      setUserToEdit(null)
      setEditFormData(null)
    } catch (requestError) {
      setEditError(requestError.message)
    } finally {
      setSavingEdit(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <AdminNavbar />

      
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="border-b border-slate-200 pb-7">
          <p className="text-xs font-semibold tracking-[0.16em] text-brand-600">ADMINISTRATION</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Manage users</h1>
          <p className="mt-2 text-sm text-slate-500">
            Add accounts, correct profile details, and update account status. Students have a hostel block; assign wardens to blocks in Manage Hostels. Administrators do not need a block.
          </p>
        </div>

        <section className="mt-7 flex flex-col gap-8">
          <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <UserRound size={18} />
              </span>
              <h2 className="font-semibold">Add user</h2>
            </div>

            <div>
              <label htmlFor="user-name" className="mb-1.5 block text-sm font-medium">Full name</label>
              <input
                id="user-name"
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"/>
            </div>

            <div>
              <label htmlFor="user-email" className="mb-1.5 block text-sm font-medium">Email address</label>
              <input
                id="user-email"
                type="email"
                value={formData.email}
                onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"/>
            </div>

            <div>
              <label htmlFor="user-password" className="mb-1.5 block text-sm font-medium">Password</label>
              <input
                id="user-password"
                type="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={(event) => setFormData({ ...formData, password: event.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"
              />
            </div>

            <div>
              <label htmlFor="user-role" className="mb-1.5 block text-sm font-medium">Role</label>
              <select
                id="user-role"
                value={formData.role}
                onChange={(event) => setFormData({ ...formData, role: event.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-800 outline-none transition hover:border-slate-300 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10">
                <option value="student">Student</option>
                <option value="warden">Warden</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            {formData.role === 'student' && (
              <>

                <div>
                  <label htmlFor="user-roll-number" className="mb-1.5 block text-sm font-medium">Roll number</label>
                  <input
                    id="user-roll-number"
                    value={formData.rollNumber}
                    onChange={(event) => setFormData({ ...formData, rollNumber: event.target.value.toUpperCase() })}
                    placeholder="ex:26A100"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"/>
                  <p className="mt-1 text-xs text-slate-500">Use two year digits, one letter, and a three-digit number from 100 (for example, 26A100).</p>
                </div>


                <div>
                  <label htmlFor="user-phone-number" className="mb-1.5 block text-sm font-medium">Student mobile number</label>
                  <input
                    id="user-phone-number"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={formData.phoneNumber}
                    onChange={(event) => setFormData({ ...formData, phoneNumber: event.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10"/>
                </div>


                <div>
                  <label htmlFor="user-hostel" className="mb-1.5 block text-sm font-medium">Hostel block</label>

                  <select
                    id="user-hostel"
                    value={formData.hostelBlock}
                    onChange={(event) => setFormData({ ...formData, hostelBlock: event.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10">
                    <option value="">
                      {hostels.length ? 'Select a hostel block' : 'Add a hostel block first'}
                    </option>
                    {hostels.map((hostel) => (
                      <option key={hostel.id} value={hostel.name}>{hostel.name}</option>
                    ))}
                  </select>
                  <p className="mt-1.5 text-xs leading-5 text-slate-500">
                    Choose an active block configured in Manage Hostels.
                  </p>

                </div>
              </>
            )}

            {formData.role === 'warden' && (
              <p className="text-sm text-slate-500">
                After creating the account, assign this warden to a hostel under{' '}
                <Link to="/admin/hostels" className="font-semibold text-brand-600 hover:underline">Manage Hostels</Link>.
              </p>
            )}

            {error && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}

            <button type="submit" disabled={saving} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-600 disabled:cursor-not-allowed disabled:opacity-60">
              <Plus size={17} />
              {saving ? 'Creating…' : 'Add user'}
            </button>

            <p className="text-xs leading-5 text-slate-500">
              Share the temporary password securely and ask the user to change it later.
            </p>
          </form>

          <section aria-label="User accounts">
            <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">


              <div>
                <h2 className="font-semibold">User accounts</h2>
                <p className="mt-1 text-sm text-slate-500">{pagination?.total ?? users.length} total</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Deactivating blocks sign-in but keeps the account and its leave history. You can reactivate it later.
                </p>
              </div>


              <div className="flex flex-col gap-2 sm:flex-row">
                <label className="relative">


                  <span className="sr-only">Search users</span>
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />


                  <input
                    value={search}
                    onChange={(event) => {
                      setLoading(true)
                      setPage(1)
                      setSearch(event.target.value)
                    }}
                    placeholder="Search users"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2 pl-9 pr-3 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 sm:w-48"/>
                </label>


                <label>
                  <span className="sr-only">Filter by role</span>
                  <select
                    value={roleFilter}
                    onChange={(event) => {
                      setLoading(true)
                      setPage(1)
                      setRoleFilter(event.target.value)
                    }}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-brand-500/10 sm:w-auto">
                    <option>All</option>
                    <option value="student">Student</option>
                    <option value="warden">Warden</option>
                    <option value="admin">Administrator</option>
                  </select>
                </label>
              </div>
            </div>

            {error && (
              <p role="alert" className="mb-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {error}
              </p>
            )}

            {loading ? (
              <p role="status" className="rounded-xl bg-white p-6 text-sm text-slate-500">Loading users…</p>
            ) : users.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-10 text-center">
                <ShieldCheck className="mx-auto text-brand-600" size={29} />
                <h3 className="mt-3 font-semibold">{users.length ? 'No matching users' : 'No users added'}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {search || roleFilter !== 'All' ? 'Try another search or role filter.' : 'Add a user with the form to get started.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
                <table className="w-full min-w-[680px] text-left text-sm">



                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3 font-semibold">User</th>
                      <th className="px-4 py-3 font-semibold">Role</th>
                      <th className="px-4 py-3 font-semibold">Hostel / assignment</th>
                      <th className="px-4 py-3 font-semibold">Status</th>
                      <th className="px-4 py-3 font-semibold">Actions</th>
                    </tr>
                  </thead>


                  <tbody className="divide-y divide-slate-100">
                    {users.map((user) => (
                      <tr key={user.id} className="transition hover:bg-slate-50/80">
                        <td className="px-4 py-4">
                          <p className="font-medium text-slate-900">{user.name}</p>
                          <p className="mt-0.5 text-xs text-slate-500">{user.email}</p>
                        </td>
                        <td className="px-4 py-4 capitalize text-slate-600">{user.role}</td>
                        <td className="px-4 py-4 text-slate-600">
                          {user.role === 'student' ? (
                            user.hostelBlock || 'Not set'
                          ) : user.role === 'warden' ? (
                            hostels.filter((hostel) => hostel.wardenId === user.id).map((hostel) => hostel.name).join(', ') || (
                              <Link to="/admin/hostels" className="font-medium text-brand-600 hover:underline">
                                Not assigned
                              </Link>
                            )
                          ) : (
                            'Not applicable'
                          )}
                        </td>
                        <td className="px-4 py-4">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.active === false ? 'bg-slate-100 text-slate-600' : 'bg-emerald-50 text-emerald-800'}`}>
                            {user.active === false ? 'Inactive' : 'Active'}
                          </span>
                        </td>
                        <td className="px-4 py-4">

                          <div className="flex items-center gap-2">

                            <button
                              type="button"
                              onClick={() => startEditingUser(user)}
                              className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:underline">
                              <Pencil size={13} />
                              Edit
                            </button>

                            <button
                              type="button"
                              onClick={() => toggleStatus(user)}
                              className="text-xs font-semibold text-brand-600 hover:underline">
                              {user.active === false ? 'Reactivate' : 'Deactivate'}
                            </button>


                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

              </div>

            )}
          </section>


        </section>

        <Pagination
            pagination={pagination}
            onPageChange={(nextPage) => {
              setLoading(true)
              setPage(nextPage)
            }}/>
      </div>
      

      {userToEdit && editFormData && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-user-title"
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <h2 id="edit-user-title" className="text-xl font-semibold text-slate-900">
              Edit {userToEdit.role} account
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Updating the email changes the address the user must enter to sign in.
            </p>
            <form onSubmit={handleEditSubmit} className="mt-5 space-y-4">
              <div>
                <label htmlFor="edit-user-name" className="mb-1.5 block text-sm font-medium">Full name</label>
                <input
                  id="edit-user-name"
                  required
                  maxLength={120}
                  value={editFormData.name}
                  onChange={(event) => setEditFormData({ ...editFormData, name: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                />
              </div>
              <div>
                <label htmlFor="edit-user-email" className="mb-1.5 block text-sm font-medium">Email address</label>
                <input
                  id="edit-user-email"
                  type="email"
                  required
                  maxLength={254}
                  value={editFormData.email}
                  onChange={(event) => setEditFormData({ ...editFormData, email: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                />
              </div>
              {userToEdit.role === 'student' && (
                <>
                  <div>
                    <label htmlFor="edit-user-roll-number" className="mb-1.5 block text-sm font-medium">Roll number</label>
                    <input
                      id="edit-user-roll-number"
                      maxLength={40}
                      value={editFormData.rollNumber}
                      onChange={(event) => setEditFormData({ ...editFormData, rollNumber: event.target.value.toUpperCase() })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-user-phone-number" className="mb-1.5 block text-sm font-medium">Mobile number</label>
                    <input
                      id="edit-user-phone-number"
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      value={editFormData.phoneNumber}
                      onChange={(event) => setEditFormData({ ...editFormData, phoneNumber: event.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10"
                    />
                  </div>
                  <div>
                    <label htmlFor="edit-user-hostel" className="mb-1.5 block text-sm font-medium">Hostel block</label>
                    <select
                      id="edit-user-hostel"
                      value={editFormData.hostelBlock}
                      onChange={(event) => setEditFormData({ ...editFormData, hostelBlock: event.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10">
                      <option value="">Select a hostel block</option>
                      {editFormData.hostelBlock && !hostels.some((hostel) => hostel.name === editFormData.hostelBlock) && (
                        <option value={editFormData.hostelBlock}>{editFormData.hostelBlock}</option>
                      )}
                      {hostels.map((hostel) => (
                        <option key={hostel.id} value={hostel.name}>{hostel.name}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}
              {editError && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{editError}</p>}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  disabled={savingEdit}
                  onClick={() => {
                    setUserToEdit(null)
                    setEditFormData(null)
                    setEditError('')
                  }}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="rounded-xl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60">
                  {savingEdit ? 'Saving…' : 'Save changes'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <ConfirmModal
        open={Boolean(userToDeactivate)}
        title="Deactivate this account?"
        message={`${userToDeactivate?.name || 'This user'} will no longer be able to sign in. The account and any related leave history will be kept, and you can reactivate the account later.`}
        confirmText="Deactivate account"
        onConfirm={confirmDeactivateUser}
        onCancel={() => setUserToDeactivate(null)}
        variant="warning"
        busy={updatingUser}/>
    </main>
  )
}

export default ManageUsers