/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { FileUp, FileText, Merge, Download, Trash2, FilePlus } from 'lucide-react';

export default function App() {
  const [files, setFiles] = useState<File[]>([]);
  const [mergedPdfUrl, setMergedPdfUrl] = useState<string | null>(null);
  const [isMerging, setIsMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files as FileList | null;
    if (fileList) {
      const selectedFiles = Array.from(fileList);
      const validFiles = selectedFiles.filter(file => file.type === 'application/pdf');
      
      if (validFiles.length === 0 && selectedFiles.length > 0) {
        setError('No valid PDF files selected.');
      } else if (validFiles.length !== selectedFiles.length) {
        setError('Some files were not PDFs and were ignored.');
      } else {
        setError(null);
      }
      
      setFiles(prev => [...prev, ...validFiles]);
      setMergedPdfUrl(null);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setMergedPdfUrl(null);
  };

  const handleMerge = async () => {
    if (files.length === 0) return;
    setIsMerging(true);
    setError(null);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const copiedPages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        copiedPages.forEach(page => mergedPdf.addPage(page));
      }
      const mergedPdfBytes = await mergedPdf.save();
      const blob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      setMergedPdfUrl(URL.createObjectURL(blob));
    } catch (err) {
      setError('Failed to merge PDFs.');
      console.error(err);
    } finally {
      setIsMerging(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans">
      <div className="max-w-3xl mx-auto p-4 sm:p-8">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-zinc-950 mb-2">Nalinee PDF Merger</h1>
          <p className="text-zinc-600">Securely combine your PDF files in your browser.</p>
        </header>

        <div className="bg-white p-6 sm:p-8 rounded-3xl shadow-sm border border-zinc-100">
          <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-zinc-200 rounded-2xl cursor-pointer hover:border-zinc-400 hover:bg-zinc-50 transition-all duration-200">
            <div className="flex flex-col items-center">
              <FileUp className="w-10 h-10 text-zinc-400 mb-3" />
              <span className="text-base font-medium text-zinc-700">Click to upload PDFs</span>
              <span className="text-sm text-zinc-500 mt-1">or drag and drop</span>
            </div>
            <input type="file" multiple accept="application/pdf" className="hidden" onChange={handleFileChange} />
          </label>

          {error && <p className="text-red-600 mt-4 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

          {files.length > 0 && (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-zinc-950">Files to Merge ({files.length})</h2>
                <button 
                  onClick={() => setFiles([])}
                  className="text-sm text-zinc-500 hover:text-red-600 transition"
                >
                  Clear All
                </button>
              </div>
              <ul className="space-y-3">
                {files.map((file, index) => (
                  <li key={index} className="flex items-center justify-between gap-3 text-sm text-zinc-700 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                    <div className="flex items-center gap-3 truncate">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-200 text-zinc-700 font-bold text-xs shrink-0">
                        {index + 1}
                      </span>
                      <FileText className="w-5 h-5 text-zinc-400 shrink-0" />
                      <span className="truncate">{file.name}</span>
                    </div>
                    <button onClick={() => removeFile(index)} className="text-zinc-400 hover:text-red-500 transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleMerge}
                disabled={isMerging}
                className="w-full mt-8 flex items-center justify-center gap-2 bg-zinc-900 text-white px-6 py-3 rounded-xl font-semibold hover:bg-zinc-800 transition disabled:opacity-50"
              >
                <Merge className="w-5 h-5" />
                {isMerging ? 'Merging...' : 'Merge PDFs'}
              </button>
            </div>
          )}

          {mergedPdfUrl && (
            <div className="mt-8 p-6 bg-emerald-50 border border-emerald-100 rounded-2xl text-center">
              <p className="text-emerald-900 font-medium mb-4">Mission accomplished, My Princess. Your PDF files have been merged successfully. ✨</p>
              <a
                href={mergedPdfUrl}
                download="Nalinee_Merged.pdf"
                className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition w-full sm:w-auto"
              >
                <Download className="w-5 h-5" />
                Download Nalinee_Merged.pdf
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
