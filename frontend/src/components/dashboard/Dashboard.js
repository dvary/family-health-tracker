import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

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

const Dashboard = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [showAddVitalModal, setShowAddVitalModal] = useState(false);
  const [showUploadReportModal, setShowUploadReportModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    dateOfBirth: '',
    gender: '',
    email: '',
    password: '',
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
  const navigate = useNavigate();

  useEffect(() => {
    fetchMembers();
  }, []);

  // Calculate age from date of birth with months for < 1 year
  const calculateAge = useCallback((dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    const ageInMonths = (today.getFullYear() - birthDate.getFullYear()) * 12 + 
                       (today.getMonth() - birthDate.getMonth());
    
    if (ageInMonths < 12) {
      return { age: ageInMonths, unit: 'month', display: `${ageInMonths} month${ageInMonths !== 1 ? 's' : ''}` };
    } else {
      const years = Math.floor(ageInMonths / 12);
      return { age: years, unit: 'year', display: `${years} year${years !== 1 ? 's' : ''}` };
    }
  }, []);

  // Get age group and color coding
  const getAgeGroupInfo = useCallback((ageData) => {
    if (ageData === null || ageData === undefined) return { group: 'Unknown', color: '#6B7280', bgColor: '#F3F4F6', icon: '👤' };
    
    const age = ageData.age;
    const unit = ageData.unit;
    
    if (unit === 'month' || (unit === 'year' && age < 18)) {
      return { group: 'Child', color: '#10B981', bgColor: '#D1FAE5', icon: '👶' };
    } else if (age < 30) {
      return { group: 'Young Adult', color: '#3B82F6', bgColor: '#DBEAFE', icon: '👨‍🎓' };
    } else if (age < 50) {
      return { group: 'Adult', color: '#8B5CF6', bgColor: '#EDE9FE', icon: '👨‍💼' };
    } else if (age < 65) {
      return { group: 'Middle Age', color: '#F59E0B', bgColor: '#FEF3C7', icon: '👨‍🦳' };
    } else {
      return { group: 'Senior', color: '#EF4444', bgColor: '#FEE2E2', icon: '👴' };
    }
  }, []);

  // Get gender icon
  const getGenderIcon = useCallback((gender) => {
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
  }, []);

  // Date formatting utility
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Vital type change handler
  const handleVitalTypeChange = (vitalType) => {
    const vitalConfig = VITAL_TYPES[vitalType];
    setVitalFormData(prev => ({
      ...prev,
      vitalType,
      unit: vitalConfig ? vitalConfig.unit : '',
      value: ''
    }));
  };

  // File change handler
  const handleFileChange = (e) => {
    setReportFormData({
      ...reportFormData,
      file: e.target.files[0]
    });
  };

  // Group members by age group
  const groupMembersByAge = useCallback((members) => {
    const groups = {
      'Child': [],
      'Young Adult': [],
      'Adult': [],
      'Middle Age': [],
      'Senior': [],
      'Unknown': []
    };

    members.forEach(member => {
      const ageData = calculateAge(member.date_of_birth);
      const ageGroupInfo = getAgeGroupInfo(ageData);
      groups[ageGroupInfo.group].push({ ...member, ageData });
    });

    // Sort each group by age (descending)
    Object.keys(groups).forEach(group => {
      groups[group].sort((a, b) => {
        if (!a.ageData || !b.ageData) return 0;
        // Convert to months for comparison
        const aMonths = a.ageData.unit === 'month' ? a.ageData.age : a.ageData.age * 12;
        const bMonths = b.ageData.unit === 'month' ? b.ageData.age : b.ageData.age * 12;
        return bMonths - aMonths;
      });
    });

    return groups;
  }, [calculateAge, getAgeGroupInfo]);

  const fetchMembers = async () => {
    try {
      const response = await axios.get('/api/family/members');
      setMembers(response.data.members);
    } catch (error) {
      toast.error('Failed to fetch family members');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingMember) {
        await axios.put(`/api/family/members/${editingMember.id}`, formData);
        toast.success('Family member updated successfully');
        setEditingMember(null);
      } else {
        if (members.length === 0) {
          await axios.post('/api/family/members/initial', {
            name: formData.name,
            dateOfBirth: formData.dateOfBirth,
            gender: formData.gender
          });
          toast.success('Initial family member added successfully');
        } else {
          await axios.post('/api/family/members', formData);
          toast.success('Family member added successfully');
        }
        setShowAddForm(false);
      }
      setFormData({ name: '', dateOfBirth: '', gender: '', email: '', password: '', relationships: [] });
      fetchMembers();
    } catch (error) {
      toast.error(editingMember ? 'Failed to update family member' : 'Failed to add family member');
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingMember(null);
    setFormData({ name: '', dateOfBirth: '', gender: '', email: '', password: '', relationships: [] });
  };

  const handleMemberClick = (member) => {
    const memberName = member.name.toLowerCase().replace(/\s+/g, '-');
    navigate(`/${memberName}`);
  };

  const handleAddVitalFromDashboard = (member) => {
    setSelectedMember(member);
    setShowAddVitalModal(true);
  };

  const handleUploadReportFromDashboard = (member) => {
    setSelectedMember(member);
    setShowUploadReportModal(true);
  };

  const handleAddVital = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/health/vitals', {
        memberId: selectedMember.id,
        vitalType: vitalFormData.vitalType,
        value: parseFloat(vitalFormData.value),
        unit: vitalFormData.unit,
        notes: vitalFormData.notes,
        recordedAt: vitalFormData.recordedAt
      });
      toast.success('Health vital added successfully');
      setShowAddVitalModal(false);
      setSelectedMember(null);
      setVitalFormData({
        vitalType: '',
        value: '',
        unit: '',
        notes: '',
        recordedAt: new Date().toISOString().split('T')[0]
      });
    } catch (error) {
      toast.error('Failed to add health vital');
    }
  };

  const handleUploadReport = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append('memberId', selectedMember.id);
      formData.append('reportType', reportFormData.reportType);
      if (reportFormData.reportSubType) {
        formData.append('reportSubType', reportFormData.reportSubType);
      }
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
      setSelectedMember(null);
      setReportFormData({
        reportType: '',
        reportSubType: '',
        title: '',
        description: '',
        reportDate: new Date().toISOString().split('T')[0],
        file: null
      });
    } catch (error) {
      toast.error('Failed to upload medical report');
    }
  };

  const handleEditMember = (member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      dateOfBirth: member.date_of_birth ? member.date_of_birth.split('T')[0] : '',
      gender: member.gender || '',
      relationships: member.relationships || []
    });
    setShowAddForm(true);
  };

  const handleDeleteMember = async (memberId) => {
    if (window.confirm('Are you sure you want to delete this family member?')) {
      try {
        await axios.delete(`/api/family/members/${memberId}`);
        toast.success('Family member deleted successfully');
        fetchMembers();
        setEditingMember(null);
        setShowAddForm(false);
      } catch (error) {
        toast.error('Failed to delete family member');
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

  const groupedMembers = groupMembersByAge(members);
  const ageGroupOrder = ['Child', 'Young Adult', 'Adult', 'Middle Age', 'Senior', 'Unknown'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Family Members</h1>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Add Family Member
        </button>
      </div>

      {/* Add/Edit Form */}
      {(showAddForm || editingMember) && (
        <div className="bg-white shadow-lg rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-semibold mb-4 text-gray-900">
            {editingMember ? 'Edit Family Member' : 'Add Family Member'}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                required
              />
            </div>

            <div className="flex space-x-3">
              <button type="submit" className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg font-medium">
                {editingMember ? 'Update Member' : 'Add Member'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium"
              >
                Cancel
              </button>
              {editingMember && (
                <button
                  type="button"
                  onClick={() => handleDeleteMember(editingMember.id)}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Delete Member
                </button>
              )}
            </div>
          </form>
        </div>
      )}

      {/* Family Members by Age Group */}
      {members.length > 0 ? (
        <div className="space-y-8">
          {ageGroupOrder.map(groupName => {
            const groupMembers = groupedMembers[groupName];
            if (groupMembers.length === 0) return null;

                         const ageGroupInfo = getAgeGroupInfo(groupMembers[0]?.ageData);
            
            return (
              <div key={groupName} className="space-y-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{ageGroupInfo.icon}</span>
                  <h2 className="text-xl font-semibold text-gray-900">{groupName}s</h2>
                  <span className="text-sm text-gray-500">({groupMembers.length} member{groupMembers.length !== 1 ? 's' : ''})</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                     {groupMembers.map((member) => {
                     const ageData = member.ageData;
                     const ageGroupInfo = getAgeGroupInfo(ageData);
                     const genderIcon = getGenderIcon(member.gender);
                     
                     return (
                       <div
                         key={member.id}
                         className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer"
                         onClick={() => handleMemberClick(member)}
                       >
                         <div className="flex flex-col items-center text-center space-y-3">
                           {/* Avatar */}
                           <div 
                             className="w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-md border-2"
                             style={{ 
                               backgroundColor: ageGroupInfo.bgColor,
                               borderColor: ageGroupInfo.color
                             }}
                           >
                             {genderIcon}
                           </div>
                           
                           {/* Name */}
                           <div className="font-semibold text-gray-900 text-lg">
                             {member.name}
                           </div>
                           
                           {/* Age */}
                           <div className="text-sm text-gray-600">
                             {ageData && ageData.display ? ageData.display : 'Age not set'}
                           </div>
                           
                           {/* Age Group Badge */}
                           <div 
                             className="px-3 py-1 rounded-full text-xs font-medium"
                             style={{ 
                               backgroundColor: ageGroupInfo.bgColor,
                               color: ageGroupInfo.color
                             }}
                           >
                             {ageGroupInfo.group}
                           </div>
                           
                           {/* Action Buttons */}
                           <div className="flex space-x-2 mt-3">
                             <button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 handleAddVitalFromDashboard(member);
                               }}
                               className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium"
                             >
                               Add Vital
                             </button>
                             <button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 handleUploadReportFromDashboard(member);
                               }}
                               className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium"
                             >
                               Add Report
                             </button>
                           </div>
                           
                           {/* Date of Birth */}
                           {member.date_of_birth && (
                             <div className="text-xs text-gray-500">
                               Born {formatDate(member.date_of_birth)}
                             </div>
                           )}
                         </div>
                       </div>
                     );
                   })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👨‍👩‍👧‍👦</div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            No family members yet
          </h3>
          <p className="text-gray-600 mb-6">
            Add your first family member to start building your family profile.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg font-medium"
          >
            Add Family Member
          </button>
        </div>
      )}

      {/* Add Vital Modal */}
      {showAddVitalModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-semibold mb-4">Add Health Vital for {selectedMember.name}</h2>
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
                  onClick={() => {
                    setShowAddVitalModal(false);
                    setSelectedMember(null);
                    setVitalFormData({
                      vitalType: '',
                      value: '',
                      unit: '',
                      notes: '',
                      recordedAt: new Date().toISOString().split('T')[0]
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

      {/* Upload Report Modal */}
      {showUploadReportModal && selectedMember && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">Upload Medical Report for {selectedMember.name}</h2>
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
                  onClick={() => {
                    setShowUploadReportModal(false);
                    setSelectedMember(null);
                    setReportFormData({
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
    </div>
  );
};

export default Dashboard;
