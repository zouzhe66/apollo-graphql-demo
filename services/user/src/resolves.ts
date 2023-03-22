const resolvers = (() => {
  return {
    Query: {
      me() {
        return { id: "1", username: "zouzhe" };
      },
    },
  };
})();

export default resolvers;
