import db from "./lowdbSource";

await db.read();

const {
  books: booksData,
  authors: authorsData,
  bookAuthorRelation: bookAuthorRelationData,
} = db.data as any;

async function waitTime(second) {
  return await new Promise((resolve) => {
    setTimeout(() => {
      resolve(1);
    }, (second || 1) * 1000);
  });
}
export default class SourceApi {
  async addBook(book) {
    await waitTime(1);
    booksData.push(book);
    await db.write();
  }
  async addAuthor(author) {
    await waitTime(1);
    authorsData.push(author);
    await db.write();
  }
  async addBookAuthorRelation(relation) {
    await waitTime(1);
    bookAuthorRelationData.push(relation);
    await db.write();
  }
  async getBooks() {
    await waitTime(3);
    return booksData;
  }
  async getBookById(id) {
    await waitTime(1);
    return booksData.find((book) => book.id === Number(id));
  }
  async findAuthorByBookId(bookId) {
    await waitTime(1);
    const relation = bookAuthorRelationData.find(
      (item) => item.bookId === bookId
    );
    const curAuthor = authorsData.find((item) => item.id === relation.authorId);
    return curAuthor;
  }
}
