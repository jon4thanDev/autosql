export async function fetchAPI<T>(
  endpoint: string,
  method: "GET" | "POST" | "PUT" | "DELETE",
  body?: Record<string, unknown> | null,
  params?: Record<string, string | number | boolean> | null
): Promise<T> {
  const url = new URL(`http://localhost:5000${endpoint}`);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  return await fetch(url.toString(), {
    method,
    headers: { "Content-Type": "application/json" },
    body: method !== "GET" && body ? JSON.stringify(body) : null,
  })
    .then(async (res) => {
      if (!res.ok) {
        let errorMessage = "An error occurred.";
        try {
          const errorResponse = await res.json();
          errorMessage =
            errorResponse.message && typeof errorResponse.message === "string"
              ? errorResponse.message
              : errorMessage;
        } catch {
          // The response body is empty or not JSON, keep default errorMessage
        }
        throw new Error(errorMessage);
      }

      if (res.status === 204 || res.headers.get("Content-Length") === "0") {
        return null as unknown as T; // Handle empty response gracefully
      }

      return res.json() as Promise<T>;
    })
    .catch((error) => {
      throw new Error(error.message);
    });
}
