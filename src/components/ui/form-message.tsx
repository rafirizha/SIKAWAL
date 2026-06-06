import { cn } from "@/lib/utils";

export type FormMessageStatus = "idle" | "success" | "error";

type FormMessageProps = {
  message: string;
  status?: FormMessageStatus;
};

/**
 * Single message box for server-action results across every form.
 * Error uses the `destructive` token; success uses emerald.
 */
export function FormMessage({ message, status = "error" }: FormMessageProps) {
  if (!message) {
    return null;
  }

  const isSuccess = status === "success";

  return (
    <div
      aria-live="polite"
      className={cn(
        "rounded-md border px-4 py-3 text-sm leading-6",
        isSuccess
          ? "border-emerald-200 bg-emerald-50 text-emerald-800"
          : "border-destructive/30 bg-destructive/5 text-destructive",
      )}
      role={status === "error" ? "alert" : "status"}
    >
      {message}
    </div>
  );
}
