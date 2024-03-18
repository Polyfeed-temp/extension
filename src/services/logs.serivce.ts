import axios from "./api.service";

export const eventType: string[] = [
  "click", //0
  "open", //1
  "create", //2
  "update", //3
  "typing", //4
  "login", //5
  "close", //6
  "navigate", //7
  "delete", // 8
];

export const tagName: string[] = ["auth", "form"];

export const eventSource: string[] = [
  "highlights", //0
  "chatgpt", //1
  "notes", //2
  "rating", //3
  "dashboard", //4
  "summery", //5
  "assignment", //6
  "unit", //7
];

export async function addLogs(params: {
  eventType: string;
  tagName: string;
  content: string;
  eventSource: string;
  baseUrl?: string;
}) {
  params.baseUrl = window.location.href;

  return await axios.post("/api/logs/", params);
}
