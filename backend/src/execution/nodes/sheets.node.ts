import axios from "axios";
import { NodeExecutionResult } from "../types";
import { getGoogleClient } from "../../lib/google";

export class SheetsNode {
  private config: any;

  constructor(config: any) {
    this.config = config ?? {};
  }

  async execute(input: any): Promise<NodeExecutionResult> {
    const sheetId = this.config.sheetId;
    const range = this.config.range ?? "Sheet1!A:Z";
    const mode = this.config.mode ?? "append"; // "append" | "read"
    const fallbackUrl = this.config.fallbackUrl ?? process.env.SHEETY_URL;

    try {
      if (!sheetId) {
        // fallback to simple API
        if (!fallbackUrl) {
          return { success: false, errorMessage: "sheetId or fallbackUrl required" };
        }
        const payload = this.config.row ?? input ?? {};
        const res = await axios.post(fallbackUrl, payload);
        return { success: true, output: { sheety_response: res.data } };
      }

      // REAL GOOGLE API MODE
      const sheets = getGoogleClient();

      if (mode === "append") {
        const row = this.config.row ?? input ?? {};
        const values = [Object.values(row)];

        await sheets.spreadsheets.values.append({
          spreadsheetId: sheetId,
          range,
          valueInputOption: "USER_ENTERED",
          requestBody: { values }
        });

        return { success: true, output: { google: "row_appended", values } };
      }

      if (mode === "read") {
        const result = await sheets.spreadsheets.values.get({
          spreadsheetId: sheetId,
          range
        });
        return { success: true, output: { rows: result.data.values ?? [] } };
      }

      return { success: false, errorMessage: "Invalid mode" };
    } catch (err: any) {
      return { success: false, errorMessage: String(err?.message ?? err) };
    }
  }
}
