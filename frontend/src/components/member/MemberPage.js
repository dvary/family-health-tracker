import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

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

// Vital types configuration with units
const VITAL_TYPES = {
  blood_pressure: { label: 'Blood Pressure', unit: 'mmHg', placeholder: '120/80' },
  blood_sugar: { label: 'Blood Sugar', unit: 'mg/dL', placeholder: '100' },
  oxygen: { label: 'Oxygen Saturation', unit: '%', placeholder: '98' },
  weight: { label: 'Weight', unit: 'kg', placeholder: '70' },
  height: { label: 'Height', unit: 'cm', placeholder: '170' },
  temperature: { label: 'Temperature', unit: '°C', placeholder: '37' },
  heart_rate: { label: 'Heart Rate', unit: 'bpm', placeholder: '72' },
  bmi: { label: 'BMI', unit: 'kg/m²', placeholder: '24.2' },
  cholesterol: { label: 'Cholesterol', unit: 'mg/dL', placeholder: '200' },
  hemoglobin: { label: 'Hemoglobin', unit: 'g/dL', placeholder: '14' },
  platelet_count: { label: 'Platelet Count', unit: '/μL', placeholder: '250000' },
  white_blood_cells: { label: 'White Blood Cells', unit: '/μL', placeholder: '7000' },
  red_blood_cells: { label: 'Red Blood Cells', unit: 'M/μL', placeholder: '5.0' },
  creatinine: { label: 'Creatinine', unit: 'mg/dL', placeholder: '1.0' },
  urea: { label: 'Urea', unit: 'mg/dL', placeholder: '20' },
  bilirubin: { label: 'Bilirubin', unit: 'mg/dL', placeholder: '0.8' },
  sodium: { label: 'Sodium', unit: 'mEq/L', placeholder: '140' },
  potassium: { label: 'Potassium', unit: 'mEq/L', placeholder: '4.0' },
  calcium: { label: 'Calcium', unit: 'mg/dL', placeholder: '9.5' },
  vitamin_d: { label: 'Vitamin D', unit: 'ng/mL', placeholder: '30' },
  vitamin_b12: { label: 'Vitamin B12', unit: 'pg/mL', placeholder: '500' },
  thyroid_tsh: { label: 'Thyroid TSH', unit: 'μIU/mL', placeholder: '2.5' },
  thyroid_t3: { label: 'Thyroid T3', unit: 'ng/dL', placeholder: '120' },
  thyroid_t4: { label: 'Thyroid T4', unit: 'μg/dL', placeholder: '1.2' },
  other: { label: 'Other', unit: '', placeholder: 'Enter value' }
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
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditForm, setShowEditForm] = useState(false);
  const [showAddVitalModal, setShowAddVitalModal] = useState(false);
  const [showUploadReportModal, setShowUploadReportModal] = useState(false);
  const [showEditReportModal, setShowEditReportModal] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [editingReport, setEditingReport] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: '',
    relationships: []
  });
  const [vitalFormData, setVitalFormData] = useState({
    vitalType: '',
    value: '',
    unit: '',
    notes: '',
    recordedAt: new Date().toISOString().split('T')[0]
  });
  const [reportFormData, setReportFormData] = useState({
    reportType: '',
    reportSubType: '',
    title: '',
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

  // Date formatting utility
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Age calculation with months for < 1 year
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                       (today.getMonth() - birthDate.getMonth());
    
    if (ageInMonths < 12) {
      return `${ageInMonths} month${ageInMonths !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      return `${years} year${years !== 1 ? 's' : ''}`;
    }
  };
  const [newRelationship, setNewRelationship] = useState({
    relatedMemberId: '',
    relationshipType: ''
  });
  const [allMembers, setAllMembers] = useState([]);
  const [healthVitals, setHealthVitals] = useState([]);
  const [medicalReports, setMedicalReports] = useState([]);
  const [activeTab, setActiveTab] = useState('vitals');

  useEffect(() => {
    fetchMemberData();
  }, [memberName]);

  const fetchMemberData = async () => {
    try {
      setLoading(true);
      
      // Fetch all members to find the one by name
      const membersResponse = await axios.get('/api/family/members');
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
        relationships: foundMember.relationships || []
      });
      
      // Fetch health vitals
      try {
        const vitalsResponse = await axios.get(`/api/health/vitals/${foundMember.id}`);
        setHealthVitals(vitalsResponse.data.vitals || []);
      } catch (error) {
        console.log('No health vitals found');
        setHealthVitals([]);
      }
      
      // Fetch medical reports
      try {
        const reportsResponse = await axios.get(`/api/health/reports/${foundMember.id}`);
        setMedicalReports(reportsResponse.data.reports || []);
      } catch (error) {
        console.log('No medical reports found');
        setMedicalReports([]);
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
      await axios.put(`/api/family/members/${member.id}`, formData);
      toast.success('Member updated successfully');
      setShowEditForm(false);
      fetchMemberData();
    } catch (error) {
      toast.error('Failed to update member');
    }
  };

  const handleCancel = () => {
    setShowEditForm(false);
    setFormData({
      name: member.name,
      dateOfBirth: member.date_of_birth ? member.date_of_birth.split('T')[0] : '',
      gender: member.gender || '',
      relationships: member.relationships || []
    });
  };

  const addRelationship = () => {
    if (newRelationship.relatedMemberId && newRelationship.relationshipType) {
      setFormData({
        ...formData,
        relationships: [...formData.relationships, newRelationship]
      });
      setNewRelationship({ relatedMemberId: '', relationshipType: '' });
    }
  };

  const removeRelationship = (index) => {
    setFormData({
      ...formData,
      relationships: formData.relationships.filter((_, i) => i !== index)
    });
  };

  const handleDeleteMember = async () => {
    if (window.confirm('Are you sure you want to delete this family member?')) {
      try {
        await axios.delete(`/api/family/members/${member.id}`);
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
      await axios.post('/api/health/vitals', {
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

  const handleUploadReport = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('memberId', member.id);
      formData.append('reportType', reportFormData.reportType);
      formData.append('title', reportFormData.title);
      formData.append('description', reportFormData.description);
      formData.append('reportDate', reportFormData.reportDate);
      formData.append('file', reportFormData.file);

      await axios.post('/api/health/reports', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('Medical report uploaded successfully');
      setShowUploadReportModal(false);
      setReportFormData({
        reportType: '',
        title: '',
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

      await axios.put(`/api/health/reports/${editingReport.id}`, formData, {
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

  const handleViewReport = (report) => {
    setSelectedReport(report);
    setShowPdfViewer(true);
  };

  const handleDownloadReport = async (report) => {
    try {
      const response = await axios.get(`/api/health/reports/${report.id}/download`, {
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
        await axios.delete(`/api/health/reports/${report.id}`);
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
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-gray-600 hover:text-gray-800"
            >
              ← Back to Dashboard
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{member.name}</h1>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={() => setShowEditForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Edit Member
            </button>
            <button
              onClick={handleDeleteMember}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Delete Member
            </button>
          </div>
        </div>

        {/* Member basic info */}
        <div className="flex items-center space-x-6">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl shadow-lg"
            style={{ 
              backgroundColor: genderInfo.bgColor,
              color: genderInfo.color
            }}
          >
            {genderInfo.icon}
          </div>
          <div>
            <p className="text-gray-600">
              {age ? `${age} years old` : 'Age not specified'}
              {member.date_of_birth && ` • Born ${new Date(member.date_of_birth).toLocaleDateString()}`}
            </p>
            <p className="text-gray-600 capitalize">
              {member.gender || 'Gender not specified'}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {showEditForm && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Edit Family Member</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
              <select
                value={formData.gender}
                onChange={(e) => setFormData({...formData, gender: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              >
                <option value="">Select Gender</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Relationships</h3>
              {formData.relationships.map((rel, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <select
                    value={rel.relatedMemberId}
                    onChange={(e) => {
                      const newRels = [...formData.relationships];
                      newRels[index].relatedMemberId = e.target.value;
                      setFormData({...formData, relationships: newRels});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 flex-1"
                    required
                  >
                    <option value="">Select Member</option>
                    {allMembers.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={rel.relationshipType}
                    onChange={(e) => {
                      const newRels = [...formData.relationships];
                      newRels[index].relationshipType = e.target.value;
                      setFormData({...formData, relationships: newRels});
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 flex-1"
                    required
                  >
                    <option value="">Select Relation</option>
                    <option value="Self">Self</option>
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Daughter">Daughter</option>
                    <option value="Son">Son</option>
                    <option value="Sister">Sister</option>
                    <option value="Brother">Brother</option>
                    <option value="Husband">Husband</option>
                    <option value="Wife">Wife</option>
                    <option value="Grandmother">Grandmother</option>
                    <option value="Grandfather">Grandfather</option>
                    <option value="Granddaughter">Granddaughter</option>
                    <option value="Grandson">Grandson</option>
                    <option value="Aunt">Aunt</option>
                    <option value="Uncle">Uncle</option>
                    <option value="Cousin">Cousin</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => removeRelationship(index)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg"
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              <div className="flex items-center space-x-2">
                <select
                  value={newRelationship.relatedMemberId}
                  onChange={(e) => setNewRelationship({...newRelationship, relatedMemberId: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 flex-1"
                >
                  <option value="">Select Member</option>
                  {allMembers.map(m => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <select
                  value={newRelationship.relationshipType}
                  onChange={(e) => setNewRelationship({...newRelationship, relationshipType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 flex-1"
                >
                  <option value="">Select Relation</option>
                  <option value="Self">Self</option>
                  <option value="Mother">Mother</option>
                  <option value="Father">Father</option>
                  <option value="Daughter">Daughter</option>
                  <option value="Son">Son</option>
                  <option value="Sister">Sister</option>
                  <option value="Brother">Brother</option>
                  <option value="Husband">Husband</option>
                  <option value="Wife">Wife</option>
                  <option value="Grandmother">Grandmother</option>
                  <option value="Grandfather">Grandfather</option>
                  <option value="Granddaughter">Granddaughter</option>
                  <option value="Grandson">Grandson</option>
                  <option value="Aunt">Aunt</option>
                  <option value="Uncle">Uncle</option>
                  <option value="Cousin">Cousin</option>
                </select>
                <button
                  type="button"
                  onClick={addRelationship}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg"
                >
                  Add
                </button>
              </div>
            </div>

            <div className="flex space-x-3">
              <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium">
                Update Member
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Content - Health Records and Vitals */}
      <div className="bg-white shadow rounded-lg p-6">
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
              Health Vitals
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'reports'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Medical Reports
            </button>
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'overview'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Overview
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'vitals' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Health Vitals</h3>
              <button 
                onClick={() => setShowAddVitalModal(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Add Vital
              </button>
            </div>
            {healthVitals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {healthVitals.map((vital) => {
                  const vitalConfig = VITAL_TYPES[vital.vital_type] || { label: vital.vital_type.replace('_', ' ').toUpperCase() };
                  return (
                    <div key={vital.id} className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium text-gray-900">{vitalConfig.label}</p>
                      <p className="text-2xl font-bold text-teal-600">
                        {vital.value} {vital.unit}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDate(vital.recorded_at)}
                      </p>
                      {vital.notes && (
                        <p className="text-sm text-gray-600 mt-2">{vital.notes}</p>
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
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Medical Reports</h3>
              <button 
                onClick={() => setShowUploadReportModal(true)}
                className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Upload Report
              </button>
            </div>
            {medicalReports.length > 0 ? (
              <div className="space-y-4">
                {medicalReports
                  .sort((a, b) => new Date(b.report_date) - new Date(a.report_date))
                  .map((report) => {
                    const reportConfig = REPORT_TYPES[report.report_type] || { label: report.report_type.replace('_', ' ').toUpperCase() };
                    const isPdf = report.file_name?.toLowerCase().endsWith('.pdf');
                    return (
                      <div key={report.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="font-medium text-gray-900">{report.title}</p>
                            <p className="text-sm text-gray-600">{reportConfig.label}</p>
                            {report.report_sub_type && (
                              <p className="text-sm text-gray-500">
                                {REPORT_TYPES[report.report_type]?.subTypes?.find(st => st.value === report.report_sub_type)?.label || report.report_sub_type}
                              </p>
                            )}
                            <p className="text-sm text-gray-500">
                              {formatDate(report.report_date)}
                            </p>
                            {report.description && (
                              <p className="text-sm text-gray-600 mt-2">{report.description}</p>
                            )}
                            <p className="text-xs text-gray-400 mt-1">
                              File: {report.file_name} ({(report.file_size / 1024 / 1024).toFixed(2)} MB)
                            </p>
                          </div>
                          <div className="flex space-x-2 ml-4">
                            {isPdf && (
                              <button 
                                onClick={() => handleViewReport(report)}
                                className="text-blue-600 hover:text-blue-800 p-2 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                title="View PDF"
                              >
                                <EyeIcon />
                              </button>
                            )}
                            <button 
                              onClick={() => handleDownloadReport(report)}
                              className="text-teal-600 hover:text-teal-800 p-2 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors"
                              title="Download"
                            >
                              <DownloadIcon />
                            </button>
                            <button 
                              onClick={() => handleEditReport(report)}
                              className="text-green-600 hover:text-green-800 p-2 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <EditIcon />
                            </button>
                            <button 
                              onClick={() => handleDeleteReport(report)}
                              className="text-red-600 hover:text-red-800 p-2 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <DeleteIcon />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            ) : (
              <p className="text-gray-500">No medical reports uploaded yet</p>
            )}
          </div>
        )}

        {activeTab === 'overview' && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Relationships</h3>
            {member.relationships && member.relationships.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {member.relationships.map((rel, index) => {
                  const relatedMember = allMembers.find(m => m.id === rel.relatedMemberId);
                  return (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium text-gray-900">{rel.relationshipType}</p>
                      <p className="text-gray-600">{relatedMember?.name || 'Unknown Member'}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500">No relationships defined</p>
            )}
          </div>
        )}
      </div>

      {/* Add Vital Modal */}
      {showAddVitalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
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

      {/* Upload Report Modal */}
      {showUploadReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={reportFormData.title}
                  onChange={(e) => setReportFormData({...reportFormData, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Report title"
                  required
                />
              </div>
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
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Accepted formats: PDF, DOC, DOCX, JPG, PNG, GIF (max 10MB)</p>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                />
                <p className="text-xs text-gray-500 mt-1">Current file: {editingReport?.file_name}</p>
                <p className="text-xs text-gray-500">Accepted formats: PDF, DOC, DOCX, JPG, PNG, GIF (max 10MB)</p>
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

      {/* PDF Viewer Modal */}
      {showPdfViewer && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">{selectedReport.title}</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDownloadReport(selectedReport)}
                  className="text-teal-600 hover:text-teal-800 text-sm bg-teal-50 hover:bg-teal-100 px-3 py-1 rounded"
                >
                  Download
                </button>
                <button
                  onClick={() => setShowPdfViewer(false)}
                  className="text-gray-600 hover:text-gray-800 text-sm bg-gray-50 hover:bg-gray-100 px-3 py-1 rounded"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="flex-1 p-4">
              <iframe
                src={`/api/health/reports/${selectedReport.id}/download`}
                className="w-full h-full border-0"
                title={selectedReport.title}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberPage;
