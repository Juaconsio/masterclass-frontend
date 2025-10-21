import { BookOpen } from 'lucide-react';

export function DashboardHeader() {
  return (
    <header className="border-border bg-card border-b">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary flex h-10 w-10 items-center justify-center rounded-lg">
              <BookOpen className="text-primary-foreground h-6 w-6" />
            </div>
            <div>
              <h1 className="text-foreground text-2xl font-bold">My Dashboard</h1>
              <p className="text-muted-foreground text-sm">Manage your courses and reservations</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-primary text-primary-foreground flex h-10 w-10 items-center justify-center rounded-full font-semibold">
              JD
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
