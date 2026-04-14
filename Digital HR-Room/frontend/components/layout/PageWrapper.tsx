import Sidebar from './Sidebar';

export default function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-60 p-8 bg-gray-50 min-h-screen">
        {children}
      </main>
    </div>
  );
}
