"use client"

import { useEffect, useState } from "react"
import { fetchUsers } from '../../client/users'
import type { ApiUser } from '../../client/users'

type User = {
  id: string
  name: string
  email: string
  role: "student" | "teacher"
  joinedDate?: string
  coursesCount?: number
}

export default function PeopleManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterRole, setFilterRole] = useState<"all" | "student" | "teacher">("all")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const data: ApiUser[] = await fetchUsers()
        if (!mounted) return
        // Normalize API shape to our User type
        const normalized: User[] = data.map((u) => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: (u.role === 'teacher' ? 'teacher' : 'student') as 'teacher' | 'student',
          joinedDate: u.joinedDate ?? '',
          coursesCount: Number(u.coursesCount ?? 0),
        }))
        setUsers(normalized)
      } catch (e: any) {
        setError(e?.message || 'Failed to load users')
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => {
      mounted = false
    }
  }, [])

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = filterRole === "all" || user.role === filterRole
    return matchesSearch && matchesRole
  })

  const promoteToTeacher = (userId: string) => {
    setUsers(users.map((user) => (user.id === userId ? { ...user, role: "teacher" as const } : user)))
  }

  const demoteToStudent = (userId: string) => {
    setUsers(users.map((user) => (user.id === userId ? { ...user, role: "student" as const } : user)))
  }

  return (
    <div className="space-y-6">
      {loading && (
        <div className="card bg-card border border-border shadow-lg">
          <div className="card-body">Loading users...</div>
        </div>
      )}
      {error && (
        <div className="card bg-card border border-border shadow-lg">
          <div className="card-body text-destructive">{error}</div>
        </div>
      )}
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="stats shadow-lg bg-card border border-border">
          <div className="stat">
            <div className="stat-title text-muted-foreground">Total Users</div>
            <div className="stat-value text-foreground">{users.length}</div>
            <div className="stat-desc text-muted-foreground">Active accounts</div>
          </div>
        </div>
        <div className="stats shadow-lg bg-card border border-border">
          <div className="stat">
            <div className="stat-title text-muted-foreground">Students</div>
            <div className="stat-value text-accent">{users.filter((u) => u.role === "student").length}</div>
            <div className="stat-desc text-muted-foreground">Learning members</div>
          </div>
        </div>
        <div className="stats shadow-lg bg-card border border-border">
          <div className="stat">
            <div className="stat-title text-muted-foreground">Teachers</div>
            <div className="stat-value text-accent">{users.filter((u) => u.role === "teacher").length}</div>
            <div className="stat-desc text-muted-foreground">Teaching staff</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card bg-card border border-border shadow-lg">
        <div className="card-body">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="form-control flex-1">
              <input
                type="text"
                placeholder="Search by name or email..."
                className="input input-bordered w-full bg-secondary text-foreground placeholder:text-muted-foreground"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setFilterRole("all")}
                className={`btn btn-sm ${filterRole === "all" ? "btn-accent" : "btn-ghost"}`}
              >
                All
              </button>
              <button
                onClick={() => setFilterRole("student")}
                className={`btn btn-sm ${filterRole === "student" ? "btn-accent" : "btn-ghost"}`}
              >
                Students
              </button>
              <button
                onClick={() => setFilterRole("teacher")}
                className={`btn btn-sm ${filterRole === "teacher" ? "btn-accent" : "btn-ghost"}`}
              >
                Teachers
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card bg-card border border-border shadow-lg">
        <div className="card-body p-0">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-muted-foreground">Name</th>
                  <th className="text-muted-foreground">Email</th>
                  <th className="text-muted-foreground">Role</th>
                  <th className="text-muted-foreground">Joined</th>
                  <th className="text-muted-foreground">Courses</th>
                  <th className="text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-secondary/50">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="avatar placeholder">
                          <div className="w-10 rounded-full bg-accent/20">
                            <span className="text-xs text-accent">
                              {user.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")}
                            </span>
                          </div>
                        </div>
                        <div className="font-medium text-foreground">{user.name}</div>
                      </div>
                    </td>
                    <td className="text-muted-foreground">{user.email}</td>
                    <td>
                      <span className={`badge ${user.role === "teacher" ? "badge-accent" : "badge-ghost"}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="text-muted-foreground">{user.joinedDate}</td>
                    <td className="text-muted-foreground">{user.coursesCount}</td>
                    <td>
                      <div className="dropdown dropdown-end">
                        <label tabIndex={0} className="btn btn-ghost btn-sm">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="h-5 w-5"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z"
                            />
                          </svg>
                        </label>
                        <ul
                          tabIndex={0}
                          className="dropdown-content menu rounded-box z-[1] w-52 bg-card border border-border p-2 shadow-lg"
                        >
                          {user.role === "student" ? (
                            <li>
                              <button
                                onClick={() => promoteToTeacher(user.id)}
                                className="text-foreground hover:bg-secondary"
                              >
                                Promote to Teacher
                              </button>
                            </li>
                          ) : (
                            <li>
                              <button
                                onClick={() => demoteToStudent(user.id)}
                                className="text-foreground hover:bg-secondary"
                              >
                                Demote to Student
                              </button>
                            </li>
                          )}
                          <li>
                            <button className="text-foreground hover:bg-secondary">View Details</button>
                          </li>
                          <li>
                            <button className="text-destructive hover:bg-destructive/10">Remove User</button>
                          </li>
                        </ul>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
