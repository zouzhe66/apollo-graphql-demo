import { GraphQLScalarType, Kind } from "graphql";
import { PubSub } from "graphql-subscriptions";

const pubsub = new PubSub();
const dateScalar = new GraphQLScalarType({
  name: "Date",
  description: "Date custom scalar type",
  serialize(value) {
    // result date
    if (typeof value === "number") {
      return new Date(value); // Convert outgoing Date to integer for JSON
    }
    throw Error("GraphQL Date Scalar serializer expected a `Date` object");
  },
  parseValue(value) {
    // query params
    if (value instanceof Date) {
      return value.getTime(); // Convert incoming integer to Date
    }
    throw new Error("GraphQL Date Scalar parser expected a `number`");
  },
});

const resolvers = (() => {
  return {
    Query: {
      books: async (_, __, { dataSourceApi, token }) => {
        const books = await dataSourceApi.getBooks();
        return books;
      },
      pageBook: async (_, { offset, limit = 10 }, { dataSourceApi }) => {
        const books = await dataSourceApi.getBooks();
        return books.slice(offset, offset + limit);
      },
      search: (_, { contains }) => {
        return [{ id: 123, title: `${contains}123` }];
      },
      async getBookById(_, { id }, { dataSourceApi }) {
        const book = await dataSourceApi.getBookById(id);
        return book;
      },
    },
    Date: dateScalar,
    SearchResult: {
      __resolveType(obj, context, info) {
        if (obj.name === "title") {
          return "Book";
        } else if (obj.name === "name") {
          return "Author";
        }
        return null;
      },
    },
    User: {
      async Books(_, __, { dataSourceApi }) {
        const books = await dataSourceApi.getBooks();
        return books;
      },
    },
    Book: {
      author(parent, _, contextValue, __) {
        const { dataSourceApi } = contextValue || {};
        const author = dataSourceApi.findAuthorByBookId(parent.id);
        return author;
      },
    },
    Mutation: {
      addBook: async (_, params, { dataSourceApi: sourceApi }) => {
        const {
          input: { title, author: authorName },
        } = params;
        const book = {
          id: Math.floor(Math.random() * 1e16),
          title,
          createTime: Date.now(),
        };
        const authorData = {
          id: Math.floor(Math.random() * 1e16),
          name: authorName,
        };
        await Promise.all([
          sourceApi.addBook(book),
          sourceApi.addAuthor(authorData),
          sourceApi.addBookAuthorRelation({
            authorId: authorData.id,
            bookId: book.id,
          }),
        ]);
        const bookAuthor = {
          ...book,
        };
        pubsub.publish("BOOK_ADDED", {
          addBookSub: bookAuthor,
        });

        return {
          code: "200",
          success: true,
          message: "",
          book: bookAuthor,
        };
      },
    },
    Subscription: {
      hello: {
        // Example using an async generator
        subscribe: async function* () {
          for await (const word of ["Hello", "Bonjour", "Ciao"]) {
            yield { hello: word };
          }
        },
      },
      addBookSub: {
        // More on pubsub below
        subscribe: () => pubsub.asyncIterator(["BOOK_ADDED"]),
      },
    },
  };
})();

export default resolvers;
