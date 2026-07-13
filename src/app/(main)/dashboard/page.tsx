export default function DashboardPage() {
  return (
    <div className="p-4 md:p-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Total Balance</h3>
          </div>
          <div className="text-2xl font-bold">$45,231.89</div>
          <p className="text-xs text-muted-foreground">+20.1% from last month</p>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Expenses</h3>
          </div>
          <div className="text-2xl font-bold">$2,338.00</div>
          <p className="text-xs text-muted-foreground">+5% from last month</p>
        </div>
        
        <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
          <div className="flex flex-row items-center justify-between space-y-0 pb-2">
            <h3 className="tracking-tight text-sm font-medium">Active Subscriptions</h3>
          </div>
          <div className="text-2xl font-bold">12</div>
          <p className="text-xs text-muted-foreground">3 ending this month</p>
        </div>
      </div>

      <div className="rounded-xl border bg-card text-card-foreground shadow h-96 flex items-center justify-center">
        <p className="text-muted-foreground">Main Content Stream Area</p>
      </div>
    </div>
  );
}
