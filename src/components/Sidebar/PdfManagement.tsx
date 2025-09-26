import React, { useEffect, useState } from 'react';
import {
  useHighlighterDispatch,
  useHighlighterState,
} from '../../store/HighlightContext';

import { useFileStore } from '../../store/fileStore';
import { Annotation, AnnotationTag, Feedback } from '../../types';
import { annotationTagsIcons } from '../AnnotationIcons';
import { Button, collapse } from '@material-tailwind/react';
import { v4 as uuidv4 } from 'uuid';
import { addLogs, eventSource, eventType } from '../../services/logs.serivce';
import AnnotationService from '../../services/annotation.service';
import { toast } from 'react-toastify';

const PdfManagement = ({ feedback }: { feedback: Feedback }) => {
  const highlighterState = useHighlighterState();

  const {
    createFile,
    fetchFilesByFeedbackId,
    fileList,
    loading,
    setSelectedFile,
    selectedFile,
    fetchingListLoading,
    selectedText,
    setAssociatedHighlights,
    setSelectedText,
  } = useFileStore();

  useEffect(() => {
    if (feedback) {
      fetchFilesByFeedbackId(feedback.id);
    }
  }, [feedback]);

  const renderLoading = () => {
    return (
      <div className="w-6 h-6 border-4 border-gray-300 border-t-black rounded-full animate-spin" />
    );
  };

  const annotationTags: AnnotationTag[] = [
    'Strength',
    'Weakness',
    'Suggestions',
    'Confused',
    'Other',
  ];

  const [selectedTag, setSelectedTag] = useState<AnnotationTag>('Strength');
  const annotationDispatch = useHighlighterDispatch();
  const annotationService = new AnnotationService();

  // Check if selected text has at least 2 words
  const hasMinimumWords = (text: string): boolean => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    return words.length >= 2;
  };

  // Calculate button disabled state
  const isButtonDisabled = !selectedText || !selectedTag || !hasMinimumWords(selectedText);

  const createHighLight = async () => {
    // Validate minimum word count
    if (!hasMinimumWords(selectedText)) {
      toast.error('Please select at least 2 words to highlight');
      return;
    }

    let tag = selectedTag;
    if (tag === 'Suggestions') tag = 'Action Item';

    const state = useFileStore.getState();
    const { currentPage, selectedTextIndex } = state;
    const coordinates = (state as any).selectedTextCoordinates;
    const uniqueKey = (state as any).selectedTextUniqueKey;

    const annotation: Annotation = {
      feedbackId: feedback.id,
      id: uuidv4(),
      annotationTag: tag,
      startMeta: {
        parentTagName: `${selectedFile?.id || ''}`, // File ID (unchanged)
        parentIndex: currentPage,                    // Page number
        textOffset: selectedTextIndex,              // Position index
      },
      endMeta: {
        parentTagName: coordinates ? JSON.stringify(coordinates) : '', // Store coordinates as JSON string
        parentIndex: 0,
        textOffset: selectedText.length, // Store text length for validation
      },
      text: selectedText,
    };


    addLogs({
      eventType: eventType[2],
      content: JSON.stringify(annotation),
      eventSource: eventSource[0],
    });

    annotationDispatch({
      type: 'ADD_RECORD',
      payload: { annotation: annotation },
    });

    setTimeout(async () => {
      const newFeedback = await annotationService.getCurrentPageFeedback();
      console.log('🔄 Got new feedback:', newFeedback);
      annotationDispatch({ type: 'INITIALIZE', payload: newFeedback });

      // Update associated highlights after creating new highlight
      if (selectedFile && newFeedback?.highlights) {
        const newAssociatedHighlights = newFeedback.highlights.filter(
          (highlight) =>
            highlight?.annotation?.startMeta?.parentTagName ===
            selectedFile.id.toString()
        );

        console.log('📋 Associated highlights for file:', {
          fileId: selectedFile.id,
          totalHighlights: newFeedback.highlights.length,
          associatedCount: newAssociatedHighlights.length,
          associated: newAssociatedHighlights.map(h => ({
            text: h.annotation.text,
            tag: h.annotation.annotationTag,
            page: h.annotation.startMeta.parentIndex
          }))
        });

        // Store current file
        const currentFile = selectedFile;

        // Temporarily clear selected file
        setSelectedFile(null);

        // Reset selected file after a brief delay to trigger reload
        setTimeout(() => {
          setSelectedFile(currentFile);
          setAssociatedHighlights(newAssociatedHighlights);
          console.log('✅ Updated file and highlights');
        }, 100);
      }
      setSelectedText('');
      const { setSelectedTextIndex } = useFileStore.getState();
      setSelectedTextIndex(0);
    }, 1000);
  };

  const uploadFile = () => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = '.pdf';

    fileInput.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        addLogs({
          eventType: eventType[2],
          content: `Uploaded new PDF file: ${file.name}`,
          eventSource: eventSource[12],
        });

        const reader = new FileReader();
        reader.onload = () => {
          const base64String = reader.result as string;
          createFile(highlighterState?.feedbackInfo?.id || 0, base64String);
        };
        reader.readAsDataURL(file);
      }
    };

    fileInput.click();
  };

  const handleFileSelection = (file: any) => {
    if (selectedFile?.id === file.id) {
      addLogs({
        eventType: eventType[6],
        content: `Closed PDF file: ${file.id}`,
        eventSource: eventSource[12],
      });
      setSelectedFile(null);
      return;
    }

    addLogs({
      eventType: eventType[1],
      content: `Selected PDF file: ${file.id}`,
      eventSource: eventSource[12],
    });

    if (feedback.highlights) {
      const associatedHighlights = feedback.highlights.filter(
        (highlight) =>
          highlight?.annotation?.startMeta?.parentTagName === file.id.toString()
      );
      setAssociatedHighlights(associatedHighlights);
    }
    setSelectedFile(file);
  };

  return (
    <div className="border-2 border-gray-300 rounded-xl p-5 bg-white shadow-sm">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        Manage PDF Feedback Files
      </h3>
      <div className="space-y-4">
        {/* Step 1: Upload PDF */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex items-center justify-center w-6 h-6 bg-black text-white rounded-full text-sm font-bold">
              1
            </span>
            <h4 className="font-semibold text-gray-900">Upload PDF File</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Upload the PDF feedback file you want to analyze and highlight.
          </p>
          <div className="flex justify-start">
            {loading ? (
              renderLoading()
            ) : (
              <Button
                onClick={() => uploadFile()}
                className="bg-black hover:bg-gray-800 text-white font-medium px-4 py-2 rounded-lg shadow-sm"
              >
                Upload PDF
              </Button>
            )}
          </div>
        </div>

        {/* Step 2: Select PDF */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="flex items-center justify-center w-6 h-6 bg-black text-white rounded-full text-sm font-bold">
              2
            </span>
            <h4 className="font-semibold text-gray-900">Select PDF to View</h4>
          </div>
          <p className="text-sm text-gray-600 mb-3">
            Choose a PDF file to open in the viewer for highlighting and
            analysis.
          </p>

          {fetchingListLoading ? (
            <div className="flex justify-center py-4">{renderLoading()}</div>
          ) : fileList.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {fileList.map((file, index) => (
                <button
                  key={file.id}
                  onClick={() => handleFileSelection(file)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                    selectedFile?.id === file.id
                      ? 'bg-black text-white shadow-md'
                      : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50'
                  }`}
                >
                  PDF - {index + 1}
                  {selectedFile?.id === file.id && (
                    <span className="ml-2 text-xs">✓ Open</span>
                  )}
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500 text-sm">No PDF files uploaded yet</p>
            </div>
          )}
        </div>
      </div>

      {selectedText && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-5">
          <h4 className="font-bold text-gray-900 mb-3">
            Selected Text from PDF
          </h4>
          <div className="bg-white p-3 rounded-lg border border-gray-200 mb-4 max-h-32 overflow-y-auto">
            <p className="text-gray-800 text-sm leading-relaxed">
              {selectedText}
            </p>
          </div>

          <h5 className="font-semibold text-gray-900 mb-3">
            Choose Annotation Type
          </h5>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {annotationTags.map((tag) => (
              <button
                key={tag}
                className={`flex flex-col items-center p-2.5 rounded-lg border-2 transition-all duration-200 cursor-pointer min-h-[72px] ${
                  selectedTag === tag
                    ? 'border-black bg-black text-white'
                    : 'border-gray-300 bg-white hover:border-blue-500 hover:bg-blue-50 text-gray-700'
                }`}
                onClick={() => {
                  setSelectedTag(tag);
                  addLogs({
                    eventType: eventType[0], // click
                    content: `Selected annotation tag: ${tag}`,
                    eventSource: eventSource[12], // pdf
                  });
                }}
              >
                <img
                  src={annotationTagsIcons[tag]}
                  className="w-10 h-5 mb-1.5"
                  alt={tag}
                />
                <span className="text-xs font-medium text-center leading-tight px-1">
                  {tag === 'Confused' ? 'Confusion' : tag}
                </span>
              </button>
            ))}
          </div>

          {selectedText && !hasMinimumWords(selectedText) && (
            <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <span className="text-yellow-700 text-sm">
                  ⚠️ Please select at least 2 words to create a highlight
                </span>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              className={`font-medium px-4 py-2 rounded-lg shadow-sm flex-1 ${
                isButtonDisabled
                  ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  : 'bg-black hover:bg-gray-800 text-white cursor-pointer'
              }`}
              disabled={isButtonDisabled}
              onClick={() => {
                if (isButtonDisabled) {
                  return;
                }

                addLogs({
                  eventType: eventType[2], // create
                  content: `Created highlight with tag ${selectedTag}`,
                  eventSource: eventSource[12], // pdf
                });
                createHighLight();
              }}
            >
              Create Highlight
            </Button>

            <Button
              className="bg-gray-600 hover:bg-gray-700 text-white font-medium px-4 py-2 rounded-lg shadow-sm"
              disabled={!selectedText}
              onClick={() => {
                addLogs({
                  eventType: eventType[8], // delete
                  content: 'Cleared highlight selection',
                  eventSource: eventSource[12], // pdf
                });
                setSelectedText('');
              }}
            >
              Clear
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export { PdfManagement };
export default PdfManagement;