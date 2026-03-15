import HomeNavBar from "@/components/Navigation/HomeNavBar";
import Hero from "@/components/Home/Hero";
import Footer from "@/components/Home/Footer";

const HomePage = () => {
  return (
    <div
      id="home-container"
      className="h-screen overflow-y-auto [scrollbar-color:#a3a3a3_transparent] dark:[scrollbar-color:#484848_transparent]"
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
