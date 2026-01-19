import LogOutButton from "@/components/Modules/LogOutButton";
// Test logout page
const page = () => {
  return (
    <div>
      This is a protected page
      <div className="h-4 w-40">
        <LogOutButton />
      </div>
    </div>
  );
};

export default page;
