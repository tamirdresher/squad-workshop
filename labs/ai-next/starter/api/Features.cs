public static class Features
{
    public static bool TryStatus(HttpRequest request, out string status)
    {
        status = "all";
        return true;
    }

    public static void Map(WebApplication app, BookStore store)
    {
    }
}
