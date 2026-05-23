type ToastProps = { message: string };

export default function Toast({ message }: ToastProps) {
  if (!message) return null;
  return (
    <div className="fixed inset-x-4 bottom-24 z-30 mx-auto max-w-sm rounded-2xl bg-ink px-4 py-3 text-center text-sm font-semibold text-white shadow-soft">
      {message}
    </div>
  );
}
