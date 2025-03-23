import { createYoga } from "graphql-yoga";
import { createContext } from "./context";
import { schema } from "./schema";
const yoga = createYoga({
  schema,
  context: createContext,
});

const server = Bun.serve({
  fetch: yoga,
  port: 4200,
});

console.info(
  `Server is running on ${new URL(yoga.graphqlEndpoint, `http://${server.hostname}:${server.port}`)}`,
);
