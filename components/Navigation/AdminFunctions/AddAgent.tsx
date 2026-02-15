"use client";

import { useState } from "react";
import {
  User,
  Mail,
  Building,
  Shield,
  Lock,
  Plus,
  AlertCircle,
  UserRound,
} from "lucide-react";
import FormAsterisk from "@/components/Modules/FormAsterisk";

const AddAgent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    department: "",
    role: "agent",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (error) setError("");
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      // TODO: Replace with your actual API call
      console.log("Submitting New Agent:", formData);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Reset form on success
      setFormData({
        name: "",
        email: "",
        department: "",
        role: "Support Agent",
        password: "",
        confirmPassword: "",
      });
      alert("Agent added successfully!"); // Replace with your toast notification
    } catch (err) {
      console.error(err);
      setError("Failed to add agent. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 rounded-xl border border-neutral-200 bg-neutral-50 p-6 transition-all dark:border-neutral-800 dark:bg-neutral-900/50">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
            Register New Agent
          </h3>
          <p className="text-xs text-neutral-500">
            Create a new account for a support team member.
          </p>
        </div>
      </div>

      <form onSubmit={handleFormSubmit} className="grid gap-5">
        <div className="grid gap-5 md:grid-cols-2">
          {/* Name */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              <span>Full Name</span>
              <FormAsterisk />
            </label>
            <div className="relative">
              <UserRound className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Agent Name..."
                required
                className="w-full rounded-lg border border-neutral-300 bg-white py-2 pr-3 pl-9 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              Email Address{" "}
              <span className="font-normal text-gray-500">
                (should be accurate)
              </span>
              <FormAsterisk />
            </label>
            <div className="relative">
              <Mail className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="username@hotpoint.co.ke"
                required
                className="w-full rounded-lg border border-neutral-300 bg-white py-2 pr-3 pl-9 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
              />
            </div>
          </div>

          {/* Department */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              <span>Department</span>
              <FormAsterisk />
            </label>
            <div className="relative">
              <Building className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleChange}
                placeholder="agent's department"
                required
                className="w-full rounded-lg border border-neutral-300 bg-white py-2 pr-3 pl-9 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
              />
            </div>
          </div>

          {/* Role */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              <span>Role</span>
              <FormAsterisk />
            </label>
            <div className="relative">
              <Shield className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                name="role"
                value={formData.role}
                onChange={handleChange}
                placeholder="agent's role"
                required
                className="w-full appearance-none rounded-lg border border-neutral-300 bg-white py-2 pr-3 pl-9 text-sm text-neutral-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              <span>Password</span>
              <FormAsterisk />
            </label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className="w-full rounded-lg border border-neutral-300 bg-white py-2 pr-3 pl-9 text-sm text-neutral-900 placeholder-neutral-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500"
              />
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="flex items-center gap-1 text-xs font-semibold text-neutral-600 dark:text-neutral-400">
              <span>Confirm Password</span>
              <FormAsterisk />
            </label>
            <div className="relative">
              <Lock className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                className={`w-full rounded-lg border bg-white py-2 pr-3 pl-9 text-sm text-neutral-900 placeholder-neutral-400 focus:ring-1 focus:outline-none dark:bg-neutral-800 dark:text-neutral-100 dark:placeholder-neutral-500 ${
                  error
                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                    : "border-neutral-300 focus:border-blue-500 focus:ring-blue-500 dark:border-neutral-700"
                }`}
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm text-white transition-colors hover:bg-blue-800 disabled:cursor-not-allowed disabled:bg-blue-700/70"
          >
            <Plus size={16} />
            <span>Register</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAgent;
