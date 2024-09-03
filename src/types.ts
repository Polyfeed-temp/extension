import HighlightSource from "web-highlighter/dist/model/source";
import { DomMeta } from "../node_modules/web-highlighter/dist/types";
export interface Annotation {
  feedbackId: number;
  startMeta: DomMeta;
  endMeta: DomMeta;
  text: string;
  id: string;
  annotationTag: AnnotationTag;
  notes?: string;
}

export type SideBarAction = "To-Dos" | "Notes";
export type AnnotationTag =
  | "Strength"
  | "Weakness"
  | "Action Item"
  | "Confused"
  | "Other"
  | "Suggestions";

export type ActionPointCategory =
  | "Further Practice"
  | "Contact Tutor"
  | "Ask Classmates"
  | "Refer Learning Resources"
  | "Explore Online"
  | "Other";

export interface AnnotationData {
  annotation: Annotation;
  // notes?: AnnotationNotes
  actionItems?: AnnotationActionPoint[];
}

export interface AnnotationNotes {
  content: string;
}
export interface AnnotationActionPoint {
  id?: number;
  action: string;
  category: ActionPointCategory;
  deadline: Date;
  status: boolean;
}

export interface Feedback {
  id: number;
  assessmentId: number;
  assessmentName: string;
  unitCode: string;
  mark: number;
  clarity?: number;
  personalise?: number;
  evaluativeJudgement?: number;
  usability?: number;
  emotion?: number;
  highlights?: AnnotationData[];
  marker?: string;
  url: string;
  studentEmail: string;
  gptQueryText?: string;
  gptResponse?: string;
  gptResponseRating?: number;
  performance?: string;
  feedbackUseful?: string;
}
export interface FeedbackRating {
  clarity: number;
  personalise: number;
  evaluativeJudgement: number;
  usability: number;
  emotion: number;
}
export interface Assessment {
  id: number;
  assessmentName: string;
  rubric?: string;
}

export interface Unit {
  unitId: string;
  unitCode: string;
  year: number;
  semester: number;
  assessments: Assessment[];
}

export type Role = "Student" | "Tutor" | "Admin" | "Chief Examiner";

export type Faculty =
  | "Information Technology"
  | "Engineering"
  | "Arts"
  | "Business and Economics"
  | "Science"
  | "Medicine, Nursing and Health Sciences"
  | "Education"
  | "Law"
  | "Pharmacy"
  | "Art, Design and Architecture"
  | "Pharmacy and Pharmaceutical Sciences";

export interface User {
  firstName: string;
  monashId?: string;
  monashObjectId: string | null;
  authcate: string;
  email: string;
  lastName: string;
  role: Role;
  faculty: Faculty;
}

export interface UserState {
  login: boolean;
  access_token?: string;
  user?: User;
}

export function getColorForTag(tag: AnnotationTag | undefined) {
  switch (tag) {
    case "Strength":
      return "#3a70b7";
    case "Weakness":
      return "#ef5975";
    case "Action Item":
      return "#23bfc6";
    case "Confused":
      return "#f79633";
    case "Other":
      return "#8960aa";
    default:
      return "gray-500";
  }
}
export function getClassForTag(tag: AnnotationTag | undefined) {
  switch (tag) {
    case "Strength":
      return "Strength";
    case "Weakness":
      return "Weakness";
    case "Action Item":
      return "ActionItem";
    case "Confused":
      return "Confused";
    case "Other":
      return "Other";
    default:
      return "gray-500";
  }
}
