import { httpRouter } from "convex/server";
import { agentStream } from "./agent/stream";

const http = httpRouter();

http.route({ path: "/agent/stream", method: "POST", handler: agentStream });
http.route({ path: "/agent/stream", method: "OPTIONS", handler: agentStream });

export default http;
