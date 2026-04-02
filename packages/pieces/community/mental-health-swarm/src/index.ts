
import { createPiece, PieceAuth } from "@activepieces/pieces-framework";
import { orchestrationAction } from "./lib/actions/orchestration";
import { therapyPlannerAction } from "./lib/actions/therapy-planner";
import { crisisManagerAction } from "./lib/actions/crisis-manager";
import { callAgentAction } from "./lib/actions/call-agent";
import { listAgentsAction } from "./lib/actions/list-agents";

export const mentalHealthSwarm = createPiece({
  displayName: "Mental Health Swarm",
  auth: PieceAuth.None(),
  minimumSupportedRelease: '0.50.2',
  logoUrl: "https://www.widecanvas.ai/blacklogo.svg",
  authors: ['Jules'],
  description: 'A research-backed mental health agent swarm optimized for adaptive routing and clinical standards.',
  actions: [listAgentsAction, orchestrationAction, therapyPlannerAction, crisisManagerAction, callAgentAction],
  triggers: [],
});
