/**
 * Sanitizes input strings to prevent Stored XSS attacks.
 * It escapes basic HTML entities so that tags like <script> are converted
 * to safe representations (&lt;script&gt;) before being stored in the database.
 */
export const sanitizeHtml = (input: string): string => {
  if (typeof input !== "string") return input;
  
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
};
