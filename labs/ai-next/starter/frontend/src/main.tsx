import { useEffect, useState, type FormEvent } from "react";
import { createRoot } from "react-dom/client";
import { features } from "./features";
import "./style.css";

type Book = {
  id: number;
  title: string;
  author: string;
  isRead: boolean;
};

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [status, setStatus] = useState("all");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load(signal?: AbortSignal) {
    const query = features.filter ? `?status=${status}` : "";
    const response = await fetch(`/api/books${query}`, { signal });
    if (!response.ok) {
      throw new Error("Could not load books.");
    }

    const next: Book[] = await response.json();
    if (!signal?.aborted) {
      setBooks(next);
    }
  }

  useEffect(() => {
    const controller = new AbortController();
    setError("");
    load(controller.signal).catch((cause: Error) => {
      if (!controller.signal.aborted) {
        setError(cause.message);
      }
    });
    return () => {
      controller.abort();
    };
  }, [status]);

  async function add(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: title.trim(), author: author.trim() })
      });
      if (!response.ok) {
        throw new Error("Add failed: title and author must contain 1–120 characters.");
      }

      setTitle("");
      setAuthor("");
      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Request failed.");
    } finally {
      setBusy(false);
    }
  }

  async function toggle(book: Book) {
    setBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/books/${book.id}/read`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isRead: !book.isRead })
      });
      if (!response.ok) {
        throw new Error("Read status could not be saved.");
      }

      await load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Request failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <h1>Personal reading list</h1>
      <p>Add your next book. Your list is stored locally in SQLite.</p>
      <form onSubmit={add}>
        <label>Title
          <input required maxLength={120} value={title}
            onChange={(event) => {
              setTitle(event.target.value);
            }} />
        </label>
        <label>Author
          <input required maxLength={120} value={author}
            onChange={(event) => {
              setAuthor(event.target.value);
            }} />
        </label>
        <button disabled={busy}>Add book</button>
      </form>
      {features.filter && (
        <label>Show
          <select value={status} disabled={busy} onChange={(event) => {
            setStatus(event.target.value);
          }}>
            <option value="all">All</option>
            <option value="read">Read</option>
            <option value="unread">Unread</option>
          </select>
        </label>
      )}
      {error && <p role="alert">{error}</p>}
      <ul aria-label="Books">
        {books.map((book) => (
          <li key={book.id}>
            <span><strong>{book.title}</strong> — {book.author}</span>
            {features.read && (
              <button disabled={busy} aria-label={`Mark ${book.title} ${book.isRead ? "unread" : "read"}`}
                onClick={() => {
                  void toggle(book);
                }}>
                {book.isRead ? "Read ✓" : "Unread"}
              </button>
            )}
          </li>
        ))}
      </ul>
      {books.length === 0 && <p>No books in this view.</p>}
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
