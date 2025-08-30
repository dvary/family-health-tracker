// Shared date utility functions

// Format date for display (dd-mm-yyyy)
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

// Format date for HTML date input (yyyy-mm-dd)
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Parse dd-mm-yyyy format to Date object
export const parseDateFromDisplay = (dateString) => {
  if (!dateString) return '';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    const day = parts[0];
    const month = parts[1];
    const year = parts[2];
    return `${year}-${month}-${day}`;
  }
  return dateString;
};

// Calculate age from date of birth with months for < 1 year
export const calculateAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                     (today.getMonth() - birthDate.getMonth());
  
  if (ageInMonths < 12) {
    return { age: ageInMonths, unit: 'month', display: `${ageInMonths} Month${ageInMonths !== 1 ? 's' : ''} old` };
  } else {
    const years = Math.floor(ageInMonths / 12);
    const remainingMonths = ageInMonths % 12;
    if (remainingMonths === 0) {
      return { age: years, unit: 'year', display: `${years} Year${years !== 1 ? 's' : ''} old` };
    } else {
      return { age: years, unit: 'year', display: `${years} Year${years !== 1 ? 's' : ''} ${remainingMonths} Month${remainingMonths !== 1 ? 's' : ''} old` };
    }
  }
};

// Get current date components
export const getCurrentDateComponents = () => {
  const now = new Date();
  return {
    day: now.getDate().toString().padStart(2, '0'),
    month: (now.getMonth() + 1).toString().padStart(2, '0'),
    year: now.getFullYear().toString()
  };
};

// Generate date dropdown options (1-31)
export const generateDateOptions = () => {
  const options = [];
  for (let i = 1; i <= 31; i++) {
    options.push(
      <option key={i} value={i.toString().padStart(2, '0')}>
        {i}
      </option>
    );
  }
  return options;
};

// Generate month dropdown options
export const generateMonthOptions = () => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months.map((month, index) => (
    <option key={index + 1} value={(index + 1).toString().padStart(2, '0')}>
      {month}
    </option>
  ));
};

// Generate year dropdown options (1900 to current year)
export const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const options = [];
  for (let year = currentYear; year >= 1900; year--) {
    options.push(
      <option key={year} value={year}>
        {year}
      </option>
    );
  }
  return options;
};

// Parse date components from date string
export const parseDateComponents = (dateString) => {
  if (!dateString) return { day: '', month: '', year: '' };
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return { day: '', month: '', year: '' };
  
  return {
    day: date.getDate().toString().padStart(2, '0'),
    month: (date.getMonth() + 1).toString().padStart(2, '0'),
    year: date.getFullYear().toString()
  };
};

// Combine date components into date string
export const combineDateComponents = (day, month, year) => {
  if (!day || !month || !year) return '';
  return `${year}-${month}-${day}`;
};
