import { useState, useRef, useCallback } from "react";
import { uploadPortfolioVideo, deletePortfolioVideo } from "../api/client";

export default function VideoUpload({ videoUrl, onVideoChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const fileInputRef = useRef(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      handleUpload(file);
    } else {
      setError("Please drop a valid video file");
    }
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleUpload = async (file) => {
    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setError("Video must be under 50MB");
      return;
    }

    // Validate file type
    if (!file.type.startsWith("video/")) {
      setError("Please select a valid video file");
      return;
    }

    setError(null);
    setUploading(true);
    setUploadProgress(0);

    // Simulate progress (since we can't track real progress with fetch)
    const progressInterval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 15;
      });
    }, 300);

    try {
      const result = await uploadPortfolioVideo(file);
      clearInterval(progressInterval);
      setUploadProgress(100);
      setShowSuccess(true);

      // Trigger confetti effect
      if (onVideoChange) {
        onVideoChange(result.videoUrl);
      }

      // Hide success after animation
      setTimeout(() => {
        setShowSuccess(false);
        setUploadProgress(0);
      }, 2000);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err.message || "Upload failed. Please try again.");
      setUploadProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete your portfolio video?")) return;

    setDeleting(true);
    setError(null);

    try {
      await deletePortfolioVideo();
      if (onVideoChange) {
        onVideoChange(null);
      }
    } catch (err) {
      setError(err.message || "Failed to delete video");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Success Animation */}
      {showSuccess && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="animate-success-pop bg-gradient-to-r from-emerald-500 to-green-500 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3">
            <svg className="w-6 h-6 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-bold">Video Uploaded!</span>
          </div>
        </div>
      )}

      {/* Video Preview or Upload Zone */}
      {videoUrl ? (
        <div className="relative group">
          <div className="relative rounded-2xl overflow-hidden bg-black shadow-xl">
            <video
              src={videoUrl}
              controls
              className="w-full aspect-video object-contain"
              playsInline
            />

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-end justify-center pb-4">
              <div className="flex gap-3">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="bg-white/20 backdrop-blur-md text-white px-4 py-2 rounded-xl font-medium hover:bg-white/30 transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Replace
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-500/80 backdrop-blur-md text-white px-4 py-2 rounded-xl font-medium hover:bg-red-500 transition-all duration-200 flex items-center gap-2"
                >
                  {deleting ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Deleting...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Video Badge */}
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse-soft">
            Portfolio Video
          </div>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 transition-all duration-300 ${
            isDragging
              ? "border-violet-500 bg-violet-50 scale-[1.02]"
              : uploading
              ? "border-violet-300 bg-violet-50/50"
              : "border-gray-200 hover:border-violet-400 hover:bg-violet-50/50"
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-4">
              {/* Upload Animation */}
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 animate-spin-slow" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="8"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="url(#progressGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${uploadProgress * 2.51} 251`}
                    transform="rotate(-90 50 50)"
                  />
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-bold bg-gradient-to-r from-violet-600 to-pink-500 bg-clip-text text-transparent">
                    {Math.round(uploadProgress)}%
                  </span>
                </div>
              </div>
              <p className="text-violet-600 font-medium animate-pulse">Uploading your video...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isDragging
                  ? "bg-gradient-to-br from-violet-500 to-pink-500 scale-110"
                  : "bg-gradient-to-br from-violet-100 to-pink-100"
              }`}>
                <svg
                  className={`w-8 h-8 transition-colors duration-300 ${
                    isDragging ? "text-white" : "text-violet-500"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <div className="text-center">
                <p className="font-semibold text-gray-700">
                  {isDragging ? "Drop your video here!" : "Add Portfolio Video"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Drag & drop or click to browse
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  MP4, WebM, MOV up to 50MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl animate-shake flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Tips */}
      {!videoUrl && !uploading && (
        <div className="bg-gradient-to-r from-violet-50 to-pink-50 rounded-xl p-4 border border-violet-100">
          <p className="text-sm font-medium text-violet-700 mb-2 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Pro Tips for Your Video
          </p>
          <ul className="text-xs text-violet-600 space-y-1">
            <li className="flex items-start gap-2">
              <span className="text-pink-400">*</span>
              Keep it under 60 seconds - employers are busy!
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-400">*</span>
              Show your skills and personality
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-400">*</span>
              Good lighting makes a big difference
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
