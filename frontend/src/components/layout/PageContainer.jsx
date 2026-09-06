function PageContainer({ children }) {
  return (
    <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {children}
    </main>
  );
}
export default PageContainer;
