import { Resend } from "resend";

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

// Validate API key on startup
if (!process.env.RESEND_API_KEY) {
  console.warn("RESEND_API_KEY is not set in environment variables");
}

// Get from email - use FROM_EMAIL env var or fallback to noreply@resend.dev
const getFromEmail = (): string => {
  const fromEmail = process.env.FROM_EMAIL || "noreply@resend.dev";

  if (!process.env.FROM_EMAIL) {
    console.warn(
      "FROM_EMAIL not configured. Using default noreply@resend.dev. " +
        "To send to other recipients, set FROM_EMAIL to your verified domain email (e.g., FROM_EMAIL=hello@yourdomain.com) " +
        "or your Resend account email for testing.",
    );
  }

  return fromEmail;
};

const sendEmail = async (options: EmailOptions): Promise<void> => {
  if (!process.env.RESEND_API_KEY) {
    throw new Error(
      "RESEND_API_KEY is not configured in environment variables",
    );
  }

  const result = await resend.emails.send({
    from: getFromEmail(),
    to: options.email,
    subject: options.subject,
    text: options.message,
  });

  if (result.error) {
    throw new Error(
      `Resend API error: ${result.error.message || "Unknown error"}`,
    );
  }
};

// Retry logic with exponential backoff
const sendEmailWithRetry = async (
  options: EmailOptions,
  maxRetries: number = 3,
  initialDelayMs: number = 1000,
): Promise<void> => {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      await sendEmail(options);
      console.log(`Email sent successfully to ${options.email}`);
      return; // Success, exit immediately
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(
        `Email send attempt ${attempt + 1}/${maxRetries} failed:`,
        lastError.message,
      );

      // Don't retry if it's the last attempt
      if (attempt < maxRetries - 1) {
        // Exponential backoff: delay = initialDelayMs * 2^attempt
        const delayMs = initialDelayMs * Math.pow(2, attempt);
        console.log(`Retrying in ${delayMs}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  // All retries exhausted
  throw lastError || new Error("Failed to send email after multiple attempts");
};

export default sendEmail;
export { sendEmailWithRetry };
