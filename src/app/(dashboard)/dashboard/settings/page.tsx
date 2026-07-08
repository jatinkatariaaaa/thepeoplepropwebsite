"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    title: "",
    firstName: "",
    lastName: "",
    dob: "",
    email: "",
    timezone: "",
    street: "",
    city: "",
    postalCode: "",
    country: "",
    kycStatus: "",
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [kycForm, setKycForm] = useState({
    documentType: "national_id",
    documentNumber: "",
    country: "",
  });

  // Load the logged-in user's profile on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) return;

        const res = await fetch("/api/user/settings", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });

        if (res.ok) {
          const { profile } = await res.json();
          setFormData({
            title: profile.title || "",
            firstName: profile.firstName || "",
            lastName: profile.lastName || "",
            dob: profile.dob || "",
            email: profile.email || "",
            timezone: profile.timezone || "",
            street: profile.street || "",
            city: profile.city || "",
            postalCode: profile.postalCode || "",
            country: profile.country || "",
            kycStatus: profile.kycStatus || "",
          });
        }
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setMessage("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const res = await fetch("/api/user/settings", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(session?.access_token && { "Authorization": `Bearer ${session.access_token}` })
        },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Profile updated successfully!");
      } else {
        setMessage(data.error || "Failed to update profile");
      }
    } catch (err) {
      setMessage("An error occurred");
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="mx-auto flex max-w-4xl items-center justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-ink-200 border-t-ink" role="status" aria-label="Loading profile"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl animate-in fade-in slide-in-from-bottom-2 duration-500 ease-out">
      <div className="mb-6">
        <p className="dash-overline mb-1.5">Account</p>
        <h1 className="text-xl font-semibold tracking-tight text-ink sm:text-2xl">Profile Details</h1>
        <p className="mt-1 text-sm text-ink-500">Manage your personal information and verification status.</p>
      </div>

      <div className="space-y-6">
        {/* Personal Information */}
        <div className="dash-card p-5 sm:p-6">
          <div className="mb-6">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Personal Information</h2>
            <p className="mt-1 text-[13px] text-ink-500">Update your personal details and contact information.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[13px] font-medium text-ink-700">Title</label>
              <select 
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="h-10 w-full rounded-none border border-[var(--dash-hairline)] bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-ink-400 appearance-none"
              >
                <option value="">Select...</option>
                <option value="Mr.">Mr.</option>
                <option value="Ms.">Ms.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Dr.">Dr.</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-medium text-ink-700">First Name</label>
              <input 
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Enter your first name"
                className="h-10 w-full rounded-none border border-[var(--dash-hairline)] bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-ink-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-medium text-ink-700">Last Name</label>
              <input 
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Enter your last name"
                className="h-10 w-full rounded-none border border-[var(--dash-hairline)] bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-ink-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-medium text-ink-700">Date of Birth</label>
              <input 
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="h-10 w-full rounded-none border border-[var(--dash-hairline)] bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-ink-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-medium text-ink-700">Email Address</label>
              <input 
                type="email"
                name="email"
                value={formData.email}
                disabled
                className="h-10 w-full cursor-not-allowed rounded-none border border-[var(--dash-hairline)] bg-ink-50 px-3 text-sm text-ink-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-medium text-ink-700">Preferred Time Zone</label>
              <select 
                name="timezone"
                value={formData.timezone}
                onChange={handleChange}
                className="h-10 w-full rounded-none border border-[var(--dash-hairline)] bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-ink-400 appearance-none"
              >
                <option value="">Select timezone...</option>
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="America/Chicago">America/Chicago (CST)</option>
                <option value="America/Los_Angeles">America/Los_Angeles (PST)</option>
                <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                <option value="Europe/Berlin">Europe/Berlin (CET)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Address Information */}
        <div className="dash-card p-5 sm:p-6">
          <div className="mb-6">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Address Information</h2>
            <p className="mt-1 text-[13px] text-ink-500">Your residential address for verification and billing purposes.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2 space-y-2">
              <label className="text-[13px] font-medium text-ink-700">Street Address</label>
              <input 
                type="text"
                name="street"
                value={formData.street}
                onChange={handleChange}
                placeholder="Enter your street address"
                className="h-10 w-full rounded-none border border-[var(--dash-hairline)] bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-ink-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-medium text-ink-700">City</label>
              <input 
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Enter your city"
                className="h-10 w-full rounded-none border border-[var(--dash-hairline)] bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-ink-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-medium text-ink-700">Postal Code</label>
              <input 
                type="text"
                name="postalCode"
                value={formData.postalCode}
                onChange={handleChange}
                placeholder="Enter postal code"
                className="h-10 w-full rounded-none border border-[var(--dash-hairline)] bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-ink-400"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[13px] font-medium text-ink-700">Country</label>
              <select 
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="h-10 w-full rounded-none border border-[var(--dash-hairline)] bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-ink-400 appearance-none"
              >
                <option value="">Select country...</option>
                <option value="India">India</option>
                <option value="United States">United States</option>
                <option value="United Kingdom">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
                <option value="Germany">Germany</option>
                <option value="UAE">UAE</option>
                <option value="Singapore">Singapore</option>
              </select>
            </div>
          </div>
        </div>

        {/* Identity Verification (KYC) */}
        <div className="dash-card p-5 sm:p-6">
          <div className="mb-6">
            <h2 className="text-[15px] font-semibold tracking-tight text-ink">Identity Verification (KYC)</h2>
            <p className="mt-1 text-[13px] text-ink-500">Verify your identity to unlock payouts and funded accounts.</p>
          </div>

          <div className="flex flex-col gap-4 rounded-none border border-[var(--dash-hairline)] bg-[var(--dash-canvas)] p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[13px] font-semibold text-ink">Current Status:</span>
                  <span className={cn(
                    "rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.06em]",
                    formData.kycStatus === 'verified' ? "border bg-[#a7f0ba] text-[#0e6027]" :
                    formData.kycStatus === 'pending' ? "bg-[#fcf4d6] text-[#8e6a00] border border-[#FDE68A]" :
                    formData.kycStatus === 'rejected' ? "bg-[#ffd7d9] text-[#a2191f] border border-[#FECDD3]" :
                    "border border-ink-200 bg-ink-50 text-ink-600"
                  )}>
                    {formData.kycStatus || 'unverified'}
                  </span>
                </div>
                <p className="text-[13px] text-[var(--ink-500)]">
                  {formData.kycStatus === 'verified' && "Your identity has been successfully verified."}
                  {formData.kycStatus === 'pending' && "Your verification request is currently under review by our team."}
                  {formData.kycStatus === 'rejected' && "Your previous verification request was rejected. Please try again."}
                  {(!formData.kycStatus || formData.kycStatus === 'none') && "Please submit your KYC details to get verified."}
                </p>
              </div>
            </div>

            {(!formData.kycStatus || formData.kycStatus === 'none' || formData.kycStatus === 'rejected') && (
              <div className="mt-2 space-y-4 border-t border-[var(--dash-hairline)] pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Document Type *</label>
                    <select
                      value={kycForm.documentType}
                      onChange={(e) => setKycForm({ ...kycForm, documentType: e.target.value })}
                      className="h-10 w-full rounded-none border border-[var(--dash-hairline)] bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-ink-400"
                    >
                      <option value="national_id">National ID</option>
                      <option value="passport">Passport</option>
                      <option value="driving_license">Driving License</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Document Number *</label>
                    <input
                      type="text"
                      placeholder="Enter ID Number"
                      value={kycForm.documentNumber}
                      onChange={(e) => setKycForm({ ...kycForm, documentNumber: e.target.value })}
                      className="h-10 w-full rounded-none border border-[var(--dash-hairline)] bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-ink-400"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-medium text-ink-700">Issuing Country *</label>
                    <input
                      type="text"
                      placeholder="e.g. United States"
                      value={kycForm.country}
                      onChange={(e) => setKycForm({ ...kycForm, country: e.target.value })}
                      className="h-10 w-full rounded-none border border-[var(--dash-hairline)] bg-white px-3 text-sm text-ink outline-none transition-colors focus:border-ink-400"
                    />
                  </div>
                </div>

                <div className="flex justify-end">
                  <button 
                    onClick={async () => {
                      if (!kycForm.documentNumber || !kycForm.country) {
                        alert("Please fill in all KYC fields.");
                        return;
                      }
                      if(confirm("Are you sure you want to submit your KYC request? Make sure your profile details match your ID.")){
                        try {
                          const { data: { session } } = await supabase.auth.getSession();
                          const res = await fetch("/api/user/settings", {
                            method: "POST",
                            headers: { 
                              "Content-Type": "application/json",
                              ...(session?.access_token && { "Authorization": `Bearer ${session.access_token}` })
                            },
                            body: JSON.stringify({ 
                              action: "submit_kyc",
                              documentType: kycForm.documentType,
                              documentNumber: kycForm.documentNumber,
                              country: kycForm.country
                            }),
                          });
                          if(res.ok){
                            setFormData({...formData, kycStatus: 'pending'});
                            alert("KYC Request Submitted Successfully!");
                          } else {
                            const data = await res.json();
                            alert("Failed to submit KYC: " + data.error);
                          }
                        } catch(e) {
                          alert("Error submitting KYC");
                        }
                      }
                    }}
                    className="inline-flex h-10 items-center whitespace-nowrap rounded-none bg-[var(--carbon-blue)] px-5 text-[13px] font-semibold text-white transition-all hover:bg-[var(--carbon-blue-hover)] active:scale-[0.98]"
                  >
                    Submit KYC
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end gap-4 pt-4">
          {message && <span className={cn("text-[13px] font-medium", message.includes("success") ? "text-[var(--dash-positive)]" : "text-[var(--dash-negative)]")}>{message}</span>}
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex h-10 items-center rounded-none bg-[var(--carbon-blue)] px-5 text-[13px] font-semibold text-white transition-all hover:bg-[var(--carbon-blue-hover)] active:scale-[0.98] disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
