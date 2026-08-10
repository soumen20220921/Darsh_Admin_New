import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";
import {
  Stethoscope,
  User,
  GraduationCap,
  Briefcase,
  IndianRupee,
  FileText,
  Edit3,
  Trash2,
  Plus,
  Search,
  Filter,
  Users,
  Grid,
  List,
  Eye,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  BarChart3,
  Calendar,
  Clock,
  MoreVertical,
  ChevronDown,
} from "lucide-react";
import { useAppContext } from "../../context/Context";

const Doctor = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [formData, setFormData] = useState({
    name: "",
    specialization: "",
    qualification: "",
    experience: "",
    fees: "",
    description: "",
    image: null,
  });

  const [doctors, setDoctors] = useState([]);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialization, setFilterSpecialization] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [doctorsPerPage] = useState(6);
  const [selectedDoctors, setSelectedDoctors] = useState([]);
  const [filters, setFilters] = useState({
    experienceMin: "",
    experienceMax: "",
    feesMin: "",
    feesMax: "",
  });
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [errors, setErrors] = useState({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showSpecializationDropdown, setShowSpecializationDropdown] =
    useState(false);
    const {url} = useAppContext();

  const API = url;

  const specializationOptions = [
    {
      value: "cardiology",
      label: "Cardiology",
      emoji: "❤️",
      description: "Heart and cardiovascular system",
    },
    {
      value: "dermatology",
      label: "Dermatology",
      emoji: "🔬",
      description: "Skin, hair, and nails",
    },
    {
      value: "orthopedics",
      label: "Orthopedics",
      emoji: "🦴",
      description: "Bones and joints",
    },
    {
      value: "pediatrics",
      label: "Pediatrics",
      emoji: "👶",
      description: "Children's health",
    },
    {
      value: "dentistry",
      label: "Dentistry",
      emoji: "🦷",
      description: "Teeth and oral health",
    },
    {
      value: "neurology",
      label: "Neurology",
      emoji: "🧠",
      description: "Brain and nervous system",
    },
    {
      value: "surgery",
      label: "Surgery",
      emoji: "🔪",
      description: "Surgical procedures",
    },
    {
      value: "general medicine",
      label: "General Medicine",
      emoji: "👨‍⚕️",
      description: "General health issues",
    },
    {
      value: "gynecology",
      label: "Gynecology",
      emoji: "👩",
      description: "Women's reproductive health",
    },
    {
      value: "psychiatry",
      label: "Psychiatry",
      emoji: "🧠",
      description: "Mental health",
    },
    {
      value: "ophthalmology",
      label: "Ophthalmology",
      emoji: "👁️",
      description: "Eye care",
    },
    {
      value: "ent",
      label: "ENT",
      emoji: "👂",
      description: "Ear, nose, and throat",
    },
    {
      value: "endocrinology",
      label: "Endocrinology",
      emoji: "🦋",
      description: "Hormones and glands",
    },
    {
      value: "gastroenterology",
      label: "Gastroenterology",
      emoji: "🍽️",
      description: "Digestive system",
    },
    {
      value: "urology",
      label: "Urology",
      emoji: "💧",
      description: "Urinary system",
    },
    {
      value: "pulmonology",
      label: "Pulmonology",
      emoji: "🫁",
      description: "Respiratory system",
    },
    {
      value: "oncology",
      label: "Oncology",
      emoji: "🎗️",
      description: "Cancer treatment",
    },
    {
      value: "rheumatology",
      label: "Rheumatology",
      emoji: "🦵",
      description: "Joints and autoimmune diseases",
    },
    {
      value: "nephrology",
      label: "Nephrology",
      emoji: "🧂",
      description: "Kidney diseases",
    },
    {
      value: "hematology",
      label: "Hematology",
      emoji: "🩸",
      description: "Blood disorders",
    },
  ];

  useEffect(() => {
    const checkScreenSize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setViewMode("list");
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const specializations = [
    ...new Set(doctors.map((doctor) => doctor.specialization)),
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.specialization.trim())
      newErrors.specialization = "Specialization is required";
    if (formData.experience < 0)
      newErrors.experience = "Experience cannot be negative";
    if (formData.fees < 0) newErrors.fees = "Fees cannot be negative";
    if (!formData.qualification.trim())
      newErrors.qualification = "Qualification is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const filteredDoctors = doctors.filter((doctor) => {
    const matchesSearch =
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      !filterSpecialization || doctor.specialization === filterSpecialization;

    const exp = parseInt(doctor.experience);
    const fees = parseInt(doctor.fees);
    const matchesExperienceMin =
      !filters.experienceMin || exp >= parseInt(filters.experienceMin);
    const matchesExperienceMax =
      !filters.experienceMax || exp <= parseInt(filters.experienceMax);
    const matchesFeesMin =
      !filters.feesMin || fees >= parseInt(filters.feesMin);
    const matchesFeesMax =
      !filters.feesMax || fees <= parseInt(filters.feesMax);

    return (
      matchesSearch &&
      matchesFilter &&
      matchesExperienceMin &&
      matchesExperienceMax &&
      matchesFeesMin &&
      matchesFeesMax
    );
  });

  const sortedDoctors = [...filteredDoctors].sort((a, b) => {
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    if (sortConfig.key === "experience" || sortConfig.key === "fees") {
      aValue = parseInt(aValue);
      bValue = parseInt(bValue);
    }

    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const indexOfLastDoctor = currentPage * doctorsPerPage;
  const indexOfFirstDoctor = indexOfLastDoctor - doctorsPerPage;
  const currentDoctors = sortedDoctors.slice(
    indexOfFirstDoctor,
    indexOfLastDoctor
  );
  const totalPages = Math.ceil(sortedDoctors.length / doctorsPerPage);

  const doctorStats = {
    total: doctors.length,
    specializations: specializations.length,
    averageExperience:
      doctors.length > 0
        ? (
            doctors.reduce(
              (acc, doc) => acc + parseInt(doc.experience || 0),
              0
            ) / doctors.length
          ).toFixed(1)
        : 0,
    averageFees:
      doctors.length > 0
        ? (
            doctors.reduce((acc, doc) => acc + parseInt(doc.fees || 0), 0) /
            doctors.length
          ).toFixed(0)
        : 0,
  };

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(`${API}/api/doctor/all`);
      setDoctors(res.data.doctors);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      toast.error("Failed to fetch doctors");
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files.length > 0) {
      const file = files[0];
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [name]: value });
      if (errors[name]) {
        setErrors({ ...errors, [name]: "" });
      }
    }
  };

  const handleSpecializationSelect = (specialization) => {
    setFormData({ ...formData, specialization });
    setShowSpecializationDropdown(false);
    if (errors.specialization) {
      setErrors({ ...errors, specialization: "" });
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
    setCurrentPage(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setIsLoading(true);

    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          data.append(key, value);
        }
      });

      if (editingDoctor) {
        await axios.put(`${API}/api/doctor/${editingDoctor._id}`, formData);
        toast.success("Doctor updated successfully!");
      } else {
        await axios.post(`${API}/api/doctor/add`, data);
        toast.success("Doctor added successfully!");
      }

      resetForm();
      fetchDoctors();
      setActiveTab("list");
    } catch (err) {
      console.error("Error saving doctor:", err);
      toast.error(err.response?.data?.message || "Failed to save doctor");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      try {
        await axios.delete(`${API}/api/doctor/${id}`);
        toast.success("Doctor deleted successfully!");
        fetchDoctors();
        setSelectedDoctors(
          selectedDoctors.filter((doctorId) => doctorId !== id)
        );
      } catch (err) {
        console.error("Error deleting doctor:", err);
        toast.error("Failed to delete doctor");
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedDoctors.length === 0) {
      toast.error("Please select doctors to delete");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedDoctors.length} doctors?`
      )
    ) {
      try {
        await Promise.all(
          selectedDoctors.map((id) => axios.delete(`${API}/api/doctor/${id}`))
        );
        toast.success(
          `${selectedDoctors.length} doctors deleted successfully!`
        );
        setSelectedDoctors([]);
        fetchDoctors();
      } catch (err) {
        toast.error("Failed to delete some doctors");
      }
    }
  };

  const handleEdit = (doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      name: doctor.name || "",
      specialization: doctor.specialization || "",
      qualification: doctor.qualification || "",
      experience: doctor.experience || "",
      fees: doctor.fees || "",
      description: doctor.description || "",
      image: null,
    });
    setImagePreview(
      doctor.image
        ? `${url}/uploads/${doctor.image.filename}`
        : null
    );
    setActiveTab("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      specialization: "",
      qualification: "",
      experience: "",
      fees: "",
      description: "",
      image: null,
    });
    setEditingDoctor(null);
    setImagePreview(null);
    setErrors({});
    setShowSpecializationDropdown(false);
  };

  const handleCancel = () => {
    resetForm();
    setActiveTab("list");
  };

  const handleSelectAll = () => {
    if (selectedDoctors.length === currentDoctors.length) {
      setSelectedDoctors([]);
    } else {
      setSelectedDoctors(currentDoctors.map((doctor) => doctor._id));
    }
  };

  const handleSelectDoctor = (id) => {
    if (selectedDoctors.includes(id)) {
      setSelectedDoctors(selectedDoctors.filter((doctorId) => doctorId !== id));
    } else {
      setSelectedDoctors([...selectedDoctors, id]);
    }
  };

  const exportDoctors = () => {
    const doctorsToExport =
      selectedDoctors.length > 0
        ? doctors.filter((doctor) => selectedDoctors.includes(doctor._id))
        : doctors;

    const csvHeaders = [
      "Name",
      "Specialization",
      "Qualification",
      "Experience",
      "Fees",
      "Description",
    ];
    const csvData = doctorsToExport.map((doctor) => [
      doctor.name,
      doctor.specialization,
      doctor.qualification,
      doctor.experience,
      doctor.fees,
      doctor.description || "",
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `doctors-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success(`Exported ${doctorsToExport.length} doctors successfully!`);
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction:
        sortConfig.key === key && sortConfig.direction === "asc"
          ? "desc"
          : "asc",
    });
  };

  const resetFilters = () => {
    setSearchTerm("");
    setFilterSpecialization("");
    setFilters({
      experienceMin: "",
      experienceMax: "",
      feesMin: "",
      feesMax: "",
    });
    setCurrentPage(1);
  };

  const getSpecializationEmoji = (spec) => {
    const found = specializationOptions.find((opt) => opt.value === spec);
    return found ? found.emoji : "👨‍⚕️";
  };

  return (
    <div className=" ">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#363636",
            color: "#fff",
          },
        }}
      />

      <div className="max-w-7xl mx-auto">
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 bg-gradient-to-r from-indigo-600 to-pink-500 text-transparent bg-clip-text">
                Doctor Management
              </h1>
              <p className="text-gray-600 mt-1 lg:mt-2 text-sm lg:text-base">
                Manage healthcare professionals in your system
              </p>
            </div>

            {activeTab === "list" && (
              <div className="flex flex-col sm:flex-row gap-3">
                {selectedDoctors.length > 0 && (
                  <>
                    <button
                      onClick={handleBulkDelete}
                      className="flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Delete</span> (
                      {selectedDoctors.length})
                    </button>
                    <button
                      onClick={exportDoctors}
                      className="flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Export</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => setActiveTab("form")}
                  className="flex items-center gap-2 px-4 py-2 lg:px-6 lg:py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:shadow-md transition-all shadow-sm text-sm lg:text-base"
                >
                  <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
                  Add Doctor
                </button>
              </div>
            )}
          </div>
        </div>

        {activeTab === "form" ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl lg:rounded-2xl shadow-md border border-gray-100">
                <div className="p-4 lg:p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg lg:text-xl font-semibold text-gray-800">
                      {editingDoctor ? "Edit Doctor" : "Add New Doctor"}
                    </h2>
                    <button
                      onClick={handleCancel}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <form className="p-4 lg:p-6 space-y-6" onSubmit={handleSubmit}>
                  <div>
                    <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-3 lg:mb-4">
                      Profile Image
                    </h3>
                    <div className="flex flex-col sm:flex-row items-center gap-4 lg:gap-6">
                      <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 flex-shrink-0">
                        {imagePreview ? (
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-8 h-8 lg:w-12 lg:h-12 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1 w-full">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Upload Image
                        </label>
                        <input
                          type="file"
                          name="image"
                          accept="image/*"
                          onChange={handleChange}
                          className="block w-full text-sm text-gray-500 file:mr-2 file:py-2 file:px-3 lg:file:mr-4 lg:file:py-2 lg:file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                        <p className="text-xs text-gray-500 mt-2">
                          Recommended: Square image, 500x500px, max 2MB
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 lg:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.name ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="John Doe"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specialization *
                      </label>
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setShowSpecializationDropdown(
                              !showSpecializationDropdown
                            )
                          }
                          className={`w-full px-3 py-2 lg:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 text-left flex items-center justify-between ${
                            errors.specialization
                              ? "border-red-300"
                              : "border-gray-300"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {formData.specialization ? (
                              <>
                                <span className="text-lg">
                                  {getSpecializationEmoji(
                                    formData.specialization
                                  )}
                                </span>
                                <span>
                                  {specializationOptions.find(
                                    (opt) =>
                                      opt.value === formData.specialization
                                  )?.label || formData.specialization}
                                </span>
                              </>
                            ) : (
                              <span className="text-gray-500">
                                Select a specialization
                              </span>
                            )}
                          </div>
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>

                        {showSpecializationDropdown && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            <div className="p-2 space-y-1">
                              {specializationOptions.map((option) => (
                                <button
                                  key={option.value}
                                  type="button"
                                  onClick={() =>
                                    handleSpecializationSelect(option.value)
                                  }
                                  className="w-full px-3 py-2 text-left hover:bg-blue-50 rounded-md flex items-center gap-3 transition-colors"
                                >
                                  <span className="text-lg">
                                    {option.emoji}
                                  </span>
                                  <div className="flex-1">
                                    <div className="font-medium text-gray-900">
                                      {option.label}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {option.description}
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      {errors.specialization && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.specialization}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Qualification *
                      </label>
                      <input
                        type="text"
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 lg:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.qualification
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        placeholder="MBBS, MD"
                      />
                      {errors.qualification && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.qualification}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Experience (Years) *
                      </label>
                      <input
                        type="number"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 lg:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.experience
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        placeholder="10"
                        min="0"
                      />
                      {errors.experience && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.experience}
                        </p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Consultation Fees (₹) *
                      </label>
                      <input
                        type="number"
                        name="fees"
                        value={formData.fees}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 lg:py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 ${
                          errors.fees ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="500"
                        min="0"
                      />
                      {errors.fees && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.fees}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Brief description about the doctor's expertise, achievements, or special skills..."
                    />
                  </div>

                  <div className="flex flex-col sm:flex-row justify-end gap-3 lg:gap-4 pt-4 lg:pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-6 py-2 lg:px-8 lg:py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="flex items-center gap-2 px-6 py-2 lg:px-8 lg:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {isLoading
                        ? "Saving..."
                        : editingDoctor
                        ? "Update Doctor"
                        : "Add Doctor"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="space-y-4 lg:space-y-6">
              <div className="bg-white rounded-xl lg:rounded-2xl shadow-md border border-gray-100 p-4 lg:p-6">
                <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-3 lg:mb-4">
                  Doctor Preview
                </h3>
                <div className="border rounded-lg lg:rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 lg:p-6 text-center">
                    <div className="w-16 h-16 lg:w-24 lg:h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4 overflow-hidden border-4 border-white shadow-md">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Doctor"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 lg:w-12 lg:h-12 text-blue-600" />
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {formData.name || "Doctor Name"}
                    </h4>
                    <p className="text-blue-600 font-medium mb-2 flex items-center justify-center gap-2">
                      <span className="text-lg">
                        {formData.specialization
                          ? getSpecializationEmoji(formData.specialization)
                          : "👨‍⚕️"}
                      </span>
                      {formData.specialization || "Specialization"}
                    </p>
                    <p className="text-gray-500 text-sm mb-3">
                      {formData.qualification || "Qualification"}
                    </p>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>{formData.experience || "0"} yrs exp</span>
                      <span className="font-semibold">
                        ₹{formData.fees || "0"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl lg:rounded-2xl shadow-md border border-gray-100 p-4 lg:p-6">
                <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-3 lg:mb-4">
                  Quick Tips
                </h3>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs">💡</span>
                    </div>
                    <p>Choose a clear, professional profile photo</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs">💡</span>
                    </div>
                    <p>
                      Select the most relevant specialization for better patient
                      matching
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs">💡</span>
                    </div>
                    <p>
                      Include all relevant qualifications and certifications
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 lg:space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-6">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-3 lg:p-6">
                <div className="flex items-center gap-2 lg:gap-4">
                  <div className="p-2 lg:p-3 bg-blue-100 rounded-lg lg:rounded-xl">
                    <Users className="w-4 h-4 lg:w-6 lg:h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-lg lg:text-2xl font-bold text-gray-900">
                      {doctorStats.total}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-600">
                      Total Doctors
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-3 lg:p-6">
                <div className="flex items-center gap-2 lg:gap-4">
                  <div className="p-2 lg:p-3 bg-green-100 rounded-lg lg:rounded-xl">
                    <Stethoscope className="w-4 h-4 lg:w-6 lg:h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-lg lg:text-2xl font-bold text-gray-900">
                      {doctorStats.specializations}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-600">
                      Specializations
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-3 lg:p-6">
                <div className="flex items-center gap-2 lg:gap-4">
                  <div className="p-2 lg:p-3 bg-purple-100 rounded-lg lg:rounded-xl">
                    <BarChart3 className="w-4 h-4 lg:w-6 lg:h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-lg lg:text-2xl font-bold text-gray-900">
                      {doctorStats.averageExperience}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-600">
                      Avg. Experience
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-3 lg:p-6">
                <div className="flex items-center gap-2 lg:gap-4">
                  <div className="p-2 lg:p-3 bg-orange-100 rounded-lg lg:rounded-xl">
                    <IndianRupee className="w-4 h-4 lg:w-6 lg:h-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-lg lg:text-2xl font-bold text-gray-900">
                      ₹{doctorStats.averageFees}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-600">
                      Avg. Fees
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl lg:rounded-2xl shadow-md border border-gray-100 p-4 lg:p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
                    <input
                      type="text"
                      placeholder="Search doctors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div className="relative w-full sm:w-48">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
                    <select
                      value={filterSpecialization}
                      onChange={(e) => setFilterSpecialization(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="">All Specializations</option>
                      {specializationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.emoji} {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {!isMobile && (
                    <div className="flex items-center gap-2 border border-gray-300 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded transition-colors ${
                          viewMode === "grid"
                            ? "bg-blue-100 text-blue-600"
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded transition-colors ${
                          viewMode === "list"
                            ? "bg-blue-100 text-blue-600"
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <Filter className="w-4 h-4" />
                    Filters
                  </button>

                  <button
                    onClick={exportDoctors}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>

              {showAdvancedFilters && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Min Experience
                      </label>
                      <input
                        type="number"
                        name="experienceMin"
                        value={filters.experienceMin}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Experience
                      </label>
                      <input
                        type="number"
                        name="experienceMax"
                        value={filters.experienceMax}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="50"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Min Fees
                      </label>
                      <input
                        type="number"
                        name="feesMin"
                        value={filters.feesMin}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Fees
                      </label>
                      <input
                        type="number"
                        name="feesMax"
                        value={filters.feesMax}
                        onChange={handleFilterChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="10000"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end mt-4">
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Reset Filters
                    </button>
                  </div>
                </div>
              )}
            </div>

            {currentDoctors.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-100">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No doctors found
                </h3>
                <p className="text-gray-600 mb-4">
                  {doctors.length === 0
                    ? "Get started by adding your first doctor."
                    : "Try adjusting your search criteria."}
                </p>
                {doctors.length === 0 && (
                  <button
                    onClick={() => setActiveTab("form")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add First Doctor
                  </button>
                )}
              </div>
            ) : viewMode === "grid" && !isMobile ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {currentDoctors.map((doctor) => (
                  <DoctorGridCard
                  url ={url}
                    key={doctor._id}
                    doctor={doctor}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isSelected={selectedDoctors.includes(doctor._id)}
                    onSelect={() => handleSelectDoctor(doctor._id)}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3 lg:space-y-4">
                {currentDoctors.map((doctor) => (
                  <DoctorListCard
                    key={doctor._id}
                    doctor={doctor}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isSelected={selectedDoctors.includes(doctor._id)}
                    onSelect={() => handleSelectDoctor(doctor._id)}
                    isMobile={isMobile}
                    url={url}
                  />
                ))}
              </div>
            )}

            {currentDoctors.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl shadow-md border border-gray-100 p-4 lg:p-6">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstDoctor + 1} to{" "}
                  {Math.min(indexOfLastDoctor, sortedDoctors.length)} of{" "}
                  {sortedDoctors.length} doctors
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(
                      (page) =>
                        page === 1 ||
                        page === totalPages ||
                        Math.abs(page - currentPage) <= 1
                    )
                    .map((page, index, array) => {
                      const showEllipsis =
                        index > 0 && page - array[index - 1] > 1;
                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-1 rounded-lg transition-colors ${
                              currentPage === page
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}

                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const DoctorGridCard = ({ doctor, onEdit, onDelete, isSelected, onSelect,url }) => {
  const getSpecializationEmoji = (spec) => {
    const emojiMap = {
      cardiology: "❤️",
      dermatology: "🔬",
      orthopedics: "🦴",
      pediatrics: "👶",
      dentistry: "🦷",
      neurology: "🧠",
      surgery: "🔪",
      "general medicine": "👨‍⚕️",
      gynecology: "👩",
      psychiatry: "🧠",
      ophthalmology: "👁️",
      ent: "👂",
      endocrinology: "🦋",
      gastroenterology: "🍽️",
      urology: "💧",
      pulmonology: "🫁",
      oncology: "🎗️",
      rheumatology: "🦵",
      nephrology: "🧂",
      hematology: "🩸",
    };
    return emojiMap[spec] || "👨‍⚕️";
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="relative">
        <img
          src={
            doctor.image
              ? `${url}/img/${doctor.image._id}`
              : "https://static.vecteezy.com/system/resources/previews/028/782/024/large_2x/doctor-cartoon-character-ai-generate-free-photo.jpg"
          }
          alt={doctor.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={() => onSelect()}
            className="p-2 bg-white rounded-full shadow-lg hover:bg-blue-50 transition-colors"
          >
            {isSelected ? (
              <CheckSquare className="w-4 h-4 text-blue-600" />
            ) : (
              <Square className="w-4 h-4 text-gray-400" />
            )}
          </button>
          
          {/* <button
            onClick={() => onEdit(doctor)}
            className="p-2 bg-white rounded-full shadow-lg hover:bg-blue-50 transition-colors"
          >
            <Edit3 className="w-4 h-4 text-blue-600" />
          </button> */}
          <button
            onClick={() => onDelete(doctor._id)}
            className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-lg mb-2">
          Dr. {doctor.name}
        </h3>
        <p className="text-blue-600 font-medium mb-3 flex items-center gap-2">
          <span className="text-lg">
            {getSpecializationEmoji(doctor.specialization)}
          </span>
          {doctor.specialization}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <GraduationCap className="w-4 h-4" />
            <span>{doctor.qualification}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Briefcase className="w-4 h-4" />
            <span>{doctor.experience} years experience</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <IndianRupee className="w-4 h-4" />
            <span className="font-semibold">
              ₹{doctor.fees} consultation fee
            </span>
          </div>
        </div>

        {doctor.description && (
          <p className="text-sm text-gray-500 line-clamp-2">
            {doctor.description}
          </p>
        )}
      </div>
    </div>
  );
};

const DoctorListCard = ({
  doctor,
  onEdit,
  onDelete,
  isSelected,
  onSelect,
  isMobile,
  url
}) => {
  const getSpecializationEmoji = (spec) => {
    const emojiMap = {
      cardiology: "❤️",
      dermatology: "🔬",
      orthopedics: "🦴",
      pediatrics: "👶",
      dentistry: "🦷",
      neurology: "🧠",
      surgery: "🔪",
      "general medicine": "👨‍⚕️",
      gynecology: "👩",
      psychiatry: "🧠",
      ophthalmology: "👁️",
      ent: "👂",
      endocrinology: "🦋",
      gastroenterology: "🍽️",
      urology: "💧",
      pulmonology: "🫁",
      oncology: "🎗️",
      rheumatology: "🦵",
      nephrology: "🧂",
      hematology: "🩸",
    };
    return emojiMap[spec] || "👨‍⚕️";
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="p-4 lg:p-6">
        <div className="flex-wrap items-start gap-4">
          <button onClick={onSelect} className="mt-1 flex-shrink-0">
            {isSelected ? (
              <CheckSquare className="w-5 h-5 text-blue-600" />
            ) : (
              <Square className="w-5 h-5 text-gray-400" />
            )}
          </button>

          <div className="flex-shrink-0">
            <img
              src={
            doctor.image
              ? `${url}/img/${doctor.image._id}`
              : "https://static.vecteezy.com/system/resources/previews/028/782/024/large_2x/doctor-cartoon-character-ai-generate-free-photo.jpg"
          }
              alt={doctor.name}
              className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl object-cover border-2 border-gray-100"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 text-lg mb-1">
                  Dr. {doctor.name}
                </h3>
                <p className="text-blue-600 font-medium mb-2 flex items-center gap-2">
                  <span className="text-lg">
                    {getSpecializationEmoji(doctor.specialization)}
                  </span>
                  {doctor.specialization}
                </p>
                <p className="text-gray-500 text-sm mb-3">
                  {doctor.qualification}
                </p>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => onEdit(doctor)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(doctor._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 lg:gap-6 mt-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Briefcase className="w-4 h-4" />
                <span>{doctor.experience} years</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <IndianRupee className="w-4 h-4" />
                <span>₹{doctor.fees}</span>
              </div>
            </div>

            {doctor.description && (
              <p className="text-gray-500 text-sm mt-3 line-clamp-2">
                {doctor.description}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Doctor;
