// Vital Type Icons - Simple text-based representations
export const HeightIcon = () => (
  <div className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-600">
    H
  </div>
);

export const WeightIcon = () => (
  <div className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-600">
    W
  </div>
);

export const BMIIcon = () => (
  <div className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-600">
    B
  </div>
);

export const CholesterolIcon = () => (
  <div className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-600">
    C
  </div>
);

export const HemoglobinIcon = () => (
  <div className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-600">
    Hb
  </div>
);

export const SGPTIcon = () => (
  <div className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-600">
    S
  </div>
);

export const SGOTIcon = () => (
  <div className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-600">
    S
  </div>
);

export const VitaminDIcon = () => (
  <div className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-600">
    D
  </div>
);

export const ThyroidIcon = () => (
  <div className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-600">
    T
  </div>
);

export const VitaminB12Icon = () => (
  <div className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-600">
    B12
  </div>
);

export const CalciumIcon = () => (
  <div className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-600">
    Ca
  </div>
);

export const HbA1cIcon = () => (
  <div className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-600">
    A1c
  </div>
);

export const UreaIcon = () => (
  <div className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-600">
    U
  </div>
);

export const BloodGlucoseIcon = () => (
  <div className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-600">
    BG
  </div>
);

export const CreatinineIcon = () => (
  <div className="w-6 h-6 flex items-center justify-center text-lg font-bold text-gray-600">
    Cr
  </div>
);

// Vital icon mapping
export const VITAL_ICONS = {
  height: HeightIcon,
  weight: WeightIcon,
  bmi: BMIIcon,
  cholesterol: CholesterolIcon,
  hemoglobin: HemoglobinIcon,
  sgpt: SGPTIcon,
  sgot: SGOTIcon,
  vitamin_d: VitaminDIcon,
  thyroid_tsh: ThyroidIcon,
  thyroid_t3: ThyroidIcon,
  thyroid_t4: ThyroidIcon,
  vitamin_b12: VitaminB12Icon,
  calcium: CalciumIcon,
  hba1c: HbA1cIcon,
  urea: UreaIcon,
  fasting_blood_glucose: BloodGlucoseIcon,
  creatinine: CreatinineIcon
};
