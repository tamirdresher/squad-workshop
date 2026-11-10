using Microsoft.Data.Sqlite;

var builder = WebApplication.CreateBuilder(args);
var database = builder.Configuration["BOOKS_DB"] ?? "books.db";
builder.Services.AddSingleton(new BookStore(database));
var app = builder.Build();
var store = app.Services.GetRequiredService<BookStore>();
store.Initialize();

app.MapGet("/api/books", (HttpRequest request) =>
{
    if (!Features.TryStatus(request, out var status))
    {
        return Results.BadRequest(new { error = "status must be all, read, or unread." });
    }

    return Results.Ok(store.List(status));
});

app.MapPost("/api/books", (CreateBook input) =>
{
    var title = input.Title?.Trim();
    var author = input.Author?.Trim();
    if (string.IsNullOrEmpty(title) || title.Length > 120 ||
        string.IsNullOrEmpty(author) || author.Length > 120)
    {
        return Results.BadRequest(new { error = "title and author are required and at most 120 characters." });
    }

    var book = store.Add(title, author);
    return Results.Created($"/api/books/{book.Id}", book);
});

Features.Map(app, store);
app.Run();

public sealed record CreateBook(string? Title, string? Author);
public sealed record Book(long Id, string Title, string Author, bool IsRead);

public sealed class BookStore(string path)
{
    private SqliteConnection Open()
    {
        var connection = new SqliteConnection(new SqliteConnectionStringBuilder
        {
            DataSource = path
        }.ToString());
        connection.Open();
        return connection;
    }

    public void Initialize()
    {
        using var connection = Open();
        using var command = connection.CreateCommand();
        command.CommandText = """
            CREATE TABLE IF NOT EXISTS books (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                author TEXT NOT NULL,
                is_read INTEGER NOT NULL DEFAULT 0
            );
            """;
        command.ExecuteNonQuery();
    }

    public Book[] List(string status)
    {
        using var connection = Open();
        using var command = connection.CreateCommand();
        command.CommandText = """
            SELECT id, title, author, is_read FROM books
            WHERE $status = 'all'
                OR ($status = 'read' AND is_read = 1)
                OR ($status = 'unread' AND is_read = 0)
            ORDER BY id;
            """;
        command.Parameters.AddWithValue("$status", status);
        using var reader = command.ExecuteReader();
        var books = new List<Book>();
        while (reader.Read())
        {
            books.Add(new Book(reader.GetInt64(0), reader.GetString(1),
                reader.GetString(2), reader.GetBoolean(3)));
        }

        return books.ToArray();
    }

    public Book Add(string title, string author)
    {
        using var connection = Open();
        using var command = connection.CreateCommand();
        command.CommandText = """
            INSERT INTO books (title, author) VALUES ($title, $author);
            SELECT last_insert_rowid();
            """;
        command.Parameters.AddWithValue("$title", title);
        command.Parameters.AddWithValue("$author", author);
        var id = (long)command.ExecuteScalar()!;
        return new Book(id, title, author, false);
    }

    public Book? SetRead(long id, bool isRead)
    {
        using var connection = Open();
        using var command = connection.CreateCommand();
        command.CommandText = """
            UPDATE books SET is_read = $isRead WHERE id = $id
            RETURNING id, title, author, is_read;
            """;
        command.Parameters.AddWithValue("$id", id);
        command.Parameters.AddWithValue("$isRead", isRead);
        using var reader = command.ExecuteReader();
        if (!reader.Read())
        {
            return null;
        }

        return new Book(reader.GetInt64(0), reader.GetString(1),
            reader.GetString(2), reader.GetBoolean(3));
    }
}
