"use client"

import { Alert, AlertDescription } from "@/components/ui/alert"

interface AlertMessageProps {
  type: "success" | "error"
  message: string
  onClose?: () => void
}

export function AlertMessage({ type, message, onClose }: AlertMessageProps) {
  return (
    <Alert
      variant={type === "error" ? "destructive" : "default"}
      className={type === "success" ? "bg-green-50 border-green-200" : ""}
    >
      <AlertDescription className={type === "success" ? "text-green-800" : ""}>{message}</AlertDescription>
      {onClose && (
        <button onClick={onClose} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
          ×
        </button>
      )}
    </Alert>
  )
}
