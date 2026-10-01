// routeerror.jsx
import { useRouteError, isRouteErrorResponse } from "react-router-dom";

export default function RootError() {
  const error = useRouteError();
  console.error(error);

  if (isRouteErrorResponse(error)) {
    // This is a route error response (e.g., 404, 500)
    return (
      <div style={{ padding: 24 }}>
        <h1>
          {error.status} {error.statusText}
        </h1>
        <p>{error.data || "Something went wrong."}</p>
      </div>
    );
  }

  if (error instanceof Error) {
    // Regular JS Error
    return (
      <div style={{ padding: 24 }}>
        <h1>Something went wrong</h1>
        <p>{error.message}</p>
      </div>
    );
  }

  // Fallback for unknown error shape
  return (
    <div style={{ padding: 24 }}>
      <h1>Unknown error</h1>
      <pre>{JSON.stringify(error, null, 2)}</pre>
    </div>
  );
}