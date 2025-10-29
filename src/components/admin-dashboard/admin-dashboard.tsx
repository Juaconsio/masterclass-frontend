"use client"

import { useState } from "react"
import PeopleManagement from "./people-management"
import CourseManagement from "./course-management"

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<"people" | "courses">("people")

  return (
    <div className="min-h-screen bg-background" data-theme="dark">
      <div className="drawer lg:drawer-open">
        <input id="admin-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-10 border-b border-border bg-card/50 backdrop-blur-sm">
            <div className="flex items-center justify-between px-4 py-3 lg:px-6">
              <div className="flex items-center gap-3">
                <label htmlFor="admin-drawer" className="btn btn-ghost btn-sm drawer-button lg:hidden">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    className="inline-block h-5 w-5 stroke-current"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    ></path>
                  </svg>
                </label>
                <h1 className="text-lg font-semibold text-foreground">
                  {activeSection === "people" ? "People Management" : "Course Management"}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <div className="avatar placeholder">
                  <div className="w-8 rounded-full bg-secondary">
                    <span className="text-xs text-secondary-foreground">AD</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-4 lg:p-6">
            {activeSection === "people" ? <PeopleManagement /> : <CourseManagement />}
          </main>
        </div>

        {/* Sidebar */}
        <div className="drawer-side">
          <label htmlFor="admin-drawer" aria-label="close sidebar" className="drawer-overlay"></label>
          <aside className="flex h-full w-64 flex-col border-r border-border bg-card">
            <div className="border-b border-border px-6 py-5">
              <h2 className="text-xl font-bold text-foreground">TutorAdmin</h2>
              <p className="text-xs text-muted-foreground">Backoffice Portal</p>
            </div>

            <nav className="flex-1 p-4">
              <ul className="menu gap-2">
                <li>
                  <button
                    onClick={() => setActiveSection("people")}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      activeSection === "people"
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
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
                        d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
                      />
                    </svg>
                    People Management
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => setActiveSection("courses")}
                    className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                      activeSection === "courses"
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
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
                        d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
                      />
                    </svg>
                    Course Management
                  </button>
                </li>
              </ul>
            </nav>

            <div className="border-t border-border p-4">
              <div className="text-xs text-muted-foreground">
                <p>Admin Dashboard v1.0</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
