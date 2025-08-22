import React, { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const ProfilePictureUpload = ({ member, onUploadSuccess, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, or GIF)');
      return;
    }

    // Validate file size (15MB)
    if (file.size > 15 * 1024 * 1024) {
      toast.error('File size must be less than 15MB');
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('profilePicture', selectedFile);

    try {
      const response = await axios.post(
        `/family/members/${member.id}/profile-picture`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      toast.success('Profile picture uploaded successfully!');
      if (onUploadSuccess) {
        onUploadSuccess(response.data.member);
      }
      onClose();
    } catch (error) {
      console.error('Upload error:', error);
      const message = error.response?.data?.message || 'Failed to upload profile picture';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setSelectedFile(null);
    setPreview(null);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Upload Profile Picture
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Current Profile Picture */}
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Current Profile Picture:</p>
            <div className="w-20 h-20 rounded-full mx-auto overflow-hidden border-2 border-gray-200">
              {member.profile_picture ? (
                <img
                  src={`${process.env.REACT_APP_API_URL?.replace('/api', '')}${member.profile_picture}`}
                  alt="Current profile picture"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center text-2xl">
                  {member.gender === 'male' ? '👨' : member.gender === 'female' ? '👩' : '👤'}
                </div>
              )}
            </div>
          </div>

          {/* File Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select New Picture
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
            />
                    <p className="text-xs text-gray-500 mt-1">
          Supported formats: JPEG, PNG, GIF (max 15MB)
        </p>
          </div>

          {/* Preview */}
          {preview && (
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Preview:</p>
              <div className="w-20 h-20 rounded-full mx-auto overflow-hidden border-2 border-gray-200">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <button
                onClick={handleRemove}
                className="text-sm text-red-600 hover:text-red-800 mt-2"
              >
                Remove
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!selectedFile || uploading}
              className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors"
            >
              {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePictureUpload;
