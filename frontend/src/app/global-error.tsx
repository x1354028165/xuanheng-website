"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="zh-CN">
      <body className="bg-[#0C1829] text-white antialiased">
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <div className="mb-8 text-8xl font-bold text-[#38C4E8]">500</div>
          <h1 className="mb-4 text-2xl font-bold sm:text-3xl">
            Server Error
          </h1>
          <p className="mb-8 max-w-md text-white/60">
            Sorry, the server encountered an unexpected error. Please try again later.
          </p>
          <button
            onClick={() => reset()}
            className="inline-flex items-center rounded-lg bg-[#1A3FAD] px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-[#1A3FAD]/80"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
