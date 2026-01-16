import HomeNavBar from "@/components/Navigation/HomeNavBar";
import Hero from "@/components/Home/Hero";
import Footer from "@/components/Home/Footer";

const page = () => {
  return (
    <div className="mx-auto max-w-7xl">
      <HomeNavBar />
      <Hero />
      <Footer />
    </div>
  );
};

export default page;
