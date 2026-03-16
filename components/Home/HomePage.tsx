import HomeNavBar from "@/components/Navigation/HomeNavBar";
import Hero from "@/components/Home/Hero";
import Footer from "@/components/Home/Footer";

const HomePage = () => {
  return (
    <div
      id="home-container"
      className="layout-scrollbar h-screen overflow-y-auto"
    >
      <div className="mx-auto max-w-7xl">
        <HomeNavBar />
        <Hero />
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
