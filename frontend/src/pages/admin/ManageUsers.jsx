import { useEffect, useState } from 'react'
import { Plus, Search, ShieldCheck, UserRound } from 'lucide-react'
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

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <AdminNavbar />

      
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
        <div className="border-b border-slate-200 pb-7">
          <p className="text-xs font-semibold tracking-[0.16em] text-brand-600">ADMINISTRATION</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Manage users</h1>
          <p className="mt-2 text-sm text-slate-500">
            Add accounts, filter by role, and update account status. Students have a hostel block; assign wardens to blocks in Manage Hostels. Administrators do not need a block.
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
                  <p className="mt-1 text-xs text-slate-500">2- or 4-digit year, one letter, then a number starting at 100.</p>
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