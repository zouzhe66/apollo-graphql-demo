import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import { createServer } from "http";
import express from "express";
import { WebSocketServer } from "ws";
import { useServer } from "graphql-ws/lib/use/ws";
// import { useServer } from "/Users/zouzhe/Desktop/Projects/graphql/server/node_modules/graphql-ws/lib/use/ws.js";
import bodyParser from "body-parser";
import cors from "cors";
import { buildSubgraphSchema } from "@apollo/subgraph";
import gql from "graphql-tag";
import dotenv from "dotenv";
import fs from "fs";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import resolvers from "./resolves";
import SourceApi from "./sourceApi";
import { GraphQLError } from "graphql";

dotenv.config();
const sourceApi = new SourceApi();

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against
// your data.
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const graphqlStr = fs
  .readFileSync(path.join(__dirname, "./graphql.gql"))
  .toString();
const typeDefs = gql(graphqlStr);
// Resolvers define how to fetch the types defined in your schema.
// This resolver retrieves books from the "books" array above.

// const schema = makeExecutableSchema({ typeDefs, resolvers });
const schema = buildSubgraphSchema({ typeDefs, resolvers });
const app = express();
const httpServer = createServer(app);

// Creating the WebSocket server
const wsServer = new WebSocketServer({
  // This is the `httpServer` we created in a previous step.
  server: httpServer,
  // Pass a different path here if app.use
  // serves expressMiddleware at a different path
  path: "/graphql",
});

// Hand in the schema we just created and have the
// WebSocketServer start listening.
const serverCleanup = useServer(
  {
    schema,
    context: async (ctx, msg, args) => {
      return { ...ctx, dataSourceApi: sourceApi };
    },
  },
  wsServer
);

const server = new ApolloServer({
  schema,
  plugins: [
    // Proper shutdown for the HTTP server.
    ApolloServerPluginDrainHttpServer({ httpServer }),

    // Proper shutdown for the WebSocket server.
    {
      async serverWillStart() {
        return {
          async drainServer() {
            await serverCleanup.dispose();
          },
        };
      },
    },
  ],
});

await server.start();
app.use(
  "/graphql",
  cors(),
  bodyParser.json(),
  expressMiddleware(server, {
    context: async ({ req }) => {
      const openId = req.headers["open-id"];
      const token = req.headers["token"]; // need query from userInfo
      if (openId) {
        if (openId !== process.env.OPEN_ID) {
          throw new GraphQLError("Illegal intrusion", {
            extensions: {
              code: "Illegal intrusion",
              http: { status: 500 },
            },
          });
        }
      } else {
        if (!token) {
          throw new GraphQLError("UNAUTHENTICATED", {
            extensions: {
              code: "UNAUTHENTICATED",
              http: { status: 401 },
            },
          });
        }
      }

      return {
        dataSourceApi: sourceApi,
        token,
      };
    },
  })
);
const PORT = process.env.PORT;
// Now that our HTTP server is fully set up, we can listen to it.
httpServer.listen(PORT, () => {
  console.log(`Server is now running on http://localhost:${PORT}/graphql`);
});
