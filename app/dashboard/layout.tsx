
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex">
      <div className="w-64 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold">Dashboard</h2>
        <ul className="mt-4">
          <li><a href="/dashboard">Home</a></li>
          <li><a href="/dashboard/settings">Settings</a></li>
        </ul>
      </div>
      <div className="flex-1 p-4">
        {children}
      </div>
    </div>
  );
}
