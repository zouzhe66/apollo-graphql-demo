import { gql } from "@apollo/client";

export const bookFragment = gql`
  fragment book on Book {
    id
    title
    author {
      id
      name
    }
    createTime
  }
`;
