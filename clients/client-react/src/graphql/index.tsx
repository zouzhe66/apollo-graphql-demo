import { gql } from "@apollo/client";
import { bookFragment } from "./fragments";

export const getAllBooksGql = gql`
  ${bookFragment}
  query GetBooks {
    books {
      ...book
    }
  }
`;

export const getBooksByPageGql = gql`
  ${bookFragment}
  query GetBooksByPage($offset: Int, $limit: Int) {
    pageBook(offset: $offset, limit: $limit) @connection(key: "pageBook") {
      ...book
    }
  }
`;
export const addBookGql = gql`
  mutation AddBook($input: bookInput!) {
    addBook(input: $input) {
      code
      success
      message
      book {
        ...book
      }
    }
  }
  ${bookFragment}
`;

export const subscriptionBookGql = gql`
  ${bookFragment}
  subscription AddBookSub {
    addBookSub {
      ...book
    }
  }
`;
