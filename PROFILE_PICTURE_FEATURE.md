# Profile Picture & Member Management Features

## Overview
The Family Health Tracker now supports profile pictures for family members and enhanced member management with email and password editing capabilities.

## Features

### ✅ **Profile Picture Upload**
- Upload profile pictures for each family member
- Supports JPEG, PNG, and GIF formats
- Maximum file size: 5MB
- Automatic image preview before upload
- Responsive design with hover effects

### ✅ **Smart Fallback System**
- Displays uploaded profile pictures when available
- Falls back to gender-based icons when no picture is uploaded
- Maintains consistent styling and sizing

### ✅ **Integrated Upload Interface**
- Profile picture upload integrated into Edit Member forms
- Modal-based upload interface with preview
- Drag-and-drop file selection
- Real-time validation and error handling

### ✅ **Enhanced Member Management**
- Edit member details including name, date of birth, and gender
- Update email addresses for family members
- Change passwords securely
- Improved error handling with specific error messages
- Only send changed fields to the server

## How to Use

### Uploading a Profile Picture

1. **From Dashboard:**
   - Click "Edit" button on any family member's card
   - In the Edit Member form, scroll down to the "Profile Picture" section
   - Click "Upload New Picture" button
   - Select an image file (JPEG, PNG, or GIF)
   - Preview the image
   - Click "Upload" to save

2. **From Member Page:**
   - Navigate to any family member's detailed page
   - Click "Edit Member" button in the header
   - In the Edit Member form, scroll down to the "Profile Picture" section
   - Click "Upload New Picture" button
   - Follow the same upload process

### Editing Member Details

1. **From Dashboard:**
   - Click "Edit" button on any family member's card
   - Modify any of the following fields:
     - Name
     - Date of Birth
     - Gender
     - Email Address
     - Password (leave blank to keep current)
   - Click "Update Member" to save changes

2. **From Member Page:**
   - Click "Edit Member" button in the header
   - Modify any member details
   - Click "Update Member" to save changes

### Supported File Types
- **JPEG** (.jpg, .jpeg)
- **PNG** (.png)
- **GIF** (.gif)

### File Size Limits
- Maximum file size: 5MB
- Recommended resolution: 400x400 pixels or higher
- Images are automatically resized and optimized

## Technical Implementation

### Database Changes
- Added `profile_picture` field to `family_members` table
- Stores file path for uploaded images
- Enhanced user management with email/password updates

### Backend API
- New endpoint: `POST /api/family/members/:memberId/profile-picture`
- Enhanced endpoint: `PUT /api/family/members/:memberId` (supports email/password)
- File validation and processing
- Automatic file naming and storage
- Improved error handling with specific error codes

### Frontend Components
- `ProfilePicture`: Displays profile pictures with fallback icons
- `ProfilePictureUpload`: Modal for uploading new pictures
- Enhanced Edit Member forms with email/password fields
- Integrated into Dashboard and Member pages

### File Storage
- Images stored in `/uploads/profiles/` directory
- Unique filenames to prevent conflicts
- Static file serving for image access

## Error Handling

### Member Creation Errors
- **Email Already Exists**: Clear message when email is already registered
- **Invalid Data**: Validation errors for form fields
- **Database Errors**: Specific error messages for constraint violations
- **Network Errors**: User-friendly error messages

### Profile Picture Upload Errors
- **File Too Large**: Clear size limit messaging
- **Invalid File Type**: Supported format information
- **Upload Failures**: Detailed error messages

## Benefits

1. **Personalization**: Make family members more recognizable
2. **Visual Appeal**: Better user experience with real photos
3. **Accessibility**: Easier identification of family members
4. **Professional Look**: More polished and modern interface
5. **Enhanced Security**: Secure password management
6. **Better UX**: Clear error messages and validation

## Future Enhancements

- Image cropping and editing tools
- Multiple profile picture support
- Automatic image optimization
- Cloud storage integration (AWS S3, etc.)
- Profile picture removal functionality
- Two-factor authentication
- Password strength indicators

## Troubleshooting

### Common Issues

1. **Upload Fails**
   - Check file size (must be < 5MB)
   - Ensure file is JPEG, PNG, or GIF
   - Verify internet connection

2. **Image Not Displaying**
   - Check if file was uploaded successfully
   - Verify file permissions in uploads directory
   - Clear browser cache

3. **Upload Button Not Appearing**
   - Make sure you're in the Edit Member form
   - Look for the "Profile Picture" section at the bottom of the form
   - Ensure you're logged in with proper permissions

4. **Email Update Fails**
   - Check if email is already in use by another user
   - Ensure email format is valid
   - Verify you have permission to edit the member

5. **Password Update Fails**
   - Ensure password meets minimum length (6 characters)
   - Check for special characters if required
   - Verify current password if required

### File Permissions
Ensure the uploads directory has proper write permissions:
```bash
chmod 755 uploads/
chmod 755 uploads/profiles/
```
