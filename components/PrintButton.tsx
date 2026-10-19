"use client";

export function PrintButton({ label = "Save as PDF / Print" }: { label?: string }) {
  return (
    <button onClick={() => window.print()} className="btn-primary w-full">
      {label}
    </button>
  );
}
