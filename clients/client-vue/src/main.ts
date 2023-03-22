import { createApp } from 'vue'
import { createPinia } from 'pinia'

import { onError } from '@apollo/client/link/error'
// apollo
import {
  ApolloClient,
  createHttpLink,
  InMemoryCache,
  from,
  ApolloLink,
  split
} from '@apollo/client/core'
import { createApolloProvider } from '@vue/apollo-option'
import { GraphQLWsLink } from '@apollo/client/link/subscriptions'
import { getMainDefinition } from '@apollo/client/utilities'
import { createClient } from 'graphql-ws'

import VueApolloComponents from '@vue/apollo-components'

import './assets/main.css'
import App from './App.vue'

const serverPort = import.meta.env.VITE_SERVER_PORT
const sorcketPort = import.meta.env.VITE_SOCKET_PORT

const token = 'test123' // get when login post
const authMiddleware = new ApolloLink((operation: any, forward: any) => {
  operation.setContext(({ headers = {} }) => ({
    headers: { ...headers, token }
  }))

  return forward(operation)
})
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors && Array.isArray(graphQLErrors)) {
    graphQLErrors.forEach(
      ({
        message,
        extensions: { errorType, response } = {}
      }: {
        message: string
        extensions: any
      }) => {
        console.error(message)
        const { status = 0 } = response || {}

        if (status === 401) {
          console.warn(message)
        }
      }
    )
  }

  if (networkError) {
    console.error('networkError', networkError)
  }
})
// 与 API 的 HTTP 连接
const httpLink = createHttpLink({
  // 你需要在这里使用绝对路径
  uri: `http://localhost:${serverPort}/graphql`
})
// 创建订阅的 websocket 连接
const wsLink = new GraphQLWsLink(
  createClient({
    url: `ws://localhost:${sorcketPort}/graphql`,
    connectionParams: {
      token
    },
    on: {
      connected: (received: any) => {
        console.log('connected:', received)
      },
      closed: (received: any) => {
        console.log('closed:', received)
      }
    }
  })
)
const link = split(
  // 根据操作类型分割
  ({ query }) => {
    const definition = getMainDefinition(query)
    return definition.kind === 'OperationDefinition' && definition.operation === 'subscription'
  },
  wsLink,
  httpLink
)

// 缓存实现
const cache = new InMemoryCache()

// 创建 apollo 客户端
const apolloClient = new ApolloClient({
  link: from([authMiddleware, link, errorLink]),
  connectToDevTools: true,
  cache
})

const apolloProvider = createApolloProvider({
  defaultClient: apolloClient
})
// apollo

const app = createApp(App)

app.use(createPinia())

app.use(apolloProvider)
app.use(VueApolloComponents)

app.mount('#app')
