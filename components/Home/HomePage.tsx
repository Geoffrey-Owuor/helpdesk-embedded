import HomeNavBar from "@/components/Navigation/HomeNavBar";
import Hero from "@/components/Home/Hero";
import Footer from "@/components/Home/Footer";

const HomePage = () => {
  return (
    <div className="layout-scrollbar home-container h-screen overflow-y-auto bg-white dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl 2xl:max-w-7xl">
        <HomeNavBar />
        <Hero />
        <Footer />
      </div>
    </div>
  );
};

export default HomePage;
