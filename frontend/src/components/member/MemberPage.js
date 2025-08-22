import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import ProfilePicture from '../common/ProfilePicture';
import ProfilePictureUpload from '../common/ProfilePictureUpload';

// Icon components
const EyeIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
  </svg>
);

const DownloadIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
);

const DeleteIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

// New icons
const UploadIcon = () => (
	<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5-5m0 0l5 5m-5-5v12" />
	</svg>
);

const PlusIcon = () => (
	<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
	</svg>
);

// Vital types configuration with units and reference ranges
const VITAL_TYPES = {
  height: { 
    label: 'Height', 
    unit: 'cm', 
    placeholder: '170',
    ranges: {
      normal: { min: 140, max: 200 },
      display: '140-200'
    }
  },
  weight: { 
    label: 'Weight', 
    unit: 'kg', 
    placeholder: '70',
    ranges: {
      normal: { min: 40, max: 120 },
      display: '40-120'
    }
  },
  bmi: { 
    label: 'BMI', 
    unit: 'kg/m²', 
    placeholder: '24.2', 
    calculated: true,
    ranges: {
      underweight: { min: 0, max: 18.4 },
      normal: { min: 18.5, max: 24.9 },
      overweight: { min: 25, max: 29.9 },
      obese: { min: 30, max: 100 },
      display: '18.5-24.9'
    }
  },
  cholesterol: { 
    label: 'Cholesterol', 
    unit: 'mg/dL', 
    placeholder: '200',
    ranges: {
      optimal: { min: 0, max: 199 },
      borderline: { min: 200, max: 239 },
      high: { min: 240, max: 500 },
      display: '<200'
    }
  },
  hemoglobin: { 
    label: 'Hemoglobin', 
    unit: 'g/dL', 
    placeholder: '14',
    ranges: {
      male: { min: 13.8, max: 17.2 },
      female: { min: 12.1, max: 15.1 },
      display: 'M: 13.8-17.2, F: 12.1-15.1'
    }
  },
  sgpt: { 
    label: 'S.G.P.T.', 
    unit: 'U/L', 
    placeholder: '40',
    ranges: {
      normal: { min: 7, max: 56 },
      display: '7-56'
    }
  },
  sgot: { 
    label: 'S.G.O.T.', 
    unit: 'U/L', 
    placeholder: '40',
    ranges: {
      normal: { min: 10, max: 40 },
      display: '10-40'
    }
  },
  vitamin_d: { 
    label: 'Vitamin D', 
    unit: 'ng/mL', 
    placeholder: '30',
    ranges: {
      deficient: { min: 0, max: 19 },
      insufficient: { min: 20, max: 29 },
      sufficient: { min: 30, max: 100 },
      display: '30-100'
    }
  },
  thyroid_tsh: { 
    label: 'Thyroid TSH', 
    unit: 'μIU/mL', 
    placeholder: '2.5',
    ranges: {
      normal: { min: 0.27, max: 4.2 },
      display: '0.27-4.2'
    }
  },
  thyroid_t3: { 
    label: 'Thyroid T3', 
    unit: 'ng/dL', 
    placeholder: '120',
    ranges: {
      normal: { min: 80, max: 200 },
      display: '80-200'
    }
  },
  thyroid_t4: { 
    label: 'Thyroid T4', 
    unit: 'μg/dL', 
    placeholder: '1.2',
    ranges: {
      normal: { min: 5.1, max: 14.1 },
      display: '5.1-14.1'
    }
  },
  vitamin_b12: { 
    label: 'Vitamin B12', 
    unit: 'pg/mL', 
    placeholder: '500',
    ranges: {
      deficient: { min: 0, max: 199 },
      low: { min: 200, max: 299 },
      normal: { min: 300, max: 900 },
      display: '300-900'
    }
  },
  calcium: { 
    label: 'Calcium', 
    unit: 'mg/dL', 
    placeholder: '9.5',
    ranges: {
      normal: { min: 8.5, max: 10.2 },
      display: '8.5-10.2'
    }
  },
  hba1c: { 
    label: 'HbA1c', 
    unit: '%', 
    placeholder: '5.7',
    ranges: {
      normal: { min: 0, max: 5.6 },
      prediabetic: { min: 5.7, max: 6.4 },
      diabetic: { min: 6.5, max: 15 },
      display: '<5.7'
    }
  },
  urea: { 
    label: 'Urea', 
    unit: 'mg/dL', 
    placeholder: '20',
    ranges: {
      normal: { min: 6, max: 24 },
      display: '6-24'
    }
  },
  fasting_blood_glucose: { 
    label: 'Fasting Blood Glucose', 
    unit: 'mg/dL', 
    placeholder: '100',
    ranges: {
      normal: { min: 70, max: 99 },
      prediabetic: { min: 100, max: 125 },
      diabetic: { min: 126, max: 300 },
      display: '70-99'
    }
  },
  creatinine: { 
    label: 'Creatinine', 
    unit: 'mg/dL', 
    placeholder: '1.0',
    ranges: {
      normal: { min: 0.6, max: 1.4 },
      display: '0.6-1.4'
    }
  }
};

// Report types configuration
const REPORT_TYPES = {
  lab_report: { 
    label: 'Lab Report', 
    subTypes: [
      { value: 'blood_report', label: 'Blood Report' },
      { value: 'xray', label: 'X-Ray' },
      { value: 'stool_report', label: 'Stool Report' },
      { value: 'urine_report', label: 'Urine Report' },
      { value: 'ecg', label: 'ECG' },
      { value: 'ultrasound', label: 'Ultrasound' },
      { value: 'mri', label: 'MRI' },
      { value: 'ct_scan', label: 'CT Scan' },
      { value: 'general_lab', label: 'General Lab Report' }
    ]
  },
  prescription_consultation: { 
    label: 'Prescription/Consultation',
    subTypes: [
      { value: 'prescription', label: 'Prescription' },
      { value: 'consultation', label: 'Consultation' },
      { value: 'follow_up', label: 'Follow-up' },
      { value: 'emergency_visit', label: 'Emergency Visit' }
    ]
  },
  vaccination: { 
    label: 'Vaccination',
    subTypes: [
      { value: 'covid_19', label: 'COVID-19' },
      { value: 'flu', label: 'Flu Shot' },
      { value: 'hepatitis', label: 'Hepatitis' },
      { value: 'mmr', label: 'MMR' },
      { value: 'dtap', label: 'DTaP' },
      { value: 'other_vaccine', label: 'Other Vaccine' }
    ]
  },
  hospital_records: { 
    label: 'Hospital Records',
    subTypes: [
      { value: 'admission', label: 'Admission Record' },
      { value: 'discharge', label: 'Discharge Summary' },
      { value: 'operation', label: 'Operation Report' },
      { value: 'emergency', label: 'Emergency Record' },
      { value: 'icu', label: 'ICU Record' },
      { value: 'general_hospital', label: 'General Hospital Record' }
    ]
  }
};

const MemberPage = () => {
  const { memberName } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAdmin } = useAuth();
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddVitalModal, setShowAddVitalModal] = useState(false);
  const [showEditVitalModal, setShowEditVitalModal] = useState(false);
  const [editingVital, setEditingVital] = useState(null);
  const [expandedVitalTypes, setExpandedVitalTypes] = useState(new Set());
  const [expandedReportTypes, setExpandedReportTypes] = useState(new Set());
  const [showUploadReportModal, setShowUploadReportModal] = useState(false);
  const [showEditReportModal, setShowEditReportModal] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [editingReport, setEditingReport] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    password: ''
  });
  
  // Date component states for edit form
  const [editDateComponents, setEditDateComponents] = useState({ day: '', month: '', year: '' });
  const [vitalFormData, setVitalFormData] = useState({
    vitalType: '',
    value: '',
    unit: '',
    notes: '',
    recordedAt: new Date().toISOString().split('T')[0]
  });

  const [editVitalFormData, setEditVitalFormData] = useState({
    vitalType: '',
    value: '',
    unit: '',
    notes: '',
    recordedAt: new Date().toISOString().split('T')[0]
  });
  const [reportFormData, setReportFormData] = useState({
    reportType: '',
    reportSubType: '',
    description: '',
    reportDate: new Date().toISOString().split('T')[0],
    file: null
  });
  const [editReportFormData, setEditReportFormData] = useState({
    reportType: '',
    reportSubType: '',
    title: '',
    description: '',
    reportDate: '',
    file: null
  });

  // Document upload states
  const [showUploadDocumentModal, setShowUploadDocumentModal] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showEditDocumentModal, setShowEditDocumentModal] = useState(false);
  const [editingDocument, setEditingDocument] = useState(null);
  const [editDocumentFormData, setEditDocumentFormData] = useState({
    title: '',
    description: '',
    uploadDate: new Date().toISOString().split('T')[0],
    file: null
  });
  const [documentFormData, setDocumentFormData] = useState({
    title: '',
    description: '',
    uploadDate: new Date().toISOString().split('T')[0],
    file: null
  });
  const [showProfileUploadModal, setShowProfileUploadModal] = useState(false);

  // Date formatting utility
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  };

  // Format date for HTML date input (yyyy-mm-dd)
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Parse dd-mm-yyyy format to Date object
  const parseDateFromDisplay = (dateString) => {
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

  // Generate date dropdown options (1-31)
  const generateDateOptions = () => {
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
  const generateMonthOptions = () => {
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
  const generateYearOptions = () => {
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
  const parseDateComponents = (dateString) => {
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
  const combineDateComponents = (day, month, year) => {
    if (!day || !month || !year) return '';
    return `${year}-${month}-${day}`;
  };

  // Get vital status color and label based on value and ranges
  const getVitalStatus = (vitalType, value, memberGender = null) => {
    const vitalConfig = VITAL_TYPES[vitalType];
    if (!vitalConfig || !vitalConfig.ranges || !value) {
      return { color: 'text-gray-600', bgColor: 'bg-gray-100', status: 'Unknown', level: 'unknown', priority: 0 };
    }

    const numValue = parseFloat(value);
    const ranges = vitalConfig.ranges;

    // Special handling for different vital types
    switch (vitalType) {
      case 'bmi':
        if (numValue <= ranges.underweight.max) return { color: 'text-rose-600', bgColor: 'bg-rose-100', status: 'Underweight', level: 'low', priority: 2 };
        if (numValue >= ranges.normal.min && numValue <= ranges.normal.max) return { color: 'text-green-600', bgColor: 'bg-green-100', status: '', level: 'normal', priority: 0 };
        if (numValue >= ranges.overweight.min && numValue <= ranges.overweight.max) return { color: 'text-amber-600', bgColor: 'bg-amber-100', status: 'Overweight', level: 'warning', priority: 1 };
        if (numValue >= ranges.obese.min) return { color: 'text-rose-600', bgColor: 'bg-rose-100', status: 'Obese', level: 'high', priority: 2 };
        break;

      case 'cholesterol':
        if (numValue <= ranges.optimal.max) return { color: 'text-green-600', bgColor: 'bg-green-100', status: 'Optimal', level: 'normal', priority: 0 };
        if (numValue >= ranges.borderline.min && numValue <= ranges.borderline.max) return { color: 'text-amber-600', bgColor: 'bg-amber-100', status: 'Borderline', level: 'warning', priority: 1 };
        if (numValue >= ranges.high.min) return { color: 'text-rose-600', bgColor: 'bg-rose-100', status: 'High', level: 'high', priority: 2 };
        break;

      case 'hemoglobin':
        const genderRange = memberGender === 'male' ? ranges.male : ranges.female;
        if (numValue < genderRange.min) return { color: 'text-rose-600', bgColor: 'bg-rose-100', status: 'Low', level: 'low', priority: 2 };
        if (numValue >= genderRange.min && numValue <= genderRange.max) return { color: 'text-green-600', bgColor: 'bg-green-100', status: '', level: 'normal', priority: 0 };
        if (numValue > genderRange.max) return { color: 'text-amber-600', bgColor: 'bg-amber-100', status: 'High', level: 'warning', priority: 1 };
        break;

      case 'vitamin_d':
        if (numValue <= ranges.deficient.max) return { color: 'text-rose-600', bgColor: 'bg-rose-100', status: 'Deficient', level: 'low', priority: 2 };
        if (numValue >= ranges.insufficient.min && numValue <= ranges.insufficient.max) return { color: 'text-amber-600', bgColor: 'bg-amber-100', status: 'Insufficient', level: 'warning', priority: 1 };
        if (numValue >= ranges.sufficient.min) return { color: 'text-green-600', bgColor: 'bg-green-100', status: 'Sufficient', level: 'normal', priority: 0 };
        break;

      case 'vitamin_b12':
        if (numValue <= ranges.deficient.max) return { color: 'text-rose-600', bgColor: 'bg-rose-100', status: 'Deficient', level: 'low', priority: 2 };
        if (numValue >= ranges.low.min && numValue <= ranges.low.max) return { color: 'text-amber-600', bgColor: 'bg-amber-100', status: 'Low', level: 'warning', priority: 1 };
        if (numValue >= ranges.normal.min && numValue <= ranges.normal.max) return { color: 'text-green-600', bgColor: 'bg-green-100', status: '', level: 'normal', priority: 0 };
        if (numValue > ranges.normal.max) return { color: 'text-amber-600', bgColor: 'bg-amber-100', status: 'High', level: 'warning', priority: 1 };
        break;

      case 'hba1c':
        if (numValue <= ranges.normal.max) return { color: 'text-green-600', bgColor: 'bg-green-100', status: '', level: 'normal', priority: 0 };
        if (numValue >= ranges.prediabetic.min && numValue <= ranges.prediabetic.max) return { color: 'text-amber-600', bgColor: 'bg-amber-100', status: 'Prediabetic', level: 'warning', priority: 1 };
        if (numValue >= ranges.diabetic.min) return { color: 'text-rose-600', bgColor: 'bg-rose-100', status: 'Diabetic', level: 'high', priority: 2 };
        break;

      default:
        // Generic handling for vitals with simple normal ranges
        if (ranges.normal) {
          if (numValue < ranges.normal.min) return { color: 'text-rose-600', bgColor: 'bg-rose-100', status: 'Low', level: 'low', priority: 2 };
          if (numValue >= ranges.normal.min && numValue <= ranges.normal.max) return { color: 'text-green-600', bgColor: 'bg-green-100', status: '', level: 'normal', priority: 0 };
          if (numValue > ranges.normal.max) return { color: 'text-rose-600', bgColor: 'bg-rose-100', status: 'High', level: 'high', priority: 2 };
        }
        break;
    }

    return { color: 'text-gray-600', bgColor: 'bg-gray-100', status: 'Unknown', level: 'unknown', priority: 0 };
  };

  // Calculate BMI based on height and weight
  const calculateBMI = (height, weight) => {
    if (!height || !weight) return null;
    // Height in cm, weight in kg
    const heightInMeters = height / 100;
    const bmi = weight / (heightInMeters * heightInMeters);
    return Math.round(bmi * 10) / 10; // Round to 1 decimal place
  };

  // Get BMI records based on latest height and all weight records
  const getBMIRecords = () => {
    const heightRecords = healthVitals.filter(vital => vital.vital_type === 'height');
    const weightRecords = healthVitals.filter(vital => vital.vital_type === 'weight');
    
    if (heightRecords.length === 0 || weightRecords.length === 0) return [];
    
    // Get the latest height
    const latestHeight = heightRecords.sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at))[0];
    
    // Calculate BMI for each weight record
    return weightRecords
      .sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at))
      .map(weightRecord => {
        const bmiValue = calculateBMI(latestHeight.value, weightRecord.value);
        return {
          id: `bmi-${weightRecord.id}`,
          vital_type: 'bmi',
          value: bmiValue,
          unit: 'kg/m²',
          notes: `Calculated from height: ${latestHeight.value}cm, weight: ${weightRecord.value}kg`,
          recorded_at: weightRecord.recorded_at,
          created_at: weightRecord.created_at,
          updated_at: weightRecord.updated_at,
          isCalculated: true
        };
      });
  };

  // Sort vitals by priority (high priority first, then by name)
  const sortVitalsByPriority = (vitals) => {
    return vitals.sort((a, b) => {
      const aStatus = getVitalStatus(a.vital_type, a.value, member?.gender);
      const bStatus = getVitalStatus(b.vital_type, b.value, member?.gender);
      
      // BMI always comes first
      if (a.vital_type === 'bmi') return -1;
      if (b.vital_type === 'bmi') return 1;
      
      // Then sort by priority (high to low)
      if (aStatus.priority !== bStatus.priority) {
        return bStatus.priority - aStatus.priority;
      }
      
      // If same priority, sort alphabetically
      return a.vital_type.localeCompare(b.vital_type);
    });
  };

  // Group vitals by type for stacked view
  const groupVitalsByType = (vitals) => {
    const grouped = {};
    vitals.forEach(vital => {
      if (!grouped[vital.vital_type]) {
        grouped[vital.vital_type] = [];
      }
      grouped[vital.vital_type].push(vital);
    });
    
    // Sort each group by date (newest first)
    Object.keys(grouped).forEach(type => {
      grouped[type].sort((a, b) => new Date(b.recorded_at) - new Date(a.recorded_at));
    });
    
    return grouped;
  };

  // Get report status based on report type and sub-type
  const getReportStatus = (report) => {
    // For medical reports, we'll use a simple status system based on report date
    const reportDate = new Date(report.report_date);
    const currentDate = new Date();
    const daysDiff = Math.floor((currentDate - reportDate) / (1000 * 60 * 60 * 24));
    
    // Recent reports (within 30 days) are considered "Normal" - no status tag
    if (daysDiff <= 30) {
      return { color: 'text-gray-600', bgColor: 'bg-gray-100', status: '', level: 'normal', priority: 0 };
    }
    // Reports between 30-90 days are "Borderline"
    else if (daysDiff <= 90) {
      return { color: 'text-amber-600', bgColor: 'bg-amber-100', status: 'Borderline', level: 'warning', priority: 1 };
    }
    // Older reports are "Outdated"
    else {
      return { color: 'text-rose-600', bgColor: 'bg-rose-100', status: 'Outdated', level: 'high', priority: 2 };
    }
  };

  // Get document status based on document type and upload date
  const getDocumentStatus = (document) => {
    const uploadDate = new Date(document.upload_date);
    const currentDate = new Date();
    const daysDiff = Math.floor((currentDate - uploadDate) / (1000 * 60 * 60 * 24));
    
    // Recent documents (within 60 days) are considered "Normal"
    if (daysDiff <= 60) {
      return { color: 'text-orange-600', bgColor: 'bg-orange-100', status: '', level: 'normal', priority: 0 };
    }
    // Documents between 60-180 days are "Borderline"
    else if (daysDiff <= 180) {
      return { color: 'text-amber-600', bgColor: 'bg-amber-100', status: 'Borderline', level: 'warning', priority: 1 };
    }
    // Older documents are "Outdated"
    else {
      return { color: 'text-rose-600', bgColor: 'bg-rose-100', status: 'Outdated', level: 'high', priority: 2 };
    }
  };

  // Get gradient class based on status level
  const getGradientClass = (status) => {
    switch (status.level) {
      case 'high':
      case 'low':
        return 'bg-gradient-to-br from-rose-50 via-rose-25 to-white';
      case 'warning':
        return 'bg-gradient-to-br from-amber-50 via-amber-25 to-white';
      case 'normal':
        return 'bg-gradient-to-br from-green-50 via-green-25 to-white';
      default:
        return 'bg-gradient-to-br from-gray-50 via-gray-25 to-white';
    }
  };

  // Get sub-card gradient class based on status level
  const getSubCardGradientClass = (status) => {
    // Return neutral styling for sub-cards (no gradients)
    return 'bg-white border border-gray-200';
  };

  // Get main card status based on latest record
  const getMainCardStatus = (records, statusFunction) => {
    if (!records || records.length === 0) {
      return { color: 'text-gray-600', bgColor: 'bg-gray-100', status: 'Unknown', level: 'unknown', priority: 0 };
    }
    
    // Get the latest record (first in the array since they're sorted by date)
    const latestRecord = records[0];
    return statusFunction(latestRecord);
  };

  // Toggle expanded state for vital types
  const toggleVitalTypeExpansion = (vitalType) => {
    setExpandedVitalTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(vitalType)) {
        newSet.delete(vitalType);
      } else {
        newSet.add(vitalType);
      }
      return newSet;
    });
  };

  // Group reports by type for stacked view
  const groupReportsByType = (reports) => {
    const grouped = {};
    reports.forEach(report => {
      const key = `${report.report_type}_${report.report_sub_type || 'general'}`;
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(report);
    });
    
    // Sort each group by date (newest first)
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => new Date(b.report_date) - new Date(a.report_date));
    });
    
    return grouped;
  };

  // Toggle expanded state for report types
  const toggleReportTypeExpansion = (reportKey) => {
    setExpandedReportTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reportKey)) {
        newSet.delete(reportKey);
      } else {
        newSet.add(reportKey);
      }
      return newSet;
    });
  };

	// Open Add Vital modal pre-filled for a type
	const openAddVitalForType = (vitalType) => {
		const vitalConfig = VITAL_TYPES[vitalType];
		setVitalFormData({
			vitalType,
			value: '',
			unit: vitalConfig ? vitalConfig.unit : '',
			notes: '',
			recordedAt: new Date().toISOString().split('T')[0]
		});
		setShowAddVitalModal(true);
	};

	// Open Upload Report modal pre-filled for a report type
	const openUploadForReportType = (reportType, reportSubType = '') => {
		setReportFormData({
			reportType,
			reportSubType: reportSubType || '',
			description: '',
			reportDate: new Date().toISOString().split('T')[0],
			file: null
		});
		setShowUploadReportModal(true);
	};

  // Age calculation with months for < 1 year
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                       (today.getMonth() - birthDate.getMonth());
    
    if (ageInMonths < 12) {
      return `${ageInMonths} Month${ageInMonths !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      const remainingMonths = ageInMonths % 12;
      if (remainingMonths === 0) {
        return `${years} Year${years !== 1 ? 's' : ''}`;
      } else {
        return `${years} Year${years !== 1 ? 's' : ''} ${remainingMonths} Month${remainingMonths !== 1 ? 's' : ''}`;
      }
    }
  };

  const [allMembers, setAllMembers] = useState([]);
  const [healthVitals, setHealthVitals] = useState([]);
  const [medicalReports, setMedicalReports] = useState([]);
  // Initialize activeTab based on URL parameter
  const tabParam = searchParams.get('tab');
  const initialTab = tabParam === 'medical-reports' ? 'reports' : 
                    tabParam === 'documents' ? 'documents' : 
                    tabParam === 'health-vitals' ? 'vitals' : 'vitals';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [activeVitalSubTab, setActiveVitalSubTab] = useState('all');
  const [activeReportSubTab, setActiveReportSubTab] = useState('all');
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchMemberData();
  }, [memberName]);

  const fetchMemberData = async () => {
    try {
      setLoading(true);
      
      // Fetch all members to find the one by name
      const membersResponse = await axios.get('/family/members');
      const members = membersResponse.data.members;
      setAllMembers(members);
      
      // Find member by name (case-insensitive)
      const foundMember = members.find(m => 
        m.name.toLowerCase().replace(/\s+/g, '-') === memberName
      );
      
      if (!foundMember) {
        toast.error('Member not found');
        navigate('/dashboard');
        return;
      }
      
      setMember(foundMember);
      setFormData({
        name: foundMember.name,
        dateOfBirth: foundMember.date_of_birth ? foundMember.date_of_birth.split('T')[0] : '',
        gender: foundMember.gender || '',
        email: foundMember.user_email || '',
        password: '' // Don't populate password for security
      });
      
      // Populate date components for editing
      if (foundMember.date_of_birth) {
        const components = parseDateComponents(foundMember.date_of_birth);
        setEditDateComponents(components);
      } else {
        setEditDateComponents({ day: '', month: '', year: '' });
      }
      
      // Fetch health vitals
      try {
        const vitalsResponse = await axios.get(`/health/vitals/${foundMember.id}`);
        setHealthVitals(vitalsResponse.data.vitals || []);
      } catch (error) {
        console.log('No health vitals found');
        setHealthVitals([]);
      }
      
      // Fetch medical reports
      try {
        const reportsResponse = await axios.get(`/health/reports/${foundMember.id}`);
        setMedicalReports(reportsResponse.data.reports || []);
      } catch (error) {
        console.log('No medical reports found');
        setMedicalReports([]);
      }

      // Fetch documents
      try {
        const documentsResponse = await axios.get(`/health/documents/${foundMember.id}`);
        setDocuments(documentsResponse.data || []);
      } catch (error) {
        console.log('No documents found');
        setDocuments([]);
      }
      
    } catch (error) {
      toast.error('Failed to fetch member data');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };



  const getGenderInfo = useCallback((gender) => {
    switch (gender) {
      case 'male':
        return { icon: '👨', color: '#3B82F6', bgColor: '#DBEAFE' };
      case 'female':
        return { icon: '👩', color: '#EC4899', bgColor: '#FCE7F3' };
      case 'other':
        return { icon: '👤', color: '#8B5CF6', bgColor: '#EDE9FE' };
      default:
        return { icon: '👤', color: '#6B7280', bgColor: '#F3F4F6' };
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Only send non-empty fields
      const updateData = {};
      Object.keys(formData).forEach(key => {
        if (formData[key] !== '' && formData[key] !== null && formData[key] !== undefined) {
          updateData[key] = formData[key];
        }
      });
      
      await axios.put(`/family/members/${member.id}`, updateData);
      toast.success('Member updated successfully');
      setShowEditForm(false);
      fetchMemberData();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update member';
      toast.error(errorMessage);
    }
  };

  const handleProfilePictureUpload = () => {
    setShowProfileUploadModal(true);
  };

  const handleProfileUploadSuccess = (updatedMember) => {
    setMember(prevMember => ({
      ...prevMember,
      profile_picture: updatedMember.profile_picture
    }));
  };

  const handleCancel = () => {
    setShowEditForm(false);
    setFormData({
      name: member.name,
      dateOfBirth: member.date_of_birth ? member.date_of_birth.split('T')[0] : '',
      gender: member.gender || '',
      email: member.user_email || '',
      password: ''
    });
    setEditDateComponents({ day: '', month: '', year: '' });
  };



  const handleDeleteMember = async () => {
    if (window.confirm('Are you sure you want to delete this family member?')) {
      try {
        await axios.delete(`/family/members/${member.id}`);
        toast.success('Family member deleted successfully');
        navigate('/dashboard');
      } catch (error) {
        toast.error('Failed to delete family member');
      }
    }
  };

  // Health Vitals Functions
  const handleVitalTypeChange = (vitalType) => {
    const vitalConfig = VITAL_TYPES[vitalType];
    setVitalFormData(prev => ({
      ...prev,
      vitalType,
      unit: vitalConfig ? vitalConfig.unit : '',
      value: ''
    }));
  };

  const handleAddVital = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/health/vitals', {
        memberId: member.id,
        vitalType: vitalFormData.vitalType,
        value: parseFloat(vitalFormData.value),
        unit: vitalFormData.unit,
        notes: vitalFormData.notes,
        recordedAt: vitalFormData.recordedAt
      });
      toast.success('Health vital added successfully');
      setShowAddVitalModal(false);
      setVitalFormData({
        vitalType: '',
        value: '',
        unit: '',
        notes: '',
        recordedAt: new Date().toISOString().split('T')[0]
      });
      fetchMemberData();
    } catch (error) {
      toast.error('Failed to add health vital');
    }
  };

  const handleEditVital = (vital) => {
    setEditingVital(vital);
    setEditVitalFormData({
      vitalType: vital.vital_type,
      value: vital.value.toString(),
      unit: vital.unit,
      notes: vital.notes || '',
      recordedAt: vital.recorded_at ? vital.recorded_at.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setShowEditVitalModal(true);
  };

  const handleUpdateVital = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/health/vitals/${editingVital.id}`, {
        vitalType: editVitalFormData.vitalType,
        value: parseFloat(editVitalFormData.value),
        unit: editVitalFormData.unit,
        notes: editVitalFormData.notes,
        recordedAt: editVitalFormData.recordedAt
      });
      toast.success('Health vital updated successfully');
      setShowEditVitalModal(false);
      setEditingVital(null);
      setEditVitalFormData({
        vitalType: '',
        value: '',
        unit: '',
        notes: '',
        recordedAt: new Date().toISOString().split('T')[0]
      });
      fetchMemberData();
    } catch (error) {
      toast.error('Failed to update health vital');
    }
  };

  const handleDeleteVital = async (vital) => {
    if (window.confirm('Are you sure you want to delete this health vital?')) {
      try {
        await axios.delete(`/health/vitals/${vital.id}`);
        toast.success('Health vital deleted successfully');
        fetchMemberData();
      } catch (error) {
        toast.error('Failed to delete health vital');
      }
    }
  };

  const handleUploadReport = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('memberId', member.id);
      formData.append('reportType', reportFormData.reportType);

      formData.append('description', reportFormData.description);
      formData.append('reportDate', reportFormData.reportDate);
      formData.append('file', reportFormData.file);

      await axios.post('/health/reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Medical report uploaded successfully');
      setShowUploadReportModal(false);
      setReportFormData({
        reportType: '',
        description: '',
        reportDate: new Date().toISOString().split('T')[0],
        file: null
      });
      fetchMemberData();
    } catch (error) {
      toast.error('Failed to upload medical report');
    }
  };

  const handleFileChange = (e) => {
    setReportFormData({
      ...reportFormData,
      file: e.target.files[0]
    });
  };

  const handleEditFileChange = (e) => {
    setEditReportFormData({
      ...editReportFormData,
      file: e.target.files[0]
    });
  };

  // Document handling functions
  const handleDocumentFileChange = (e) => {
    setDocumentFormData({
      ...documentFormData,
      file: e.target.files[0]
    });
  };

  const handleUploadDocument = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', documentFormData.title);
      formData.append('description', documentFormData.description);
      formData.append('uploadDate', documentFormData.uploadDate);
      formData.append('file', documentFormData.file);

      await axios.post(`/health/documents/${member.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Document uploaded successfully');
      setShowUploadDocumentModal(false);
      setDocumentFormData({
        title: '',
        description: '',
        uploadDate: new Date().toISOString().split('T')[0],
        file: null
      });
      fetchDocuments(); // Fetch updated documents
    } catch (error) {
      console.error('Error uploading document:', error);
      toast.error('Failed to upload document');
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await axios.get(`/health/documents/${member.id}`);
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleViewDocument = async (document) => {
    try {
      const response = await axios.get(`/health/documents/file/${document.id}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      
      // Open PDF in new tab for better mobile experience
      const newWindow = window.open(url, '_blank');
      if (!newWindow) {
        // Fallback if popup is blocked
        setSelectedDocument({ ...document, pdfUrl: url });
        setShowDocumentViewer(true);
      }
    } catch (error) {
      console.error('Error viewing document:', error);
      toast.error('Failed to view document');
    }
  };

  const handleDownloadDocument = async (document) => {
    try {
      const response = await axios.get(`/health/documents/file/${document.id}`, {
        responseType: 'blob'
      });
      
      const blob = new Blob([response.data]);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = document.file_name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Document downloaded successfully');
    } catch (error) {
      console.error('Error downloading document:', error);
      toast.error('Failed to download document');
    }
  };

  const handleEditDocument = (document) => {
    setEditingDocument(document);
    setEditDocumentFormData({
      title: document.title,
      description: document.description || '',
      uploadDate: document.upload_date ? document.upload_date.split('T')[0] : new Date().toISOString().split('T')[0],
      file: null
    });
    setShowEditDocumentModal(true);
  };

  const handleEditDocumentFileChange = (e) => {
    setEditDocumentFormData({
      ...editDocumentFormData,
      file: e.target.files[0]
    });
  };

  const handleUpdateDocument = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', editDocumentFormData.title);
      formData.append('description', editDocumentFormData.description);
      formData.append('uploadDate', editDocumentFormData.uploadDate);
      if (editDocumentFormData.file) {
        formData.append('file', editDocumentFormData.file);
      }

      await axios.put(`/health/documents/${editingDocument.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Document updated successfully');
      setShowEditDocumentModal(false);
      setEditingDocument(null);
      setEditDocumentFormData({
        title: '',
        description: '',
        uploadDate: new Date().toISOString().split('T')[0],
        file: null
      });
      fetchDocuments(); // Fetch updated documents
    } catch (error) {
      console.error('Error updating document:', error);
      toast.error('Failed to update document');
    }
  };

  const handleDeleteDocument = async (document) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await axios.delete(`/health/documents/${document.id}`);
        toast.success('Document deleted successfully');
        fetchDocuments(); // Fetch updated documents
      } catch (error) {
        console.error('Error deleting document:', error);
        toast.error('Failed to delete document');
      }
    }
  };

  const handleEditReport = (report) => {
    setEditingReport(report);
    setEditReportFormData({
      reportType: report.report_type,
      reportSubType: report.report_sub_type || '',
      title: report.title,
      description: report.description || '',
      reportDate: report.report_date ? report.report_date.split('T')[0] : new Date().toISOString().split('T')[0],
      file: null
    });
    setShowEditReportModal(true);
  };

  const handleUpdateReport = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('title', editReportFormData.title);
      formData.append('description', editReportFormData.description);
      formData.append('reportDate', editReportFormData.reportDate);
      if (editReportFormData.reportType) {
        formData.append('reportType', editReportFormData.reportType);
      }
      if (editReportFormData.reportSubType) {
        formData.append('reportSubType', editReportFormData.reportSubType);
      }
      if (editReportFormData.file) {
        formData.append('file', editReportFormData.file);
      }

      await axios.put(`/health/reports/${editingReport.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Medical report updated successfully');
      setShowEditReportModal(false);
      setEditingReport(null);
      setEditReportFormData({
        reportType: '',
        reportSubType: '',
        title: '',
        description: '',
        reportDate: new Date().toISOString().split('T')[0],
        file: null
      });
      fetchMemberData();
    } catch (error) {
      toast.error('Failed to update medical report');
    }
  };

  const handleViewReport = async (report) => {
    try {
      // Fetch PDF as blob to create object URL for new tab
      const response = await axios.get(`/health/reports/${report.id}/download`, {
        responseType: 'blob'
      });
      
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Open PDF in new tab for better mobile experience
      const newWindow = window.open(pdfUrl, '_blank');
      if (!newWindow) {
        // Fallback if popup is blocked
        setSelectedReport(report);
        setShowPdfViewer(true);
        setSelectedReport(prev => ({ ...prev, pdfUrl }));
      }
    } catch (error) {
      console.error('Error loading PDF:', error);
      toast.error('Failed to load PDF');
    }
  };

  const handleDownloadReport = async (report) => {
    try {
      const response = await axios.get(`/health/reports/${report.id}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', report.file_name);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download report');
    }
  };

  const handleDeleteReport = async (report) => {
    if (window.confirm('Are you sure you want to delete this medical report?')) {
      try {
        await axios.delete(`/health/reports/${report.id}`);
        toast.success('Medical report deleted successfully');
        fetchMemberData();
      } catch (error) {
        toast.error('Failed to delete medical report');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Member not found</h3>
        <button onClick={() => navigate('/dashboard')} className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const age = calculateAge(member.date_of_birth);
  const genderInfo = getGenderInfo(member.gender);

  return (
    <div className="space-y-6">
      {/* Header with Edit button prominently displayed */}
      <div className="bg-white shadow rounded-lg p-3 sm:p-4 md:p-6 mx-2 sm:mx-0">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-3 sm:space-y-0">
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-800 text-sm sm:text-base"
            >
              ← Back
            </button>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{member.name}</h1>
          </div>
          <div className="flex space-x-2 sm:space-x-3">
            {isAdmin() ? (
              <>
                <button
                  onClick={() => setShowEditForm(true)}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base"
                >
                  Edit Member
                </button>
                <button
                  onClick={handleDeleteMember}
                  className="bg-health-danger hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base"
                >
                  Delete Member
                </button>
              </>
            ) : (
              <>
                <button
                  disabled
                  className="bg-gray-400 text-white px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base cursor-not-allowed opacity-50"
                >
                  Edit Member
                </button>
                <button
                  disabled
                  className="bg-gray-400 text-white px-3 sm:px-4 py-2 rounded-lg font-medium text-sm sm:text-base cursor-not-allowed opacity-50"
                >
                  Delete Member
                </button>
              </>
            )}
          </div>
        </div>

        {/* Member basic info */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-6">
          <div className="relative flex justify-center sm:justify-start">
            <ProfilePicture
              member={member}
              size="xl"
              showUploadButton={false}
            />
          </div>
          <div className="text-center sm:text-left space-y-1 sm:space-y-2">
            <p className="text-gray-600 text-sm sm:text-base">
              {age ? `Age ${age}` : 'Age not specified'}
            </p>
            <p className="text-gray-600 text-sm sm:text-base">
              {member.date_of_birth ? `Born ${formatDate(member.date_of_birth)}` : 'Birth date not specified'}
            </p>
            <p className="text-gray-600 capitalize text-sm sm:text-base">
              {member.gender || 'Gender not specified'}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {showEditForm && (
        <div className="bg-white shadow rounded-lg p-3 sm:p-4 md:p-6 mx-2 sm:mx-0">
          <h2 className="text-lg font-semibold mb-4">Edit Family Member</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="form-group">
                <label htmlFor="name" className="form-label">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="input"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="dateOfBirth" className="form-label">
                  Date of Birth
                </label>
                <div className="flex space-x-2">
                  <select
                    value={editDateComponents.day}
                    onChange={(e) => {
                      const newComponents = { ...editDateComponents, day: e.target.value };
                      setEditDateComponents(newComponents);
                      setFormData({
                        ...formData,
                        dateOfBirth: combineDateComponents(newComponents.day, newComponents.month, newComponents.year)
                      });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Day</option>
                    {generateDateOptions()}
                  </select>
                  <select
                    value={editDateComponents.month}
                    onChange={(e) => {
                      const newComponents = { ...editDateComponents, month: e.target.value };
                      setEditDateComponents(newComponents);
                      setFormData({
                        ...formData,
                        dateOfBirth: combineDateComponents(newComponents.day, newComponents.month, newComponents.year)
                      });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Month</option>
                    {generateMonthOptions()}
                  </select>
                  <select
                    value={editDateComponents.year}
                    onChange={(e) => {
                      const newComponents = { ...editDateComponents, year: e.target.value };
                      setEditDateComponents(newComponents);
                      setFormData({
                        ...formData,
                        dateOfBirth: combineDateComponents(newComponents.day, newComponents.month, newComponents.year)
                      });
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Year</option>
                    {generateYearOptions()}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="gender" className="form-label">
                  Gender
                </label>
                <select
                  id="gender"
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="input"
                  required
                >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
              </div>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="input"
                />

              </div>
              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  New Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Leave blank to keep current password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="input"
                />
                <p className="form-help">
                  Password must be at least 6 characters long
                </p>
              </div>
            </div>

            {/* Profile Picture Upload Section */}
            <div className="border-t pt-4 mt-4">
              <h3 className="text-md font-medium text-gray-900 mb-3">Profile Picture</h3>
              <div className="flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <ProfilePicture
                    member={member}
                    size="lg"
                    showUploadButton={false}
                  />
                </div>
                <div className="flex-1">
                  <button
                    type="button"
                    onClick={handleProfilePictureUpload}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium text-sm"
                  >
                    Upload New Picture
                  </button>
                  <p className="text-xs text-gray-500 mt-1">
                    Supported formats: JPEG, PNG, GIF (max 15MB)
                  </p>
                </div>
              </div>
            </div>



            <div className="flex space-x-3">
              <button type="submit" className="btn-primary">
                Update Member
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Content - Health Records and Vitals */}
              <div className="bg-white shadow rounded-lg p-3 sm:p-4 md:p-6 mx-2 sm:mx-0">
        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('vitals')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'vitals'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Vitals
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Reports
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'documents'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Documents
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'vitals' && (
          <div>
            <div className="flex justify-end mb-4">
              <button 
                onClick={() => setShowAddVitalModal(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
              >
                <PlusIcon />
                <span>Add Vital</span>
              </button>
            </div>


            {(healthVitals.length > 0 || getBMIRecords().length > 0) ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                {/* BMI Card - Always show if there are height and weight records */}
                {getBMIRecords().length > 0 && (
                  (() => {
                    const bmiRecords = getBMIRecords();
                    const latestBMI = bmiRecords[0];
                    const isExpanded = expandedVitalTypes.has('bmi');
                    const vitalStatus = getVitalStatus('bmi', latestBMI.value, member?.gender);
                    const vitalConfig = VITAL_TYPES['bmi'];
                    
                    // Create gradient background based on status
                    const getBMIGradientClass = (status) => {
                      switch (status.level) {
                        case 'high':
                        case 'low':
                          return 'bg-gradient-to-br from-rose-50 via-rose-25 to-white';
                        case 'warning':
                          return 'bg-gradient-to-br from-amber-50 via-amber-25 to-white';
                        case 'normal':
                          return 'bg-gradient-to-br from-orange-50 via-orange-25 to-white';
                        default:
                          return 'bg-gradient-to-br from-gray-50 via-gray-25 to-white';
                      }
                    };
                    
                    return (
                      <div className={`rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${getBMIGradientClass(vitalStatus)}`}>
                        {/* BMI Card - Always Visible */}
                        <div 
                          className="p-3 cursor-pointer"
                          onClick={() => toggleVitalTypeExpansion('bmi')}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <h4 className="text-lg font-semibold text-gray-900">BMI</h4>
                                {vitalStatus.status && (
                                  <span className={`text-xs px-2 py-1 rounded-full ${vitalStatus.bgColor} ${vitalStatus.color}`}>
                                    {vitalStatus.status}
                                  </span>
                                )}
                              </div>
                              <div className="mb-2">
                                <p className={`text-xl font-bold ${vitalStatus.color}`}>
                                  {latestBMI.value} {latestBMI.unit}
                                </p>
                              </div>
                              {vitalConfig.ranges && (
                                <div className="flex items-center space-x-2 mb-1">
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                    {vitalConfig.ranges.display}
                                  </span>
                                </div>
                              )}
                              <p className="text-sm text-gray-500">
                                {formatDate(latestBMI.recorded_at)}
                              </p>
                              {bmiRecords.length > 1 && (
                                <p className="text-sm text-gray-600 mt-1">
                                  {bmiRecords.length} record{bmiRecords.length !== 1 ? 's' : ''}
                                </p>
                              )}
                            </div>
                            {bmiRecords.length > 1 && (
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleVitalTypeExpansion('bmi');
                                }}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                {isExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Expanded BMI Records */}
                        {isExpanded && bmiRecords.length > 1 && (
                          <div className="border-t border-gray-100 bg-gray-50 p-4">
                            <div className="space-y-3">
                              {bmiRecords.map((bmiRecord, index) => {
                                const recordStatus = getVitalStatus('bmi', bmiRecord.value, member?.gender);
                                return (
                                  <div key={bmiRecord.id} className="flex justify-between items-center p-3 bg-white rounded-lg border border-gray-200">
                                    <div className="flex-1">
                                      <div className="flex items-center space-x-2 mb-1">
                                        <p className={`font-medium ${recordStatus.color}`}>
                                          {bmiRecord.value} {bmiRecord.unit}
                                        </p>
                                        {recordStatus.status && (
                                          <span className={`text-xs px-2 py-1 rounded-full ${recordStatus.bgColor} ${recordStatus.color}`}>
                                            {recordStatus.status}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-sm text-gray-500">
                                        {formatDate(bmiRecord.recorded_at)}
                                      </p>
                                      <p className="text-xs text-gray-400 mt-1">
                                        {bmiRecord.notes}
                                      </p>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()
                )}

                {/* Regular Vital Cards */}
                {Object.entries(groupVitalsByType(sortVitalsByPriority(healthVitals))).map(([vitalType, vitals]) => {
                  const vitalConfig = VITAL_TYPES[vitalType] || { label: vitalType.replace('_', ' ').toUpperCase() };
                  const latestVital = vitals[0]; // First one is the latest due to sorting
                  const isExpanded = expandedVitalTypes.has(vitalType);
                  const vitalStatus = getVitalStatus(vitalType, latestVital.value, member?.gender);
                  
                  // Create gradient background based on status
                  const getGradientClass = (status) => {
                    switch (status.level) {
                      case 'high':
                      case 'low':
                        return 'bg-gradient-to-br from-rose-50 via-rose-25 to-white';
                      case 'warning':
                        return 'bg-gradient-to-br from-amber-50 via-amber-25 to-white';
                      case 'normal':
                        return 'bg-gradient-to-br from-orange-50 via-orange-25 to-white';
                      default:
                        return 'bg-gradient-to-br from-gray-50 via-gray-25 to-white';
                    }
                  };
                  
                  return (
                    <div key={vitalType} className={`rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col card-consistent-height ${getGradientClass(vitalStatus)}`}>
                      {/* Main Card - Always Visible */}
                      <div 
                        className="p-3 cursor-pointer card-content"
                        onClick={() => toggleVitalTypeExpansion(vitalType)}
                      >
                        <div className="flex justify-between items-start card-body">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">{vitalConfig.label}</h4>
                              {vitalStatus.status && (
                                <span className={`text-xs px-2 py-1 rounded-full ${vitalStatus.bgColor} ${vitalStatus.color}`}>
                                  {vitalStatus.status}
                                </span>
                              )}
                            </div>
                            <div className="mb-2">
                              <p className={`text-xl font-bold ${vitalStatus.color}`}>
                                {latestVital.value} {latestVital.unit}
                              </p>
                            </div>
                            {vitalConfig.ranges && (
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                                  {vitalConfig.ranges.display}
                                </span>
                              </div>
                            )}
                            <p className="text-sm text-gray-500">
                              {formatDate(latestVital.recorded_at)}
                            </p>
                            {vitals.length > 1 && (
                              <p className="text-sm text-gray-600 mt-1">
                                {vitals.length} record{vitals.length !== 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
								{/* Add Vital inside this type */}
								<button
									onClick={(e) => { e.stopPropagation(); openAddVitalForType(vitalType); }}
									className="text-teal-600 hover:text-teal-800 p-2 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
									title={`Add ${vitalConfig.label}`}
								>
									<PlusIcon />
								</button>
                              {vitals.length > 1 && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleVitalTypeExpansion(vitalType);
                                  }}
                                  className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                  {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                                </button>
                              )}
                            </div>
                          </div>
                          </div>

                          {/* Expanded Content - Show All Records */}
                          {isExpanded && vitals.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="p-2 rounded-lg">
                            {vitals.map((vital, index) => {
                              const latestCard = index === 0;
                              const recordStatus = getVitalStatus(vitalType, vital.value, member?.gender);
                              return (
                              <div key={vital.id} className={`p-1.5 rounded-md shadow-sm mx-1 my-0.5 ${getSubCardGradientClass(recordStatus)} hover:shadow-md transition-shadow duration-200`}>
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-1">
                                      <p className={`text-sm font-medium ${recordStatus.color}`}>
                                      {vital.value} {vital.unit}
                                    </p>
                                      {recordStatus.status && (
                                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${recordStatus.bgColor} ${recordStatus.color}`}>
                                          {recordStatus.status}
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1">
                                      {formatDate(vital.recorded_at)}
                                    </p>
                                    {vital.notes && (
                                      <p className="text-xs text-gray-600 mt-1 line-clamp-1">{vital.notes}</p>
                                    )}
                                  </div>
                                  <div className="flex space-x-1 ml-2">
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleEditVital(vital);
                                      }}
                                      className="text-green-600 hover:text-green-800 p-1.5 bg-green-50 hover:bg-green-100 rounded transition-colors"
                                      title="Edit"
                                    >
                                      <EditIcon />
                                    </button>
                                    <button 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteVital(vital);
                                      }}
                                      className="text-red-600 hover:text-red-800 p-1.5 bg-red-50 hover:bg-red-100 rounded transition-colors"
                                      title="Delete"
                                    >
                                      <DeleteIcon />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );})}
                              </div>
                            </div>
                          )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">No health vitals recorded yet</p>
            )}
          </div>
        )}

        {activeTab === 'reports' && (
          <div>
            <div className="flex justify-end mb-4">
              <button 
                onClick={() => setShowUploadReportModal(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
              >
                <UploadIcon />
                <span>Upload Report</span>
              </button>
            </div>


            {medicalReports.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                {Object.entries(groupReportsByType(medicalReports)).map(([reportKey, reports]) => {
                  const latestReport = reports[0]; // First one is the latest due to sorting
                  const isExpanded = expandedReportTypes.has(reportKey);
                  
                  // Use report_type and report_sub_type from the latest report for headings
                  const reportConfig = REPORT_TYPES[latestReport.report_type] || { label: latestReport.report_type.replace(/_/g, ' ').toUpperCase() };
                  const subTypeValue = latestReport.report_sub_type || '';
                  const subTypeConfig = REPORT_TYPES[latestReport.report_type]?.subTypes?.find(st => st.value === subTypeValue);
                  const subTypeLabel = subTypeConfig?.label || (subTypeValue ? subTypeValue.replace(/_/g, ' ').toUpperCase() : '');
                  const groupSubTypeLabel = subTypeLabel;
                  
                  // Get main card status based on latest report
                  const mainCardStatus = getMainCardStatus(reports, getReportStatus);
                  
                  return (
                    <div key={reportKey} className={`rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col card-consistent-height ${getGradientClass(mainCardStatus)}`}>
                      {/* Main Card - Always Visible */}
                      <div 
                        className="p-3 cursor-pointer card-content"
                        onClick={() => toggleReportTypeExpansion(reportKey)}
                      >
                        <div className="flex justify-between items-start card-body">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">{reportConfig.label}</h4>
                              {mainCardStatus.status && (
                                <span className={`text-xs px-2 py-1 rounded-full ${mainCardStatus.bgColor} ${mainCardStatus.color}`}>
                                  {mainCardStatus.status}
                                </span>
                              )}
                            </div>
                            {subTypeLabel && (
                              <p className="text-sm text-gray-600 mb-2">{subTypeLabel}</p>
                            )}
                                                         <div className="mb-2">
                               <span className="text-xs text-gray-500">
                                 {formatDate(latestReport.report_date)}
                               </span>
                             </div>
                            {latestReport.description && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                {latestReport.description}
                              </p>
                            )}
                            {reports.length > 1 && (
                              <p className="text-sm text-gray-600 mt-2">
                                {reports.length} report{reports.length !== 1 ? 's' : ''}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
								{/* Upload inside this report type */}
								<button 
									onClick={(e) => { e.stopPropagation(); openUploadForReportType(latestReport.report_type); }}
									className="text-teal-600 hover:text-teal-800 p-2 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
									title={`Upload ${reportConfig.label}`}
								>
									<UploadIcon />
								</button>
                              {reports.length > 1 && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleReportTypeExpansion(reportKey);
                                  }}
                                  className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                  {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                                </button>
                              )}
                            </div>
                          </div>
                          </div>

                          {/* Expanded Content - Show All Reports */}
                          {isExpanded && reports.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="p-2 rounded-lg">
                              {reports.map((report, index) => {
                                const isPdf = report.file_name?.toLowerCase().endsWith('.pdf');
                                const subValue = report.report_sub_type || '';
                                const subCfg = REPORT_TYPES[report.report_type]?.subTypes?.find(st => st.value === subValue);
                                const derivedSub = subCfg?.label || (subValue ? subValue.replace(/_/g, ' ').toUpperCase() : '');
                                // Prioritize showing actual sub-type value over falling back to report type
                                const subLabel = derivedSub || (subValue ? subValue.replace(/_/g, ' ').toUpperCase() : '') || report.report_type?.replace(/_/g, ' ').toUpperCase() || 'Report';
                                const latestCard = index === 0;
                                const reportStatus = getReportStatus(report);
                                return (
                                  <div 
                                    key={report.id} 
                                    className={`p-1.5 rounded-md shadow-sm mx-1 my-0.5 ${getSubCardGradientClass(reportStatus)} hover:shadow-md transition-shadow duration-200 cursor-pointer`}
                                    onClick={() => isPdf && handleViewReport(report)}
                                  >
                                    <div className="flex justify-between items-start">
                                      <div className="flex-1">
                                        <div className="flex items-center space-x-2 mb-1">
                                          <h6 className="text-sm font-medium text-gray-900">{subLabel}</h6>
                                          {reportStatus.status && (
                                            <span className={`text-xs px-1.5 py-0.5 rounded-full ${reportStatus.bgColor} ${reportStatus.color}`}>
                                              {reportStatus.status}
                                            </span>
                                          )}
                                        </div>
                                        <div className="mb-1">
                                          <span className="text-xs text-gray-500">{formatDate(report.report_date)}</span>
                                        </div>
                                        {report.description && (
                                          <p className="text-xs text-gray-600 mb-1 line-clamp-1">
                                            {report.description}
                                          </p>
                                        )}
                                      </div>
                                      <div className="flex flex-col items-end gap-1 ml-2">
                                        <div className="flex space-x-1">
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDownloadReport(report);
                                            }}
                                            className="text-teal-600 hover:text-teal-800 p-1.5 bg-teal-50 hover:bg-teal-100 rounded transition-colors"
                                            title="Download"
                                          >
                                            <DownloadIcon />
                                          </button>
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleEditReport(report);
                                            }}
                                            className="text-green-600 hover:text-green-800 p-1.5 bg-green-50 hover:bg-green-100 rounded transition-colors"
                                            title="Edit"
                                          >
                                            <EditIcon />
                                          </button>
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteReport(report);
                                            }}
                                            className="text-red-600 hover:text-red-800 p-1.5 bg-red-50 hover:bg-red-100 rounded transition-colors"
                                            title="Delete"
                                          >
                                            <DeleteIcon />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                              </div>
                            </div>
                          )}
                      </div>
                    );
                })}
              </div>
            ) : (
              <p className="text-gray-500">No medical reports uploaded yet</p>
            )}
          </div>
        )}

        {activeTab === 'documents' && (
            <div>
                        <div className="flex justify-end mb-4">
              <button 
                onClick={() => setShowUploadDocumentModal(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
              >
                <UploadIcon />
                <span>Upload Document</span>
              </button>
            </div>
            
            {documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((document) => {
                  const documentStatus = getDocumentStatus(document);
                  return (
                    <div 
                      key={document.id} 
                      className={`rounded-lg border border-gray-200 hover:shadow-md transition-shadow card-consistent-height flex flex-col ${getGradientClass(documentStatus)} cursor-pointer`}
                      onClick={() => handleViewDocument(document)}
                    >
                      <div className="p-3 card-content">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-gray-900 text-sm">{document.title}</h4>
                            {documentStatus.status && (
                              <span className={`text-xs px-1.5 py-0.5 rounded-full ${documentStatus.bgColor} ${documentStatus.color}`}>
                                {documentStatus.status}
                              </span>
                            )}
                          </div>
                          <div className="flex space-x-1">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownloadDocument(document);
                              }}
                              className="text-blue-600 hover:text-blue-800 p-1.5 bg-blue-50 hover:bg-blue-100 rounded transition-colors"
                              title="Download"
                            >
                              <DownloadIcon />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditDocument(document);
                              }}
                              className="text-green-600 hover:text-green-800 p-1.5 bg-green-50 hover:bg-green-100 rounded transition-colors"
                              title="Edit"
                            >
                              <EditIcon />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDocument(document);
                              }}
                              className="text-red-600 hover:text-red-800 p-1.5 bg-red-50 hover:bg-red-100 rounded transition-colors"
                              title="Delete"
                            >
                              <DeleteIcon />
                            </button>
                          </div>
                        </div>
                        <div className="card-body">
                          <p className="text-sm text-gray-600 mb-2">{formatDate(document.upload_date)}</p>
                          {document.description && (
                            <p className="text-sm text-gray-600 line-clamp-3">{document.description}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                </div>
              ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p className="text-gray-500">No documents uploaded yet</p>
                <button 
                  onClick={() => setShowUploadDocumentModal(true)}
                  className="mt-4 text-teal-600 hover:text-teal-800 font-medium"
                >
                  Upload your first document
                </button>
              </div>
              )}
            </div>
          )}

        {/* Add Vital Modal */}
        {showAddVitalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4">Add Health Vital</h2>
              <form onSubmit={handleAddVital} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vital Type</label>
                  <select
                    value={vitalFormData.vitalType}
                    onChange={(e) => handleVitalTypeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    <option value="">Select Vital Type</option>
                    {Object.entries(VITAL_TYPES).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                  <input
                    type="number"
                    step="0.01"
                    value={vitalFormData.value}
                    onChange={(e) => setVitalFormData({...vitalFormData, value: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder={vitalFormData.vitalType ? VITAL_TYPES[vitalFormData.vitalType]?.placeholder : ''}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={vitalFormData.unit}
                    onChange={(e) => setVitalFormData({...vitalFormData, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder={vitalFormData.vitalType ? VITAL_TYPES[vitalFormData.vitalType]?.unit : ''}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Recorded</label>
                  <input
                    type="date"
                    value={vitalFormData.recordedAt}
                    onChange={(e) => setVitalFormData({...vitalFormData, recordedAt: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                  <textarea
                    value={vitalFormData.notes}
                    onChange={(e) => setVitalFormData({...vitalFormData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    rows="3"
                    placeholder="Any additional notes..."
                  />
                </div>
                <div className="flex space-x-3">
                  <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium">
                    Add Vital
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddVitalModal(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Vital Modal */}
        {showEditVitalModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4">Edit Health Vital</h2>
              <form onSubmit={handleUpdateVital} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vital Type</label>
                  <select
                    value={editVitalFormData.vitalType}
                    onChange={(e) => {
                      const vitalConfig = VITAL_TYPES[e.target.value];
                      setEditVitalFormData({
                        ...editVitalFormData,
                        vitalType: e.target.value,
                        unit: vitalConfig ? vitalConfig.unit : editVitalFormData.unit
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    <option value="">Select Vital Type</option>
                    {Object.entries(VITAL_TYPES).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editVitalFormData.value}
                    onChange={(e) => setEditVitalFormData({...editVitalFormData, value: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder={editVitalFormData.vitalType ? VITAL_TYPES[editVitalFormData.vitalType]?.placeholder : ''}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <input
                    type="text"
                    value={editVitalFormData.unit}
                    onChange={(e) => setEditVitalFormData({...editVitalFormData, unit: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder={editVitalFormData.vitalType ? VITAL_TYPES[editVitalFormData.vitalType]?.unit : ''}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Recorded</label>
                  <input
                    type="date"
                    value={editVitalFormData.recordedAt}
                    onChange={(e) => setEditVitalFormData({...editVitalFormData, recordedAt: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                  <textarea
                    value={editVitalFormData.notes}
                    onChange={(e) => setEditVitalFormData({...editVitalFormData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    rows="3"
                    placeholder="Any additional notes..."
                  />
                </div>
                <div className="flex space-x-3">
                  <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium">
                    Update Vital
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditVitalModal(false);
                      setEditingVital(null);
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Upload Report Modal */}
        {showUploadReportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4">Upload Medical Report</h2>
              <form onSubmit={handleUploadReport} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                  <select
                    value={reportFormData.reportType}
                    onChange={(e) => {
                      setReportFormData({
                        ...reportFormData, 
                        reportType: e.target.value,
                        reportSubType: ''
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  >
                    <option value="">Select Report Type</option>
                    {Object.entries(REPORT_TYPES).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
                {reportFormData.reportType && REPORT_TYPES[reportFormData.reportType]?.subTypes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Report Sub-Type</label>
                    <select
                      value={reportFormData.reportSubType}
                      onChange={(e) => setReportFormData({...reportFormData, reportSubType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                      required
                    >
                      <option value="">Select Sub-Type</option>
                      {REPORT_TYPES[reportFormData.reportType].subTypes.map((subType) => (
                        <option key={subType.value} value={subType.value}>{subType.label}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Report Date</label>
                  <input
                    type="date"
                    value={reportFormData.reportDate}
                    onChange={(e) => setReportFormData({...reportFormData, reportDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                  <input
                    type="file"
                    onChange={handleFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    accept=".pdf"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Only PDF files are accepted (max 20MB)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <textarea
                    value={reportFormData.description}
                    onChange={(e) => setReportFormData({...reportFormData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    rows="3"
                    placeholder="Report description..."
                  />
                </div>
                <div className="flex space-x-3">
                  <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium">
                    Upload Report
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUploadReportModal(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Report Modal */}
        {showEditReportModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4">Edit Medical Report</h2>
              <form onSubmit={handleUpdateReport} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Report Type</label>
                  <select
                    value={editReportFormData.reportType}
                    onChange={(e) => {
                      setEditReportFormData({
                        ...editReportFormData, 
                        reportType: e.target.value,
                        reportSubType: ''
                      });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">Select Report Type</option>
                    {Object.entries(REPORT_TYPES).map(([key, config]) => (
                      <option key={key} value={key}>{config.label}</option>
                    ))}
                  </select>
                </div>
                {editReportFormData.reportType && REPORT_TYPES[editReportFormData.reportType]?.subTypes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Report Sub-Type</label>
                    <select
                      value={editReportFormData.reportSubType}
                      onChange={(e) => setEditReportFormData({...editReportFormData, reportSubType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="">Select Sub-Type</option>
                      {REPORT_TYPES[editReportFormData.reportType].subTypes.map((subType) => (
                        <option key={subType.value} value={subType.value}>{subType.label}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editReportFormData.title}
                    onChange={(e) => setEditReportFormData({...editReportFormData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Report title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Report Date</label>
                  <input
                    type="date"
                    value={editReportFormData.reportDate}
                    onChange={(e) => setEditReportFormData({...editReportFormData, reportDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File (Optional - leave empty to keep current file)</label>
                  <input
                    type="file"
                    onChange={handleEditFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    accept=".pdf"
                  />
                  <p className="text-xs text-gray-500 mt-1">Current file: {editingReport?.file_name}</p>
                  <p className="text-xs text-gray-500">Only PDF files are accepted (max 20MB)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <textarea
                    value={editReportFormData.description}
                    onChange={(e) => setEditReportFormData({...editReportFormData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    rows="3"
                    placeholder="Report description..."
                  />
                </div>
                <div className="flex space-x-3">
                  <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium">
                    Update Report
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditReportModal(false);
                      setEditingReport(null);
                      setEditReportFormData({
                        reportType: '',
                        reportSubType: '',
                        title: '',
                        description: '',
                        reportDate: new Date().toISOString().split('T')[0],
                        file: null
                      });
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Upload Document Modal */}
        {showUploadDocumentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4">Upload Document</h2>
              <form onSubmit={handleUploadDocument} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={documentFormData.title}
                    onChange={(e) => setDocumentFormData({...documentFormData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Document title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Date</label>
                  <input
                    type="date"
                    value={documentFormData.uploadDate}
                    onChange={(e) => setDocumentFormData({...documentFormData, uploadDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                  <input
                    type="file"
                    onChange={handleDocumentFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    accept=".pdf"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Only PDF files are accepted (max 20MB)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <textarea
                    value={documentFormData.description}
                    onChange={(e) => setDocumentFormData({...documentFormData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    rows="3"
                    placeholder="Document description..."
                  />
                </div>
                <div className="flex space-x-3">
                  <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium">
                    Upload Document
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUploadDocumentModal(false)}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Document Viewer Modal */}
        {showDocumentViewer && selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-1 sm:p-2 md:p-4">
            <div className="bg-white rounded-lg w-full h-full max-w-7xl flex flex-col shadow-2xl pdf-viewer-container"> 
              <div className="flex justify-between items-center p-3 sm:p-4 border-b flex-wrap gap-2">
                <h2 className="text-base sm:text-lg font-semibold flex-1 min-w-0">
                  <span className="truncate block">{selectedDocument.title}</span>
                </h2>
                <div className="flex space-x-2 flex-shrink-0">
                  <button
                    onClick={() => handleDownloadDocument(selectedDocument)}
                    className="text-teal-600 hover:text-teal-800 text-sm bg-teal-50 hover:bg-teal-100 px-3 py-2 rounded whitespace-nowrap transition-colors"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => {
                      if (selectedDocument?.pdfUrl) {
                        URL.revokeObjectURL(selectedDocument.pdfUrl);
                      }
                      setShowDocumentViewer(false);
                      setSelectedDocument(null);
                    }}
                    className="text-gray-600 hover:text-gray-800 text-sm bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded whitespace-nowrap transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                {selectedDocument.pdfUrl ? (
                  <iframe
                    src={`${selectedDocument.pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=Fit&zoom=page-width`}
                    className="w-full h-full border-0 pdf-viewer-iframe"
                    title={selectedDocument.title}
                    allowFullScreen
                    style={{ 
                      minHeight: '100%',
                      maxHeight: '100%',
                      overflow: 'auto'
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Loading PDF...</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Edit Document Modal */}
        {showEditDocumentModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4">Edit Document</h2>
              <form onSubmit={handleUpdateDocument} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={editDocumentFormData.title}
                    onChange={(e) => setEditDocumentFormData({...editDocumentFormData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Document title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Upload Date</label>
                  <input
                    type="date"
                    value={editDocumentFormData.uploadDate}
                    onChange={(e) => setEditDocumentFormData({...editDocumentFormData, uploadDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">File (Optional - leave empty to keep current file)</label>
                  <input
                    type="file"
                    onChange={handleEditDocumentFileChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    accept=".pdf"
                  />
                  <p className="text-xs text-gray-500 mt-1">Current file: {editingDocument?.file_name}</p>
                  <p className="text-xs text-gray-500">Only PDF files are accepted (max 20MB)</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <textarea
                    value={editDocumentFormData.description}
                    onChange={(e) => setEditDocumentFormData({...editDocumentFormData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                    rows="3"
                    placeholder="Document description..."
                  />
                </div>
                <div className="flex space-x-3">
                  <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium">
                    Update Document
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditDocumentModal(false);
                      setEditingDocument(null);
                      setEditDocumentFormData({
                        title: '',
                        description: '',
                        uploadDate: new Date().toISOString().split('T')[0],
                        file: null
                      });
                    }}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* PDF Viewer Modal */}
        {showPdfViewer && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-1 sm:p-2 md:p-4">
            <div className="bg-white rounded-lg w-full h-full max-w-7xl flex flex-col shadow-2xl pdf-viewer-container">
              <div className="flex justify-between items-center p-3 sm:p-4 border-b flex-wrap gap-2">
                <h2 className="text-base sm:text-lg font-semibold flex-1 min-w-0">
                  <span className="truncate block">
                    {(() => {
                      const reportConfig = REPORT_TYPES[selectedReport.report_type] || { label: selectedReport.report_type?.replace(/_/g, ' ').toUpperCase() };
                      const subTypeValue = selectedReport.report_sub_type || '';
                      const subTypeConfig = REPORT_TYPES[selectedReport.report_type]?.subTypes?.find(st => st.value === subTypeValue);
                      const subTypeLabel = subTypeConfig?.label || (subTypeValue ? subTypeValue.replace(/_/g, ' ').toUpperCase() : '');
                      
                      if (subTypeLabel) {
                        return `${reportConfig.label} : ${subTypeLabel}`;
                      } else {
                        return reportConfig.label;
                      }
                    })()}
                  </span>
                </h2>
                <div className="flex space-x-2 flex-shrink-0">
                  <button
                    onClick={() => handleDownloadReport(selectedReport)}
                    className="text-teal-600 hover:text-teal-800 text-sm bg-teal-50 hover:bg-teal-100 px-3 py-2 rounded whitespace-nowrap transition-colors"
                  >
                    Download
                  </button>
                  <button
                    onClick={() => {
                      if (selectedReport?.pdfUrl) {
                        URL.revokeObjectURL(selectedReport.pdfUrl);
                      }
                      setShowPdfViewer(false);
                      setSelectedReport(null);
                    }}
                    className="text-gray-600 hover:text-gray-800 text-sm bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded whitespace-nowrap transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="flex-1 overflow-hidden">
                {selectedReport.pdfUrl ? (
                  <iframe
                    src={`${selectedReport.pdfUrl}#toolbar=1&navpanes=1&scrollbar=1&view=Fit&zoom=page-width`}
                    className="w-full h-full border-0 pdf-viewer-iframe"
                    title={selectedReport.title}
                    allowFullScreen
                    style={{ 
                      minHeight: '100%',
                      maxHeight: '100%',
                      overflow: 'auto'
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center h-64">
                    <div className="text-gray-500">Loading PDF...</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Profile Picture Upload Modal */}
        {showProfileUploadModal && member && (
          <ProfilePictureUpload
            member={member}
            onUploadSuccess={handleProfileUploadSuccess}
            onClose={() => setShowProfileUploadModal(false)}
          />
        )}
      </div>
    </div>
    );
  };

export default MemberPage;
