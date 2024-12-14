import { create } from "zustand";
import axios from "../services/api.service";
import { toast } from "react-toastify";
import { AnnotationData } from "../types";

interface File {
  id: string;
  name: string;
  file_content: string;
  feedback_id: number;
  created_at: string;
}

interface FlagKeyword {
  keyword: string;
  matchCase: boolean;
  wholeWords: boolean;
}

interface FileStore {
  // State
  selectedFile: File | null;
  fileList: File[];
  loading: boolean;

  documentLoaded: boolean;
  setDocumentLoaded: (documentLoaded: boolean) => void;

  fetchingListLoading: boolean;
  selectedText: string;
  currentKeyword: FlagKeyword;

  associatedHighlights: AnnotationData[];
  // Setters
  setSelectedFile: (file: File | null) => void;
  setFileList: (files: File[]) => void;
  setLoading: (loading: boolean) => void;
  setFetchingListLoading: (loading: boolean) => void;
  setSelectedText: (text: string) => void;
  setCurrentKeyword: (keyword: FlagKeyword) => void;
  setAssociatedHighlights: (associatedHighlights: AnnotationData[]) => void;

  // API Actions
  fetchFilesByFeedbackId: (feedbackId: number) => Promise<void>;
  createFile: (feedbackId: number, fileData: string) => Promise<void>;
}

export const useFileStore = create<FileStore>((set) => ({
  // Initial state
  selectedFile: null,
  fileList: [],
  loading: false,
  fetchingListLoading: false,
  selectedText: "",
  currentKeyword: { keyword: "", matchCase: false, wholeWords: false },
  associatedHighlights: [],
  documentLoaded: false,
  setDocumentLoaded: (documentLoaded: boolean) =>
    set({ documentLoaded: documentLoaded }),

  // Setters
  setSelectedFile: (file: File | null) => set({ selectedFile: file }),
  setFileList: (files: File[]) => set({ fileList: files }),
  setLoading: (loading: boolean) => set({ loading }),
  setFetchingListLoading: (loading: boolean) =>
    set({ fetchingListLoading: loading }),
  setSelectedText: (text: string) => set({ selectedText: text }),
  setCurrentKeyword: (keyword: FlagKeyword) => set({ currentKeyword: keyword }),
  setAssociatedHighlights: (associatedHighlights: AnnotationData[]) =>
    set({ associatedHighlights }),

  // API Actions
  fetchFilesByFeedbackId: async (feedbackId: number) => {
    try {
      set({ fetchingListLoading: true });
      const response = await axios.get(`/api/file/list/${feedbackId}`);
      set({ fileList: response.data, fetchingListLoading: false });
    } catch (error) {
      set({ fetchingListLoading: false });
      console.error("Error fetching files:", error);
      throw error;
    }
  },

  createFile: async (feedbackId: number, file: string) => {
    try {
      set({ loading: true });

      const response = await axios.post(`/api/file/`, {
        feedback_id: feedbackId,
        file_content: file,
      });

      toast("File uploaded successfully");

      // Update the file list after successful creation
      set((state: any) => ({
        fileList: [...state.fileList, response.data],
        loading: false,
      }));
    } catch (error) {
      toast("Error uploading file");
      console.error("Error creating file:", error);
      throw error;
    }
  },
}));
