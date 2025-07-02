import Header from '../../components/Header';

const HeaderOnlyLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Header />
    <main>{children}</main>
  </>
);
export default HeaderOnlyLayout;
