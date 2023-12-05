import HighlightSource from 'web-highlighter/dist/model/source';
import { DomMeta } from '../node_modules/web-highlighter/dist/types';
export interface Annotation {
  startMeta: DomMeta;
  endMeta: DomMeta;
  text: string;
  id: string;
  annotationTag: AnnotationTag;
}

export type SideBarAction = "To-Dos" | "Notes" | "Explain Further"
export type AnnotationTag = "Strength" | "Weakness" | "Action Item" | "Confused" | "Other"

export type ActionPointCategory =
  | "Further Practice"
  | "Contact Tutor"
  | "Ask Classmate"
  | "Refer Learning Resources"
  | "Explore Online"
  | "Other";

export interface AnnotationData {
  annotation: Annotation;
  notes?: AnnotationNotes
  todo?: AnnotationActionPoint[]
  gptResponse?: string
}

export interface AnnotationNotes {
  content: string;

}
export interface AnnotationActionPoint {
  action: string;
  actionpoint: ActionPointCategory;
  deadline: Date;
  completed: boolean;
}

export interface Feedback {
  assessmentID: number
  assessmentName: string;
  unitCode: string;
  mark: number;
  clarity?: number
  personalise?: number
  usability?: number
  emotion?: number
  highlights?: AnnotationData[];
  marker: string;
}
export interface Assessment {
  id: number
  assessmentName: string;
  rubric?: string;
}


export interface Unit {
  id: number
  unitCode: string;
  year: number
  semester: number
  assessments: Assessment[];

}

type role = "Student" | "Tutor" | "Admin" | "Chief Examiner"

export interface User {
  firstName: string;
  monashId: string;
  monashObjectId: string | null
  authcate: string
  email: string
  lastName: string;
  role: role
  faculty: string;
}

export interface UserState {
  login: boolean;
  access_token?: string;
  user?: User;
}