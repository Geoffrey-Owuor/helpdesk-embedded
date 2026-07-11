import HomeNavBar from "../Navigation/HomeNavBar";
import Footer from "./Footer";
import { Mail, Phone } from "lucide-react";

// Linkedin Icon
const LinkeDinIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    className={className}
  >
    <path
      fill="currentColor"
      d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z"
    ></path>
  </svg>
);

// User Icon
const UserIcon = ({ className = "" }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    className={className}
  >
    <path
      fill="currentColor"
      d="M12 2a5 5 0 1 0 0 10a5 5 0 1 0 0-10M4 22h16c.55 0 1-.45 1-1v-1c0-3.86-3.14-7-7-7h-4c-3.86 0-7 3.14-7 7v1c0 .55.45 1 1 1"
    ></path>
  </svg>
);

// TODO: Update these placeholder members with actual IT team data
const TEAM_MEMBERS = [
  {
    id: 1,
    name: "Naheed Manjothi",
    title: "Head Of Department",
    description:
      "Naheed leads the IT department's strategic vision, overseeing technology infrastructure, security, and digital initiatives to align with and drive the company's core business objectives.",
    linkedin: "#",
    email: "naheed@hotpoint.co.ke",
    extension: "1010",
  },
  {
    id: 2,
    name: "George Okoro",
    title: "System Administrator",
    description:
      "George manages and maintains the company's IT infrastructure, ensuring network stability, system security, and reliable server performance to support daily operations.",
    linkedin: "#",
    email: "gokoro@hotpoint.co.ke",
    extension: "1003",
  },
  {
    id: 3,
    name: "Philip Kamau",
    title: "IT Engineer",
    description:
      "Philip designs, deploys, and optimizes the company's hardware and software systems, delivering robust technical solutions and high-level support across the organization's network.",
    linkedin: "#",
    email: "phillip@hotpoint.co.ke",
    extension: "1006",
  },
  {
    id: 4,
    name: "Sylvester Chettier",
    title: "ERP Administrator",
    description:
      "Sylvester oversees the maintenance, optimization, and integration of the company's ERP systems, ensuring seamless business workflows and data integrity across all departments.",
    linkedin: "#",
    email: "sylvester@hotpoint.co.ke",
    extension: "1012",
  },
  {
    id: 5,
    name: "Bilha Mmbone",
    title: "IT Support Engineer",
    description:
      "Bilha provides vital technical assistance and troubleshooting for hardware, software, and network issues, ensuring minimal downtime and high-quality support for all end-users.",
    linkedin: "#",
    email: "bilha@hotpoint.co.ke",
    extension: "1013",
  },
  {
    id: 6,
    name: "Geoffrey Owuor",
    title: "Software Developer",
    description:
      "Geoffrey designs, builds, and maintains the company's internal tools and software applications, writing clean, efficient code to enhance digital processes and system capabilities.",
    linkedin: "#",
    email: "geoffrey@hotpoint.co.ke",
    extension: "1018",
  },
  {
    id: 7,
    name: "Fred Nyaboga",
    title: "IT Support Engineer",
    description:
      "Fred performs designated high-level business process workflows within the ERP system to support essential daily operations, collaborating closely with the senior ERP team to ensure system efficiency.",
    linkedin: "#",
    email: "fnyaboga@hotpoint.co.ke",
    extension: "TBD",
  },
];

const ItTeam = () => {
  return (
    <main className="layout-scrollbar home-container flex h-screen flex-col overflow-y-auto bg-white dark:bg-neutral-950">
      <HomeNavBar />

      <div className="custom:px-8 mx-auto mt-8 mb-16 w-full max-w-6xl flex-1 px-4 2xl:max-w-7xl">
        {/* Header Section */}
        <div className="mb-12 text-center md:text-left">
          <h1 className="mb-4 text-2xl font-semibold tracking-tight text-neutral-900 dark:text-neutral-50">
            Meet the IT Team
          </h1>
          <p className="max-w-2xl text-base text-neutral-600 dark:text-neutral-400">
            Our dedicated technology professionals work behind the scenes to
            keep our infrastructure secure, our networks fast, and our employees
            productive.
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {TEAM_MEMBERS.map((member) => (
            <div
              key={member.id}
              className="flex flex-col rounded-2xl border border-neutral-200 bg-neutral-50/50 p-6 shadow-xs transition-all hover:shadow-sm dark:border-neutral-800 dark:bg-neutral-900/30"
            >
              {/* Card Header: Avatar, Name, Title & LinkedIn */}
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-neutral-200 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                    <UserIcon className="text-2xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                      {member.name}
                    </h3>
                    <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      {member.title}
                    </p>
                  </div>
                </div>

                {/* LinkedIn Link */}
                {/* TODO: Replace '#' with actual LinkedIn URLs in the TEAM_MEMBERS array */}
                <a
                  href={member.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-neutral-400 transition-colors hover:text-[#0a66c2] dark:hover:text-[#3b82f6]"
                  aria-label={`LinkedIn profile for ${member.name}`}
                >
                  <LinkeDinIcon className="text-2xl" />
                </a>
              </div>

              {/* Description */}
              <p className="mb-6 line-clamp-5 text-sm text-neutral-600 dark:text-neutral-400">
                {member.description}
              </p>

              {/* Spacer to push contact info to the bottom if descriptions vary in length */}
              <div className="mt-auto flex flex-col gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-800">
                {/* Email */}
                {/* TODO: Update href if you want mailto functionality (e.g., href={`mailto:${member.email}`}) */}
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <Mail className="h-4 w-4 shrink-0 text-neutral-400" />
                  <span className="truncate">{member.email}</span>
                </div>

                {/* Phone Extension */}
                <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                  <Phone className="h-4 w-4 shrink-0 text-neutral-400" />
                  <span>Ext: {member.extension}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
};

export default ItTeam;
