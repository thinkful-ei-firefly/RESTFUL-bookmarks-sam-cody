module.exports = {
  driver: 'pg',
  connectionString:
    process.env.NODE_ENV === 'test'
      ? 'postgresql://dunder-mifflin@localhost/bookmarks_test'
      : 'postgresql://dunder-mifflin@localhost/bookmarks'
}
