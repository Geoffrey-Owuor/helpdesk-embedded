import { query } from "@/lib/Db";
import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api-middleware/ApiMiddleware";
import { unstable_cache } from "next/cache";

export interface GlobalAgentOption {
  agent_name: string;
  agent_email: string;
  department: string;
}

const getGlobalAgents = unstable_cache(
  async (): Promise<GlobalAgentOption[]> => {
    const baseQuery = `
      SELECT DISTINCT username AS agent_name, email AS agent_email, department
      FROM users
      WHERE (role = 'agent' OR role = 'admin') AND is_user_active = TRUE
      ORDER BY department, username
    `;
    return await query<GlobalAgentOption>(baseQuery);
  },
  ["get_global_analytics_agents"],
  { revalidate: 3600, tags: ["AnalyticsAgents"] },
);

export const GET = withAuth(async ({ user }) => {
  if (user.role !== "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const agents = await getGlobalAgents();
    return NextResponse.json(agents, { status: 200 });
  } catch (error) {
    console.error("Error retrieving global agents list", error);
    return NextResponse.json(
      { message: "Error retrieving the agents list" },
      { status: 500 },
    );
  }
});
