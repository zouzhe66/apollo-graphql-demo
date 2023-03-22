import {
  ApolloGateway,
  IntrospectAndCompose,
  RemoteGraphQLDataSource,
  SERVICE_DEFINITION_QUERY,
} from "@apollo/gateway";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
// import fetch from "make-fetch-happen";
import dotenv from "dotenv";
dotenv.config();
const gateway = new ApolloGateway({
  supergraphSdl: new IntrospectAndCompose({
    subgraphs: [
      { name: "books", url: process.env.SERVER_BOOK },
      { name: "users", url: process.env.SERVER_USER },
    ],
  }),
  // pollIntervalInMs: 30000,
  buildService: ({ url, name }) => {
    return new RemoteGraphQLDataSource({
      url,
      willSendRequest({ request, context }) {
        if (request && request.query === SERVICE_DEFINITION_QUERY) {
          request.http.headers.set("open-id", process.env.OPEN_ID);
        }
        const token = request.http.headers.get("token") || context.token;
        request.http.headers.set("token", token);
      },
    });
  },
  // serviceList: [
  //   { name: "accounts", url: "http://localhost:4001/graphql" },
  //   { name: "products", url: "http://localhost:4002/graphql" },
  // ],
  // introspectionHeaders: {
  //   "open-id": process.env.OPEN_ID,
  // },
});

const server = new ApolloServer({
  gateway,
});

const { url } = await startStandaloneServer(server, {
  context: async ({ req }) => {
    return { token: req.headers.token || "" };
  },
});

console.log(`🚀  Server ready at ${url}`);
