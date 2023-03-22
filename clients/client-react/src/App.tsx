import React from "react";
import type { FC } from "react";
import { Button } from "antd";
import "antd/dist/reset.css";
import "./App.css";
import { useMutation, useQuery, useSubscription } from "@apollo/client";
import {
  addBookGql,
  getAllBooksGql,
  getBooksByPageGql,
  subscriptionBookGql,
} from "./graphql";

const App: FC = () => {
  useSubscription(subscriptionBookGql, {
    onComplete: () => {
      console.log("onComplete:");
    },
    onData: ({ client: { cache }, data: { data } }: any) => {
      const oldResult: any = cache.readQuery({ query: getAllBooksGql });
      cache.updateQuery({ query: getAllBooksGql }, () => {
        return { books: [...oldResult.books, data.addBookSub] };
      });
    },
    onError: (error) => {
      console.log("error:", error);
    },
    onSubscriptionComplete: () => {
      console.log("onSubscriptionComplete");
    },
  });

  const [createNew, { loading: isCreating }] = useMutation(addBookGql);
  const {
    startPolling,
    stopPolling,
    data: allBookData,
    refetch,
    loading: loadingAll,
  } = useQuery(getAllBooksGql);
  const allBooks = allBookData?.books || [];

  const {
    data: pageData,
    fetchMore,
    loading: isLoadingPage,
  } = useQuery(getBooksByPageGql, {
    variables: {
      offset: 0,
    },
  });
  const bookPageList = pageData?.pageBook || [];
  console.log("pageData", pageData);

  const onClickCreateNew = () => {
    createNew({
      variables: {
        input: {
          title: `test-${Math.floor(Math.random() * 1000)}`,
          author: `test-author-${Math.floor(Math.random() * 1000)}`,
        },
      },
    });
  };

  const onLoadMore = async () => {
    fetchMore({
      variables: {
        offset: (bookPageList || []).length,
      },
    });
  };

  return (
    <div className="App">
      <div>
        <h1>all data</h1>
        <ul>
          {allBooks.map((item: any) => {
            return (
              <li key={item.id}>
                {item.title}
                <ol>
                  <li>{item.author.name}</li>
                </ol>
              </li>
            );
          })}
        </ul>
        <Button
          type="primary"
          onClick={() => {
            refetch();
          }}
        >
          refetch
        </Button>
        <Button
          type="primary"
          loading={loadingAll}
          onClick={() => {
            Math.random() > 0.5 ? startPolling(1000) : stopPolling();
          }}
        >
          starting
        </Button>
      </div>
      <div>
        <h1>page data</h1>
        <ul>
          {bookPageList.map((item: any) => {
            return <li key={item.id}>{item.title}</li>;
          })}
        </ul>

        <Button type="primary" onClick={onLoadMore} loading={isLoadingPage}>
          loadMore
        </Button>
      </div>

      <Button type="primary" loading={isCreating} onClick={onClickCreateNew}>
        create
      </Button>
    </div>
  );
};

export default App;
