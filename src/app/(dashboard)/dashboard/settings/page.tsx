"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { User, Lock } from "lucide-react";
import { Chip, Notice, PageTitle, Panel, PanelHead, SelectChevron, Spinner, btn, field, fieldLabel, segment, selectField } from "@/components/dashboard/glass";

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
    } catch {
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
    } catch {
      setSecurityMessage({ type: 'error', text: 'An unexpected error occurred.' });
    }
    setSecurityLoading(false);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center py-24">
        <Spinner className="h-6 w-6" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Tab Bar */}
      <div className="mb-8">
        <div className={segment.wrap}>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={cn(segment.item(activeTab === 'profile'), "px-5 py-2 text-[14px]")}
          >
            <User className="w-4 h-4" />
            Profile
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={cn(segment.item(activeTab === 'security'), "px-5 py-2 text-[14px]")}
          >
            <Lock className="w-4 h-4" />
            Security
          </button>
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <>
          <PageTitle lead="Profile" fade="Details" />

          <div className="space-y-6">
            {/* Personal Information */}
            <Panel>
              <PanelHead title="Personal Information" sub="Update your personal details and contact information." />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 sm:p-6 lg:p-8">
                <div>
                  <label className={fieldLabel}>Title</label>
                  <div className="relative">
                    <select
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className={cn(field(), selectField)}
                    >
                      <option value="">Select...</option>
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Dr.">Dr.</option>
                    </select>
                    <SelectChevron />
                  </div>
                </div>

                <div>
                  <label className={fieldLabel}>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Enter your first name"
                    className={field()}
                  />
                </div>

                <div>
                  <label className={fieldLabel}>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Enter your last name"
                    className={field()}
                  />
                </div>

                <div>
                  <label className={fieldLabel}>Date of Birth</label>
                  <input
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleChange}
                    className={field()}
                  />
                </div>

                <div>
                  <label className={fieldLabel}>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className={cn(field(), "bg-black/[0.03] text-[var(--g-muted-ink)]")}
                  />
                </div>

                <div>
                  <label className={fieldLabel}>Preferred Time Zone</label>
                  <div className="relative">
                    <select
                      name="timezone"
                      value={formData.timezone}
                      onChange={handleChange}
                      className={cn(field(), selectField)}
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
                    <SelectChevron />
                  </div>
                </div>
              </div>
            </Panel>

            {/* Address Information */}
            <Panel>
              <PanelHead title="Address Information" sub="Your residential address for verification and billing purposes." />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 sm:p-6 lg:p-8">
                <div className="md:col-span-2">
                  <label className={fieldLabel}>Street Address</label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="Enter your street address"
                    className={field()}
                  />
                </div>

                <div>
                  <label className={fieldLabel}>City</label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Enter your city"
                    className={field()}
                  />
                </div>

                <div>
                  <label className={fieldLabel}>Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleChange}
                    placeholder="Enter postal code"
                    className={field()}
                  />
                </div>

                <div>
                  <label className={fieldLabel}>Country</label>
                  <div className="relative">
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className={cn(field(), selectField)}
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
                    <SelectChevron />
                  </div>
                </div>
              </div>
            </Panel>

            {/* Identity Verification (KYC) */}
            <Panel>
              <PanelHead title="Identity Verification (KYC)" sub="Verify your identity to unlock payouts and funded accounts." />

              <div className="p-5 sm:p-6 lg:p-8">
                <div className="flex flex-col gap-4 rounded-[20px] bg-black/[0.025] p-4 ring-1 ring-black/[0.05] sm:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <span className="text-[14px] font-semibold text-[var(--g-ink)]">Current Status:</span>
                        <Chip
                          tone={
                            formData.kycStatus === 'verified' ? "emerald" :
                            formData.kycStatus === 'pending' ? "amber" :
                            formData.kycStatus === 'rejected' ? "red" :
                            "neutral"
                          }
                          className="tracking-wider uppercase"
                        >
                          {formData.kycStatus || 'unverified'}
                        </Chip>
                      </div>
                      <p className="text-[13px] text-[var(--g-muted-ink)]">
                        {formData.kycStatus === 'verified' && "Your identity has been successfully verified."}
                        {formData.kycStatus === 'pending' && "Your verification request is currently under review by our team."}
                        {formData.kycStatus === 'rejected' && "Your previous verification request was rejected. Please try again."}
                        {(!formData.kycStatus || formData.kycStatus === 'none') && "Please submit your KYC details to get verified."}
                      </p>
                    </div>
                  </div>

                  {(!formData.kycStatus || formData.kycStatus === 'none' || formData.kycStatus === 'rejected') && (
                    <div className="mt-2 space-y-4 border-t border-black/[0.06] pt-5">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className={fieldLabel}>Document Type *</label>
                          <div className="relative">
                            <select
                              value={kycForm.documentType}
                              onChange={(e) => setKycForm({ ...kycForm, documentType: e.target.value })}
                              className={cn(field(), selectField)}
                            >
                              <option value="national_id">National ID</option>
                              <option value="passport">Passport</option>
                              <option value="driving_license">Driving License</option>
                            </select>
                            <SelectChevron />
                          </div>
                        </div>
                        <div>
                          <label className={fieldLabel}>Document Number *</label>
                          <input
                            type="text"
                            placeholder="Enter ID Number"
                            value={kycForm.documentNumber}
                            onChange={(e) => setKycForm({ ...kycForm, documentNumber: e.target.value })}
                            className={field()}
                          />
                        </div>
                        <div>
                          <label className={fieldLabel}>Issuing Country *</label>
                          <input
                            type="text"
                            placeholder="e.g. United States"
                            value={kycForm.country}
                            onChange={(e) => setKycForm({ ...kycForm, country: e.target.value })}
                            className={field()}
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
                              } catch {
                                alert("Error submitting KYC");
                              }
                            }
                          }}
                          className={cn(btn.ink, btn.sm)}
                        >
                          Submit KYC
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Panel>

            <div className="flex flex-wrap items-center justify-end gap-4 pt-2">
              {message && <span className={cn("text-[13px] font-medium", message.includes("success") ? "text-[var(--g-emerald)]" : "text-red-600")}>{message}</span>}
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={btn.lime}
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
          <PageTitle lead="Login &" fade="Security" lede="Manage your password" />

          <div className="space-y-6">
            <Panel>
              <PanelHead title="Change Password" sub="Update your password to keep your account secure." />

              <div className="p-5 sm:p-6 lg:p-8">
                <div className="max-w-md space-y-5">
                  <div>
                    <label className={fieldLabel}>Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                      className={field()}
                    />
                  </div>

                  <div>
                    <label className={fieldLabel}>New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Minimum 8 characters"
                      className={field()}
                    />
                  </div>

                  <div>
                    <label className={fieldLabel}>Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your new password"
                      className={field()}
                    />
                  </div>
                </div>

                {securityMessage && (
                  <Notice tone={securityMessage.type === 'success' ? "emerald" : "red"} className="mt-6 font-medium">
                    {securityMessage.text}
                  </Notice>
                )}

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handlePasswordChange}
                    disabled={securityLoading}
                    className={btn.lime}
                  >
                    {securityLoading ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </div>
            </Panel>
          </div>
        </>
      )}
    </div>
  );
}
