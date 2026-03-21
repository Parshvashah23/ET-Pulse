/**
 * Simple utility wrapper for EventSource to handle SSE streaming APIs.
 */
export function streamSSE(
  url: string,
  body: any,
  onMessage: (data: string) => void,
  onComplete: () => void,
  onError: (error: any) => void
): () => void {
  const abortController = new AbortController();

  const connect = async () => {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        },
        body: JSON.stringify(body),
        signal: abortController.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("Response body is not readable");
      }

      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          onComplete();
          break;
        }

        // Add incoming chunk to buffer
        buffer += decoder.decode(value, { stream: true });
        
        // Split by \n\n to isolate complete SSE events
        const events = buffer.split("\n\n");
        // Pop the last element (either incomplete string or empty string) back into the buffer
        buffer = events.pop() || "";

        for (const event of events) {
          const lines = event.split("\n");
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                onComplete();
              } else {
                try {
                  const parsed = JSON.parse(data);
                  if (parsed.content) {
                    onMessage(parsed.content);
                  }
                } catch (e) {
                  console.error("Parse JSON error for chunk", e, data);
                  // We no longer fallback to rendering raw text UI since it's likely a malformed JSON block
                }
              }
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        onError(err);
      }
    }
  };

  connect();

  return () => abortController.abort();
}
