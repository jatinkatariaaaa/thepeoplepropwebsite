"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { User, Lock } from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

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

  // Security tab state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityMessage, setSecurityMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const handlePasswordChange = async () => {
    setSecurityMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setSecurityMessage({ type: 'error', text: 'Please fill in all fields.' });
      return;
    }
    if (newPassword.length < 8) {
      setSecurityMessage({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setSecurityMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setSecurityLoading(true);
    try {
      // Verify current password by re-authenticating
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.email) {
        setSecurityMessage({ type: 'error', text: 'No active session found. Please log in again.' });
        setSecurityLoading(false);
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: session.user.email,
        password: currentPassword,
      });

      if (signInError) {
        setSecurityMessage({ type: 'error', text: 'Current password is incorrect.' });
        setSecurityLoading(false);
        return;
      }

      const { error: updateError } = await supabase.auth.updateUser({ password: newPassword });

      if (updateError) {
        setSecurityMessage({ type: 'error', text: updateError.message });
      } else {
        setSecurityMessage({ type: 'success', text: 'Password updated successfully!' });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setSecurityMessage({ type: 'error', text: 'An unexpected error occurred.' });
    }
    setSecurityLoading(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-24">
        <div className="w-6 h-6 border-2 border-[var(--ink-200)] border-t-[var(--ink-950)] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Tab Bar */}
      <div className="mb-8">
        <div className="flex items-center gap-2 p-1 bg-[var(--paper)] border border-[var(--border)] rounded-full w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={cn(
              "flex items-center gap-2 px-5 py-2 text-[14px] font-medium rounded-full transition-all cursor-pointer",
              activeTab === 'profile'
                ? "bg-[var(--ink-950)] text-white"
                : "text-[var(--ink-600)] hover:text-[var(--ink-950)]"
            )}
          >
            <User className="w-4 h-4" />
            Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={cn(
              "flex items-center gap-2 px-5 py-2 text-[14px] font-medium rounded-full transition-all cursor-pointer",
              activeTab === 'security'
                ? "bg-[var(--ink-950)] text-white"
                : "text-[var(--ink-600)] hover:text-[var(--ink-950)]"
            )}
          >
            <Lock className="w-4 h-4" />
            Security
          </button>
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <>
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
                    <option value="">Select...</option>
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
                    placeholder="Enter your first name"
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
                    placeholder="Enter your last name"
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
                    placeholder="Enter your street address"
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
                    placeholder="Enter your city"
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
                    placeholder="Enter postal code"
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
            <div className="bg-white rounded-2xl p-6 lg:p-8 border border-[var(--border)] shadow-sm">
              <div className="mb-6">
                <h2 className="text-[16px] font-bold text-[var(--ink-950)]">Identity Verification (KYC)</h2>
                <p className="text-[13px] text-[var(--ink-500)] mt-1">Verify your identity to unlock payouts and funded accounts.</p>
              </div>

              <div className="flex flex-col p-4 bg-[var(--paper)] rounded-xl border border-[var(--border)] gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[14px] font-bold text-[var(--ink-950)]">Current Status:</span>
                      <span className={cn(
                        "px-2.5 py-0.5 rounded-full text-[12px] font-bold uppercase tracking-wider",
                        formData.kycStatus === 'verified' ? "bg-emerald-50 text-emerald-600" :
                        formData.kycStatus === 'pending' ? "bg-amber-50 text-amber-600" :
                        formData.kycStatus === 'rejected' ? "bg-red-50 text-red-600" :
                        "bg-[var(--ink-100)] text-[var(--ink-600)]"
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
                  <div className="mt-4 space-y-4 pt-4 border-t border-[var(--border)]">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[13px] font-bold text-[var(--ink-950)] mb-1">Document Type *</label>
                        <select
                          value={kycForm.documentType}
                          onChange={(e) => setKycForm({ ...kycForm, documentType: e.target.value })}
                          className="w-full h-11 px-4 bg-white border border-[var(--border)] rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--ink-950)]/10"
                        >
                          <option value="national_id">National ID</option>
                          <option value="passport">Passport</option>
                          <option value="driving_license">Driving License</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold text-[var(--ink-950)] mb-1">Document Number *</label>
                        <input
                          type="text"
                          placeholder="Enter ID Number"
                          value={kycForm.documentNumber}
                          onChange={(e) => setKycForm({ ...kycForm, documentNumber: e.target.value })}
                          className="w-full h-11 px-4 bg-white border border-[var(--border)] rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--ink-950)]/10"
                        />
                      </div>
                      <div>
                        <label className="block text-[13px] font-bold text-[var(--ink-950)] mb-1">Issuing Country *</label>
                        <input
                          type="text"
                          placeholder="e.g. United States"
                          value={kycForm.country}
                          onChange={(e) => setKycForm({ ...kycForm, country: e.target.value })}
                          className="w-full h-11 px-4 bg-white border border-[var(--border)] rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[var(--ink-950)]/10"
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
                        className="h-10 px-6 bg-[var(--accent)] hover:bg-[var(--accent-700)] text-white text-[13px] font-bold rounded-xl transition-all shadow-sm active:scale-[0.98] whitespace-nowrap"
                      >
                        Submit KYC
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
              {message && <span className={cn("text-[13px] font-medium", message.includes("success") ? "text-emerald-600" : "text-red-600")}>{message}</span>}
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="h-11 px-6 bg-[var(--ink-950)] hover:bg-[var(--ink-800)] text-white text-[14px] font-bold rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
              >
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <>
          <div className="mb-8">
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-[var(--ink-950)] mb-2">Login &amp; Security</h1>
            <p className="text-[13px] text-[var(--ink-500)]">Manage your password</p>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 lg:p-8 border border-[var(--border)] shadow-sm">
              <div className="mb-6">
                <h2 className="text-[16px] font-bold text-[var(--ink-950)]">Change Password</h2>
                <p className="text-[13px] text-[var(--ink-500)] mt-1">Update your password to keep your account secure.</p>
              </div>

              <div className="space-y-6 max-w-md">
                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-[var(--ink-950)]">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter your current password"
                    className="w-full bg-white border border-[var(--border)] rounded-xl h-11 px-3 text-[14px] text-[var(--ink-900)] focus:outline-none focus:border-[var(--ink-400)] transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-[var(--ink-950)]">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 8 characters"
                    className="w-full bg-white border border-[var(--border)] rounded-xl h-11 px-3 text-[14px] text-[var(--ink-900)] focus:outline-none focus:border-[var(--ink-400)] transition-colors"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[13px] font-bold text-[var(--ink-950)]">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter your new password"
                    className="w-full bg-white border border-[var(--border)] rounded-xl h-11 px-3 text-[14px] text-[var(--ink-900)] focus:outline-none focus:border-[var(--ink-400)] transition-colors"
                  />
                </div>
              </div>

              {securityMessage && (
                <div className={cn(
                  "mt-6 p-3 rounded-lg text-[13px] font-medium",
                  securityMessage.type === 'success'
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                    : "bg-red-50 text-red-600 border border-red-200"
                )}>
                  {securityMessage.text}
                </div>
              )}

              <div className="flex justify-end mt-6">
                <button
                  onClick={handlePasswordChange}
                  disabled={securityLoading}
                  className="h-11 px-6 bg-[var(--ink-950)] hover:bg-[var(--ink-800)] text-white text-[14px] font-bold rounded-xl transition-all shadow-md active:scale-[0.98] disabled:opacity-50"
                >
                  {securityLoading ? "Updating..." : "Update Password"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
