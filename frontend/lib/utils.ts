import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export async function copyToClipboard(text: string) {
  if (!text) return false;
  
  // Try modern API
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      console.error("Clipboard API failed, falling back", err);
    }
  }

  // Fallback for non-secure contexts (HTTP/IP)
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    
    // Ensure it's not visible
    textArea.style.position = "fixed";
    textArea.style.left = "-9999px";
    textArea.style.top = "0";
    document.body.appendChild(textArea);
    
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch (err) {
    console.error("Fallback copy failed", err);
    return false;
  }
}
