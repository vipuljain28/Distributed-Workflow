import { google } from "googleapis";

export function getGoogleClient() {
  const email = process.env.GOOGLE_SA_EMAIL;
  const key = process.env.GOOGLE_SA_KEY;

  if (!email || !key) throw new Error("Google SA credentials missing");

  const jwt = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"]
  });

  return google.sheets({ version: "v4", auth: jwt });
}
