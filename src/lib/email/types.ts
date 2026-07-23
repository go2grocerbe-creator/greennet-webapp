export type EmailMessage = {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
};

export type EmailResult = {
  success: boolean;
  id?: string;
  error?: string;
};

export interface EmailProvider {
  send(message: EmailMessage): Promise<EmailResult>;
}
