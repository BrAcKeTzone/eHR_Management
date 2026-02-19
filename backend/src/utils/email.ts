import nodemailer, { TransportOptions, Transporter } from "nodemailer";

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
}

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  tls?: {
    rejectUnauthorized: boolean;
  };
  connectionTimeout?: number;
  socketTimeout?: number;
}

const createTransporter = (): Transporter => {
  const port = parseInt(process.env.EMAIL_PORT || "587", 10);
  const secure = port === 465; // Use secure connection for port 465, TLS for 587

  const config: EmailConfig = {
    host: process.env.EMAIL_HOST,
    port,
    secure,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false, // Allow self-signed certificates (needed for Railway)
    },
    connectionTimeout: 10000, // 10 seconds
    socketTimeout: 10000, // 10 seconds
  };

  return nodemailer.createTransport(config as TransportOptions);
};

const sendEmail = async (options: EmailOptions): Promise<void> => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `BCFI HR Application System <${process.env.EMAIL_USERNAME}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
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
