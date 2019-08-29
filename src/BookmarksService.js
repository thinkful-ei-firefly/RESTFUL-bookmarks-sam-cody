const BookmarksService = {

  getBookmarks(db) {
    return db
      .select('*')
      .from('bookmarks')
  },

  getBookmark(db, id) {
    return db
      .select('*')
      .from('bookmarks')
      .where({ id })
  },

  addBookmarks(db, newItems) {
    return db
    .into('bookmarks')
    .insert(newItems)
    .returning('*')
  },

  deleteBookmark(db, id) {
    return db('bookmarks')
      .where({ id })
      .delete()
      .returning('*')
  },
  updateBookmark(db, id, newInfo) {
    return db('bookmarks')
      .where({ id })
      .update(newInfo)
      .returning('*')
  }
}

module.exports = BookmarksService