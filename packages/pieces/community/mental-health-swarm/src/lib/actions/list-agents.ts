import { createAction, Property } from "@activepieces/pieces-framework";
import { agentSwarmData } from "../agents";

export const listAgentsAction = createAction({
  name: "list_agents",
  displayName: "List Swarm Agents",
  description: "Discover all available agents in the mental health swarm registry, optionally filtered by category.",
  aiDescription: "Browse the mental health swarm to find which agents are available and what each one does. Use this to discover the right agent before calling it.",
  props: {
    category: Property.StaticDropdown({
      displayName: "Category",
      description: "Filter agents by category. Select 'All' to see every agent in the swarm.",
      required: true,
      defaultValue: "all",
      options: {
        options: [
          { label: "All", value: "all" },
          ...Object.keys(agentSwarmData).map(cat => ({
            label: cat.charAt(0).toUpperCase() + cat.slice(1),
            value: cat,
          })),
        ],
      },
      aiDescription: "The category of agents to list, or 'all' to return the full registry.",
    }),
  },
  async run(context) {
    const { category } = context.propsValue;

    if (category === "all") {
      const allAgents = Object.entries(agentSwarmData).flatMap(([cat, agents]) =>
        agents.map(a => ({ category: cat, name: a.name, role: a.role, description: a.description })),
      );
      return {
        total: allAgents.length,
        agents: allAgents,
      };
    }

    const agents = agentSwarmData[category] || [];
    return {
      category,
      total: agents.length,
      agents: agents.map(a => ({ name: a.name, role: a.role, description: a.description })),
    };
  },
});
