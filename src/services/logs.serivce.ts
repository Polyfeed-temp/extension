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
  "search", // 9
];

export const eventSource: string[] = [
  "highlights", //0
  "chatgpt", //1
  "myNotes", //2
  "notes", //3
  "rating", //4
  "dashboard", //5
  "summery", //6
  "assignment", //7
  "unit", //8
  "todoList", //9
  "feedback", //10
  "menuBar", //11
];

export async function addLogs(params: {
  eventType: string;
  content: string;
  eventSource: string;
  baseUrl?: string;
}) {
  params.baseUrl = window.location.href;

  return await axios.post("/api/logs/", params);
}
