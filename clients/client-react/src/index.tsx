import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
  split,
  from,
  ApolloLink,
} from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import { Kind, OperationTypeNode } from "graphql";
import { onError } from "@apollo/client/link/error";
import { notification } from "antd";

export const token = "test123"; // get later from user login

const serverPort = import.meta.env.VITE_SERVER_PORT;
const sorcketPort = import.meta.env.VITE_SOCKET_PORT;

const wsLink = new GraphQLWsLink(
  createClient({
    url: `ws://localhost:${sorcketPort}/graphql`,
    connectionParams: {
      token,
    },
    on: {
      connected: (received) => {
        console.log("connected:", received);
      },
      closed: (received) => {
        console.log("closed:", received);
      },
    },
  })
);
const authMiddleware = new ApolloLink((operation: any, forward: any) => {
  operation.setContext(({ headers = {} }) => ({
    headers: {
      ...headers,
      token,
    },
  }));

  return forward(operation);
});
const httpLink = new HttpLink({
  uri: `http://localhost:${serverPort}/graphql`,
});
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors && Array.isArray(graphQLErrors)) {
    graphQLErrors.forEach(
      ({
        message,
        extensions: { errorType, response } = {},
      }: {
        message: string;
        extensions: any;
      }) => {
        console.error(message);
        const { status = 0 } = response || {};

        if (status === 401) {
          notification.error({ message: "401 error!" });
        }
      }
    );
  }

  if (networkError) {
    console.error("networkError", networkError);
  }
});
const targetLink = from([authMiddleware, httpLink, errorLink]);
const splitLink = split(
  ({ query }) => {
    const def = getMainDefinition(query);
    // const result =
    //   def.kind === "OperationDefinition" && def.operation === "subscription";
    // console.log("def", { def, result });
    return (
      def.kind === Kind.OPERATION_DEFINITION &&
      def.operation === OperationTypeNode.SUBSCRIPTION
    );
    // return result;
  },
  wsLink,
  targetLink
);

const client = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          pageBook: {
            // type 1
            // // Don't cache separate results based on
            // // any of this field's arguments.
            // keyArgs: false,
            // // Concatenate the incoming list items with
            // // the existing list items.
            // merge(existing = [], incoming) {
            //   return [...existing, ...incoming];
            // },
            // type 2
            // keyArgs: [],
            // merge(existing, incoming, { args }) {
            //   const { offset = 0 } = args || {};
            //   // Slicing is necessary because the existing data is
            //   // immutable, and frozen in development.
            //   const merged = existing ? existing.slice(0) : [];
            //   for (let i = 0; i < incoming.length; ++i) {
            //     merged[offset + i] = incoming[i];
            //   }
            //   return merged;
            // },
            // type 3

            // read(existing, { args, readField }) {
            //   console.log(`readField('id', existing?.[0]):`, {
            //     k: readField("id", existing?.[0]),
            //     v: existing?.[0],
            //   });
            //   console.log("existing:", { existing, args });
            //   const { offset, limit = (existing || []).length } = args || {};
            //   // A read function should always return undefined if existing is
            //   // undefined. Returning undefined signals that the field is
            //   // missing from the cache, which instructs Apollo Client to
            //   // fetch its value from your GraphQL server.
            //   return existing && existing.slice(offset, offset + limit);
            // },

            // The keyArgs list and merge function are the same as above.
            // keyArgs: ["limit"],
            merge(existing, incoming, { args }) {
              console.log("existing merge:", { existing, args, incoming });
              const { offset = 0 } = args || {};
              const merged = existing ? existing.slice(0) : [];
              for (let i = 0; i < incoming.length; ++i) {
                merged[offset + i] = incoming[i];
              }
              return merged;
            },
          },
        },
      },
    },
  }),
  connectToDevTools: true,
});

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);
root.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
