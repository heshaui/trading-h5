import Header from '../../components/Header';

const HeaderOnlyLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="h-full min-h-[100vh] flex flex-col">
    <Header />
    <main className="flex-1 flex flex-col min-h-0">{children}</main>
  </div>
);
export default HeaderOnlyLayout;
