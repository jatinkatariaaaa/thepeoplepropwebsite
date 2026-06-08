"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    title: "Mr.",
    firstName: "Jatin",
    lastName: "Kataria",
    dob: "2003-05-21",
    email: "jatin.220bpharm010@sushantuniversity.edu.in",
    timezone: "",
    street: "Sector 12, H. No 8, gali no 2",
    city: "Gurgaon",
    postalCode: "122001",
    country: "India",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-display font-bold text-[var(--ink-950)] mb-2">Profile Details</h1>
      </div>

      <div className="space-y-6">
        {/* Personal Information */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 border border-[var(--border)] shadow-sm">
          <div className="mb-6">
            <h2 className="text-[16px] font-bold text-[var(--ink-950)]">Personal Information</h2>
            <p className="text-[13px] text-[var(--ink-500)] mt-1">Update your personal details and contact information.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[var(--ink-950)]">Title</label>
              <select 
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full bg-white border border-[var(--border)] rounded-xl h-11 px-3 text-[14px] text-[var(--ink-900)] focus:outline-none focus:border-[var(--ink-400)] transition-colors appearance-none"
              >
                <option value="Mr.">Mr.</option>
                <option value="Ms.">Ms.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Dr.">Dr.</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[var(--ink-950)]">First Name</label>
              <input 
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full bg-white border border-[var(--border)] rounded-xl h-11 px-3 text-[14px] text-[var(--ink-900)] focus:outline-none focus:border-[var(--ink-400)] transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[var(--ink-950)]">Last Name</label>
              <input 
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full bg-white border border-[var(--border)] rounded-xl h-11 px-3 text-[14px] text-[var(--ink-900)] focus:outline-none focus:border-[var(--ink-400)] transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[var(--ink-950)]">Date of Birth</label>
              <input 
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full bg-white border border-[var(--border)] rounded-xl h-11 px-3 text-[14px] text-[var(--ink-900)] focus:outline-none focus:border-[var(--ink-400)] transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[var(--ink-950)]">Email Address</label>
              <input 
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="w-full bg-[var(--paper-2)] border border-[var(--border)] rounded-xl h-11 px-3 text-[14px] text-[var(--ink-500)] cursor-not-allowed"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[var(--ink-950)]">Preferred Time Zone</label>
              <select 
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className="w-full bg-white border border-[var(--border)] rounded-xl h-11 px-3 text-[14px] text-[var(--ink-900)] focus:outline-none focus:border-[var(--ink-400)] transition-colors appearance-none"
              >
                <option value="">Select timezone...</option>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="America/New_York">America/New_York (EST)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="bg-white rounded-2xl p-6 lg:p-8 border border-[var(--border)] shadow-sm">
          <div className="mb-6">
            <h2 className="text-[16px] font-bold text-[var(--ink-950)]">Address Information</h2>
            <p className="text-[13px] text-[var(--ink-500)] mt-1">Your residential address for verification and billing purposes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[13px] font-bold text-[var(--ink-950)]">Street Address</label>
              <input 
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                className="w-full bg-white border border-[var(--border)] rounded-xl h-11 px-3 text-[14px] text-[var(--ink-900)] focus:outline-none focus:border-[var(--ink-400)] transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[var(--ink-950)]">City</label>
              <input 
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="w-full bg-white border border-[var(--border)] rounded-xl h-11 px-3 text-[14px] text-[var(--ink-900)] focus:outline-none focus:border-[var(--ink-400)] transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[var(--ink-950)]">Postal Code</label>
              <input 
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                className="w-full bg-white border border-[var(--border)] rounded-xl h-11 px-3 text-[14px] text-[var(--ink-900)] focus:outline-none focus:border-[var(--ink-400)] transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-bold text-[var(--ink-950)]">Country</label>
              <select 
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="w-full bg-white border border-[var(--border)] rounded-xl h-11 px-3 text-[14px] text-[var(--ink-900)] focus:outline-none focus:border-[var(--ink-400)] transition-colors appearance-none"
              >
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button className="h-11 px-6 bg-[var(--ink-950)] hover:bg-[var(--ink-800)] text-white text-[14px] font-bold rounded-xl transition-all shadow-md active:scale-[0.98]">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
