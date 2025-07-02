import Header from '../../components/Header';
import Footer from '../../components/Footer';

const MainLayout = ({ children }: { children: React.ReactNode }) => (
  <>
    <Header />
    <main>{children}</main>
    <Footer />
  </>
);
export default MainLayout;
