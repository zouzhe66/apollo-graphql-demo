import gql from "graphql-tag";
import { ApolloServer } from "@apollo/server";
import { buildSubgraphSchema } from "@apollo/subgraph";
import resolvers from "./resolves";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import fs from "fs";
import { startStandaloneServer } from "@apollo/server/standalone";
import { GraphQLError } from "graphql";

dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const graphqlStr = fs
  .readFileSync(path.join(__dirname, "./graphql.gql"))
  .toString();
const typeDefs = gql(graphqlStr);

const server = new ApolloServer({
  schema: buildSubgraphSchema({ typeDefs, resolvers }),
});
const { url } = await startStandaloneServer(server, {
  listen: { port: Number(process.env.PORT) },
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
    return { token };
  },
});
console.info(`url: ${url}`);
