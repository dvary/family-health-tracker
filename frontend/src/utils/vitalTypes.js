// Shared vital types configuration
export const VITAL_TYPES = {
  height: { 
    label: 'Height', 
    unit: 'cm',
    placeholder: '170',
    ranges: {
      normal: { min: 0, max: 200 },
      display: '0-200'
    }
  },
  weight: { 
    label: 'Weight', 
    unit: 'kg', 
    placeholder: '70',
    ranges: {
      normal: { min: 0, max: 120 },
      display: '0-120'
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
export const REPORT_TYPES = {
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
