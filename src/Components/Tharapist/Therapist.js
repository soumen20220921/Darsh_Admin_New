import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import {
  User,
  Star,
  Clock,
  Users,
  IndianRupee,
  Award,
  Calendar,
  Edit3,
  Trash2,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Download,
  ChevronLeft,
  ChevronRight,
  CheckSquare,
  Square,
  BarChart3,
  MoreVertical,
  ChevronDown,
  X,
  Shield,
  MessageCircle,
} from "lucide-react";

const API = "http://localhost:8001/api/therapist";

const Therapist = () => {
  const [activeTab, setActiveTab] = useState("list");
  const [formData, setFormData] = useState({
    name: "",
    experience: "",
    rating: "",
    clientsServed: "",
    specialties: "",
    responseTime: "",
    fee: "",
    certification: "",
    badge: "",
    morningSlot: "",
    eveningSlot: "",
    image: null,
  });

  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [therapistsPerPage] = useState(6);
  const [selectedTherapists, setSelectedTherapists] = useState([]);
  const [filters, setFilters] = useState({
    experienceMin: "",
    experienceMax: "",
    feeMin: "",
    feeMax: "",
    ratingMin: "",
  });
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "asc",
  });
  const [errors, setErrors] = useState({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [editingTherapist, setEditingTherapist] = useState(null);

  const badgeOptions = [
    { value: "Popular", label: "Popular", color: "bg-orange-100 text-orange-800" },
    { value: "Top Rated", label: "Top Rated", color: "bg-yellow-100 text-yellow-800" },
    { value: "Expert", label: "Expert", color: "bg-purple-100 text-purple-800" },
    { value: "New", label: "New", color: "bg-green-100 text-green-800" },
    { value: "Senior", label: "Senior", color: "bg-blue-100 text-blue-800" },
  ];

  const specialtyOptions = [
    "Anxiety",
    "Depression",
    "Relationship Issues",
    "Trauma",
    "Stress Management",
    "Addiction",
    "Child Therapy",
    "Family Therapy",
    "Couples Counseling",
    "Career Counseling",
    "Eating Disorders",
    "OCD",
    "PTSD",
    "Grief Counseling",
    "Mindfulness"
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

  const specialties = [
    ...new Set(therapists.flatMap(t => t.specialties || [])),
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.experience.trim()) newErrors.experience = "Experience is required";
    if (formData.fee < 0) newErrors.fee = "Fee cannot be negative";
    if (formData.rating && (formData.rating < 0 || formData.rating > 5)) 
      newErrors.rating = "Rating must be between 0 and 5";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const filteredTherapists = therapists.filter((therapist) => {
    const matchesSearch =
      therapist.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      therapist.specialties?.some(spec => 
        spec.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesFilter =
      !filterSpecialty || 
      therapist.specialties?.includes(filterSpecialty);

    const exp = parseInt(therapist.experience) || 0;
    const fee = parseInt(therapist.fee) || 0;
    const rating = parseFloat(therapist.rating) || 0;

    const matchesExperienceMin =
      !filters.experienceMin || exp >= parseInt(filters.experienceMin);
    const matchesExperienceMax =
      !filters.experienceMax || exp <= parseInt(filters.experienceMax);
    const matchesFeeMin = !filters.feeMin || fee >= parseInt(filters.feeMin);
    const matchesFeeMax = !filters.feeMax || fee <= parseInt(filters.feeMax);
    const matchesRatingMin = !filters.ratingMin || rating >= parseInt(filters.ratingMin);

    return (
      matchesSearch &&
      matchesFilter &&
      matchesExperienceMin &&
      matchesExperienceMax &&
      matchesFeeMin &&
      matchesFeeMax &&
      matchesRatingMin
    );
  });

  const sortedTherapists = [...filteredTherapists].sort((a, b) => {
    let aValue = a[sortConfig.key];
    let bValue = b[sortConfig.key];

    if (sortConfig.key === "experience" || sortConfig.key === "fee" || sortConfig.key === "clientsServed") {
      aValue = parseInt(aValue) || 0;
      bValue = parseInt(bValue) || 0;
    }
    if (sortConfig.key === "rating") {
      aValue = parseFloat(aValue) || 0;
      bValue = parseFloat(bValue) || 0;
    }

    if (aValue < bValue) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  const indexOfLastTherapist = currentPage * therapistsPerPage;
  const indexOfFirstTherapist = indexOfLastTherapist - therapistsPerPage;
  const currentTherapists = sortedTherapists.slice(
    indexOfFirstTherapist,
    indexOfLastTherapist
  );
  const totalPages = Math.ceil(sortedTherapists.length / therapistsPerPage);

  const therapistStats = {
    total: therapists.length,
    specialties: specialties.length,
    averageExperience:
      therapists.length > 0
        ? (
            therapists.reduce(
              (acc, therapist) => acc + parseInt(therapist.experience || 0),
              0
            ) / therapists.length
          ).toFixed(1)
        : 0,
    averageFee:
      therapists.length > 0
        ? (
            therapists.reduce((acc, therapist) => acc + parseInt(therapist.fee || 0), 0) /
            therapists.length
          ).toFixed(0)
        : 0,
    totalClients: therapists.reduce((acc, therapist) => acc + parseInt(therapist.clientsServed || 0), 0),
  };

  const fetchTherapists = async () => {
    try {
      const res = await axios.get(`${API}/all`);
      setTherapists(res.data.therapists || []);
    } catch (error) {
      console.error("Error fetching therapists:", error);
      toast.error("Failed to fetch therapists");
    }
  };

  useEffect(() => {
    fetchTherapists();
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image" && files && files.length > 0) {
      const file = files[0];
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    } else if (name === "specialties") {
      setFormData({ ...formData, [name]: value });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (errors[name]) {
      setErrors({ ...errors, [name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors before submitting");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined) {
          data.append(key, formData[key]);
        }
      });

      if (editingTherapist) {
        await axios.put(`${API}/${editingTherapist._id}`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Therapist updated successfully!");
      } else {
        await axios.post(`${API}/add`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Therapist added successfully!");
      }

      resetForm();
      fetchTherapists();
      setActiveTab("list");
    } catch (error) {
      console.error("Error saving therapist:", error);
      toast.error("Failed to save therapist");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this therapist?")) return;

    try {
      await axios.delete(`${API}/${id}`);
      toast.success("Therapist deleted successfully!");
      fetchTherapists();
      setSelectedTherapists(selectedTherapists.filter(therapistId => therapistId !== id));
    } catch (error) {
      console.error("Error deleting therapist:", error);
      toast.error("Failed to delete therapist");
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTherapists.length === 0) {
      toast.error("Please select therapists to delete");
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedTherapists.length} therapists?`)) {
      try {
        await Promise.all(
          selectedTherapists.map((id) => axios.delete(`${API}/${id}`))
        );
        toast.success(`${selectedTherapists.length} therapists deleted successfully!`);
        setSelectedTherapists([]);
        fetchTherapists();
      } catch (error) {
        toast.error("Failed to delete some therapists");
      }
    }
  };

  const handleEdit = (therapist) => {
    setEditingTherapist(therapist);
    setFormData({
      name: therapist.name || "",
      experience: therapist.experience || "",
      rating: therapist.rating || "",
      clientsServed: therapist.clientsServed || "",
      specialties: therapist.specialties?.join(", ") || "",
      responseTime: therapist.responseTime || "",
      fee: therapist.fee || "",
      certification: therapist.certification || "",
      badge: therapist.badge || "",
      morningSlot: therapist.morningSlot || "",
      eveningSlot: therapist.eveningSlot || "",
      image: null,
    });
    setImagePreview(
      therapist.image
        ? `${API}/img/${therapist.image._id}`
        : null
    );
    setActiveTab("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const resetForm = () => {
    setFormData({
      name: "",
      experience: "",
      rating: "",
      clientsServed: "",
      specialties: "",
      responseTime: "",
      fee: "",
      certification: "",
      badge: "",
      morningSlot: "",
      eveningSlot: "",
      image: null,
    });
    setEditingTherapist(null);
    setImagePreview(null);
    setErrors({});
  };

  const handleCancel = () => {
    resetForm();
    setActiveTab("list");
  };

  const handleSelectAll = () => {
    if (selectedTherapists.length === currentTherapists.length) {
      setSelectedTherapists([]);
    } else {
      setSelectedTherapists(currentTherapists.map((therapist) => therapist._id));
    }
  };

  const handleSelectTherapist = (id) => {
    if (selectedTherapists.includes(id)) {
      setSelectedTherapists(selectedTherapists.filter((therapistId) => therapistId !== id));
    } else {
      setSelectedTherapists([...selectedTherapists, id]);
    }
  };

  const exportTherapists = () => {
    const therapistsToExport =
      selectedTherapists.length > 0
        ? therapists.filter((therapist) => selectedTherapists.includes(therapist._id))
        : therapists;

    const csvHeaders = [
      "Name",
      "Experience",
      "Rating",
      "Clients Served",
      "Specialties",
      "Response Time",
      "Fee",
      "Certification",
      "Badge",
    ];
    const csvData = therapistsToExport.map((therapist) => [
      therapist.name,
      therapist.experience,
      therapist.rating,
      therapist.clientsServed,
      therapist.specialties?.join(", "),
      therapist.responseTime,
      therapist.fee,
      therapist.certification,
      therapist.badge,
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `therapists-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success(`Exported ${therapistsToExport.length} therapists successfully!`);
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
    setFilterSpecialty("");
    setFilters({
      experienceMin: "",
      experienceMax: "",
      feeMin: "",
      feeMax: "",
      ratingMin: "",
    });
    setCurrentPage(1);
  };

  const getBadgeColor = (badge) => {
    const found = badgeOptions.find((opt) => opt.value === badge);
    return found ? found.color : "bg-gray-100 text-gray-800";
  };

  return (
  
    <div className="min-h-screen bg-gray-50">
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
<img/>
      <div className="">
        <div className="mb-6 lg:mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">
                Therapist Management
              </h1>
              <p className="text-gray-600 mt-1 lg:mt-2 text-sm lg:text-base">
                Manage mental health professionals in your system
              </p>
            </div>

            {activeTab === "list" && (
              <div className="flex flex-col sm:flex-row gap-3">
                {selectedTherapists.length > 0 && (
                  <>
                    <button
                      onClick={handleBulkDelete}
                      className="flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Delete</span> (
                      {selectedTherapists.length})
                    </button>
                    <button
                      onClick={exportTherapists}
                      className="flex items-center gap-2 px-3 py-2 lg:px-4 lg:py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      <span className="hidden sm:inline">Export</span>
                    </button>
                  </>
                )}
                <button
                  onClick={() => setActiveTab("form")}
                  className="flex items-center gap-2 px-4 py-2 lg:px-6 lg:py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg hover:shadow-md transition-all shadow-sm text-sm lg:text-base"
                >
                  <Plus className="w-4 h-4 lg:w-5 lg:h-5" />
                  Add Therapist
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
                      {editingTherapist
                        ? "Edit Therapist"
                        : "Add New Therapist"}
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
                          className="block w-full text-sm text-gray-500 file:mr-2 file:py-2 file:px-3 lg:file:mr-4 lg:file:py-2 lg:file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
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
                        className={`w-full px-3 py-2 lg:py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                          errors.name ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="Dr. Sarah Johnson"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Experience *
                      </label>
                      <input
                        type="text"
                        name="experience"
                        value={formData.experience}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 lg:py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                          errors.experience
                            ? "border-red-300"
                            : "border-gray-300"
                        }`}
                        placeholder="5 years"
                      />
                      {errors.experience && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.experience}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating (0-5)
                      </label>
                      <input
                        type="number"
                        name="rating"
                        value={formData.rating}
                        onChange={handleChange}
                        step="0.1"
                        min="0"
                        max="5"
                        className={`w-full px-3 py-2 lg:py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                          errors.rating ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="4.8 (out of 5)"
                      />
                      {errors.rating && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.rating}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Clients Served
                      </label>
                      <input
                        type="number"
                        name="clientsServed"
                        value={formData.clientsServed}
                        onChange={handleChange}
                        className="w-full px-3 py-2 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="250"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specialties (comma separated)
                      </label>
                      <input
                        type="text"
                        name="specialties"
                        value={formData.specialties}
                        onChange={handleChange}
                        className="w-full px-3 py-2 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Anxiety, Depression, Relationship Issues"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Response Time
                      </label>
                      <input
                        type="text"
                        name="responseTime"
                        value={formData.responseTime}
                        onChange={handleChange}
                        className="w-full px-3 py-2 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="15 mins"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Fee (₹) *
                      </label>
                      <input
                        type="number"
                        name="fee"
                        value={formData.fee}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 lg:py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 ${
                          errors.fee ? "border-red-300" : "border-gray-300"
                        }`}
                        placeholder="1500"
                        min="0"
                      />
                      {errors.fee && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.fee}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Certification
                      </label>
                      <input
                        type="text"
                        name="certification"
                        value={formData.certification}
                        onChange={handleChange}
                        className="w-full px-3 py-2 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Licensed Clinical Psychologist"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Badge
                      </label>
                      <select
                        name="badge"
                        value={formData.badge}
                        onChange={handleChange}
                        className="w-full px-3 py-2 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="">Select Badge</option>
                        {badgeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Morning Slots
                      </label>
                      <input
                        type="number"
                        name="morningSlot"
                        value={formData.morningSlot}
                        onChange={handleChange}
                        className="w-full px-3 py-2 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="5"
                        min="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Evening Slots
                      </label>
                      <input
                        type="number"
                        name="eveningSlot"
                        value={formData.eveningSlot}
                        onChange={handleChange}
                        className="w-full px-3 py-2 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="3"
                        min="0"
                      />
                    </div>
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
                      disabled={loading}
                      className="flex items-center gap-2 px-6 py-2 lg:px-8 lg:py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                    >
                      {loading
                        ? "Saving..."
                        : editingTherapist
                        ? "Update Therapist"
                        : "Add Therapist"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            <div className="space-y-4 lg:space-y-6">
              <div className="bg-white rounded-xl lg:rounded-2xl shadow-md border border-gray-100 p-4 lg:p-6">
                <h3 className="text-base lg:text-lg font-semibold text-gray-800 mb-3 lg:mb-4">
                  Therapist Preview
                </h3>
                <div className="border rounded-lg lg:rounded-xl overflow-hidden shadow-sm">
                  <div className="p-4 lg:p-6 text-center">
                    <div className="w-16 h-16 lg:w-24 lg:h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 lg:mb-4 overflow-hidden border-4 border-white shadow-md">
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Therapist"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 lg:w-12 lg:h-12 text-purple-600" />
                      )}
                    </div>
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {formData.name || "Therapist Name"}
                    </h4>
                    {formData.badge && (
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium mb-2 ${getBadgeColor(
                          formData.badge
                        )}`}
                      >
                        {formData.badge}
                      </span>
                    )}
                    <p className="text-gray-500 text-sm mb-3">
                      {formData.experience || "Experience"} •{" "}
                      {formData.certification || "Certification"}
                    </p>
                    <div className="flex justify-between text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        {formData.rating
                          ? `${formData.rating} out of 5`
                          : "0 out of 5"}
                      </span>
                      <span className="font-semibold">
                        ₹{formData.fee || "0"}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      {formData.specialties || "Specialties not specified"}
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
                    <div className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs">💡</span>
                    </div>
                    <p>Choose a warm, professional profile photo</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs">💡</span>
                    </div>
                    <p>List relevant specialties for better client matching</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs">💡</span>
                    </div>
                    <p>Include all certifications and qualifications</p>
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
                  <div className="p-2 lg:p-3 bg-purple-100 rounded-lg lg:rounded-xl">
                    <Users className="w-4 h-4 lg:w-6 lg:h-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-lg lg:text-2xl font-bold text-gray-900">
                      {therapistStats.total}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-600">
                      Total Therapists
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-3 lg:p-6">
                <div className="flex items-center gap-2 lg:gap-4">
                  <div className="p-2 lg:p-3 bg-pink-100 rounded-lg lg:rounded-xl">
                    <Award className="w-4 h-4 lg:w-6 lg:h-6 text-pink-600" />
                  </div>
                  <div>
                    <div className="text-lg lg:text-2xl font-bold text-gray-900">
                      {therapistStats.specialties}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-600">
                      Specialties
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-3 lg:p-6">
                <div className="flex items-center gap-2 lg:gap-4">
                  <div className="p-2 lg:p-3 bg-blue-100 rounded-lg lg:rounded-xl">
                    <BarChart3 className="w-4 h-4 lg:w-6 lg:h-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-lg lg:text-2xl font-bold text-gray-900">
                      {therapistStats.averageExperience}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-600">
                      Avg. Experience
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md border border-gray-100 p-3 lg:p-6">
                <div className="flex items-center gap-2 lg:gap-4">
                  <div className="p-2 lg:p-3 bg-green-100 rounded-lg lg:rounded-xl">
                    <IndianRupee className="w-4 h-4 lg:w-6 lg:h-6 text-green-600" />
                  </div>
                  <div>
                    <div className="text-lg lg:text-2xl font-bold text-gray-900">
                      ₹{therapistStats.averageFee}
                    </div>
                    <div className="text-xs lg:text-sm text-gray-600">
                      Avg. Fee
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
                      placeholder="Search therapists..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors"
                    />
                  </div>

                  <div className="relative w-full sm:w-48">
                    <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 lg:w-5 lg:h-5" />
                    <select
                      value={filterSpecialty}
                      onChange={(e) => setFilterSpecialty(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 lg:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none bg-white"
                    >
                      <option value="">All Specialties</option>
                      {specialtyOptions.map((specialty) => (
                        <option key={specialty} value={specialty}>
                          {specialty}
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
                            ? "bg-purple-100 text-purple-600"
                            : "text-gray-400 hover:text-gray-600"
                        }`}
                      >
                        <Grid className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded transition-colors ${
                          viewMode === "list"
                            ? "bg-purple-100 text-purple-600"
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
                    onClick={exportTherapists}
                    className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                  >
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>

              {showAdvancedFilters && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Min Experience
                      </label>
                      <input
                        type="number"
                        name="experienceMin"
                        value={filters.experienceMin}
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            experienceMin: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
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
                        onChange={(e) =>
                          setFilters({
                            ...filters,
                            experienceMax: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="50"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Min Fee
                      </label>
                      <input
                        type="number"
                        name="feeMin"
                        value={filters.feeMin}
                        onChange={(e) =>
                          setFilters({ ...filters, feeMin: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="0"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Max Fee
                      </label>
                      <input
                        type="number"
                        name="feeMax"
                        value={filters.feeMax}
                        onChange={(e) =>
                          setFilters({ ...filters, feeMax: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="10000"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Min Rating
                      </label>
                      <input
                        type="number"
                        name="ratingMin"
                        value={filters.ratingMin}
                        onChange={(e) =>
                          setFilters({ ...filters, ratingMin: e.target.value })
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="0"
                        min="0"
                        max="5"
                        step="0.1"
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

            {currentTherapists.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-md border border-gray-100">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No therapists found
                </h3>
                <p className="text-gray-600 mb-4">
                  {therapists.length === 0
                    ? "Get started by adding your first therapist."
                    : "Try adjusting your search criteria."}
                </p>
                {therapists.length === 0 && (
                  <button
                    onClick={() => setActiveTab("form")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add First Therapist
                  </button>
                )}
              </div>
            ) : viewMode === "grid" && !isMobile ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {currentTherapists.map((therapist) => (
                  <TherapistGridCard
                    key={therapist._id}
                    therapist={therapist}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isSelected={selectedTherapists.includes(therapist._id)}
                    onSelect={() => handleSelectTherapist(therapist._id)}
                    getBadgeColor={getBadgeColor}
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-3 lg:space-y-4">
                {currentTherapists.map((therapist) => (
                  <TherapistListCard
                    key={therapist._id}
                    therapist={therapist}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isSelected={selectedTherapists.includes(therapist._id)}
                    onSelect={() => handleSelectTherapist(therapist._id)}
                    isMobile={isMobile}
                    getBadgeColor={getBadgeColor}
                  />
                ))}
              </div>
            )}

            {currentTherapists.length > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl shadow-md border border-gray-100 p-4 lg:p-6">
                <div className="text-sm text-gray-600">
                  Showing {indexOfFirstTherapist + 1} to{" "}
                  {Math.min(indexOfLastTherapist, sortedTherapists.length)} of{" "}
                  {sortedTherapists.length} therapists
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
                                ? "bg-purple-600 text-white"
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

const TherapistGridCard = ({ therapist, onEdit, onDelete, isSelected, onSelect, getBadgeColor }) => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="relative">
        <img
          src={
            therapist.image
              ? `http://localhost:8001/img/${therapist.image}`
              : "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80"
          }
          alt={therapist.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={() => onSelect()}
            className="p-2 bg-white rounded-full shadow-lg hover:bg-purple-50 transition-colors"
          >
            {isSelected ? (
              <CheckSquare className="w-4 h-4 text-purple-600" />
            ) : (
              <Square className="w-4 h-4 text-gray-400" />
            )}
          </button>
          {/* <button
            onClick={() => onEdit(therapist)}
            className="p-2 bg-white rounded-full shadow-lg hover:bg-blue-50 transition-colors"
          >
            <Edit3 className="w-4 h-4 text-blue-600" />
          </button> */}
          <button
            onClick={() => onDelete(therapist._id)}
            className="p-2 bg-white rounded-full shadow-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </button>
        </div>
        {therapist.badge && (
          <div className="absolute top-3 left-3">
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(therapist.badge)}`}>
              {therapist.badge}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-lg mb-2">
          {therapist.name}
        </h3>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Award className="w-4 h-4" />
            <span>{therapist.experience}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>{therapist.rating ? `${therapist.rating} out of 5` : "Not rated"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Users className="w-4 h-4" />
            <span>{therapist.clientsServed || "0"} clients</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{therapist.responseTime || "Not specified"}</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
            <IndianRupee className="w-4 h-4" />
            <span>₹{therapist.fee} per session</span>
          </div>
        </div>

        {therapist.specialties && therapist.specialties.length > 0 && (
          <div className="mb-3">
            <p className="text-sm text-gray-500 mb-2">Specialties:</p>
            <div className="flex flex-wrap gap-1">
              {therapist.specialties.slice(0, 3).map((specialty, index) => (
                <span
                  key={index}
                  className="inline-block px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs"
                >
                  {specialty}
                </span>
              ))}
              {therapist.specialties.length > 3 && (
                <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                  +{therapist.specialties.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Morning: {therapist.morningSlot || "0"} slots</span>
          <span>Evening: {therapist.eveningSlot || "0"} slots</span>
        </div>
      </div>
    </div>
  );
};

const TherapistListCard = ({
  therapist,
  onEdit,
  onDelete,
  isSelected,
  onSelect,
  isMobile,
  getBadgeColor
}) => {
  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300">
      <div className="p-4 lg:p-6">
        <div className=" items-start gap-4">
          <button onClick={onSelect} className="mt-1 flex-shrink-0">
            {isSelected ? (
              <CheckSquare className="w-5 h-5 text-purple-600" />
            ) : (
              <Square className="w-5 h-5 text-gray-400" />
            )}
          </button>

          <div className="flex-shrink-0">
            <img
              src={
                therapist.image
                  ? `http://localhost:8001/img/${therapist.image._id}`
                  : "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&q=80"
              }
              alt={therapist.name}
              className="w-16 h-16 lg:w-20 lg:h-20 rounded-xl object-cover border-2 border-gray-100"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 text-lg">
                    {therapist.name}
                  </h3>
                  {therapist.badge && (
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getBadgeColor(therapist.badge)}`}>
                      {therapist.badge}
                    </span>
                  )}
                </div>
                <p className="text-gray-500 text-sm mb-2">
                  {therapist.experience} • {therapist.certification}
                </p>
                
                <div className="flex items-center gap-4 lg:gap-6 mt-3 flex-wrap">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{therapist.rating ? `${therapist.rating} out of 5` : "Not rated"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>{therapist.clientsServed || "0"} clients</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>{therapist.responseTime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <IndianRupee className="w-4 h-4" />
                    <span>₹{therapist.fee}</span>
                  </div>
                </div>

                {therapist.specialties && therapist.specialties.length > 0 && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      {therapist.specialties.slice(0, 4).map((specialty, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 bg-purple-50 text-purple-700 rounded-full text-xs"
                        >
                          {specialty}
                        </span>
                      ))}
                      {therapist.specialties.length > 4 && (
                        <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs">
                          +{therapist.specialties.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {/* <button
                  onClick={() => onEdit(therapist)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                </button> */}
                <button
                  onClick={() => onDelete(therapist._id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Therapist;