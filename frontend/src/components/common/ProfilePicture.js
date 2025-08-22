import React from 'react';

const ProfilePicture = ({ 
  member, 
  size = 'md', 
  className = '', 
  onClick = null,
  showUploadButton = false,
  onUploadClick = null 
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-2xl',
    xl: 'w-20 h-20 text-3xl',
    '2xl': 'w-24 h-24 text-4xl'
  };

  const getGenderIcon = (gender) => {
    switch (gender) {
      case 'male':
        return '👨';
      case 'female':
        return '👩';
      case 'other':
        return '👤';
      default:
        return '👤';
    }
  };

  const getGenderColors = (gender) => {
    switch (gender) {
      case 'male':
        return { bgColor: '#DBEAFE', color: '#3B82F6' };
      case 'female':
        return { bgColor: '#FCE7F3', color: '#EC4899' };
      case 'other':
        return { bgColor: '#EDE9FE', color: '#8B5CF6' };
      default:
        return { bgColor: '#F3F4F6', color: '#6B7280' };
    }
  };

  const colors = getGenderColors(member?.gender);
  const icon = getGenderIcon(member?.gender);

  const baseClasses = `rounded-full flex items-center justify-center shadow-md border-2 transition-all duration-200 ${sizeClasses[size]} ${className}`;

  if (member?.profile_picture) {
    return (
      <div className="relative group">
        <img
          src={`${process.env.REACT_APP_API_URL?.replace('/api', '')}${member.profile_picture}`}
          alt={`${member.name}'s profile picture`}
          className={`${baseClasses} object-cover cursor-pointer hover:scale-105`}
          style={{ borderColor: colors.color }}
          onClick={onClick}
        />
        {showUploadButton && (
          <button
            onClick={onUploadClick}
            className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="relative group">
      <div
        className={`${baseClasses} cursor-pointer hover:scale-105`}
        style={{ 
          backgroundColor: colors.bgColor,
          borderColor: colors.color,
          color: colors.color
        }}
        onClick={onClick}
      >
        {icon}
      </div>
      {showUploadButton && (
        <button
          onClick={onUploadClick}
          className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        >
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default ProfilePicture;
