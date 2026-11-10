public sealed record ReadBook(bool? IsRead);

public static class Features
{
    public static bool TryStatus(HttpRequest request, out string status)
    {
        var values = request.Query["status"];
        status = values.Count == 0 ? "all" : values.ToString();
        return values.Count <= 1 && status is "all" or "read" or "unread";
    }

    public static void Map(WebApplication app, BookStore store)
    {
        app.MapPatch("/api/books/{id:long}/read", (long id, ReadBook input) =>
        {
            if (input.IsRead is null)
            {
                return Results.BadRequest(new { error = "isRead must be a boolean." });
            }

            var book = store.SetRead(id, input.IsRead.Value);
            return book is null ? Results.NotFound() : Results.Ok(book);
        });
    }
}
