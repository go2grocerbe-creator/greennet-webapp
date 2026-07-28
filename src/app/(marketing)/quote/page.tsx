"use client";

import { useState } from "react";

/**
 * Quote Request Page
 * Claude Reimagination Design - Phase 5
 * 13-field consultative form with client-side validation
 */
export default function QuotePage() {
  const [formData, setFormData] = useState({
    fullName: "",
    companyName: "",
    email: "",
    phone: "",
    location: "",
    classification: "commercial",
    propertyType: "",
    projectType: "",
    currentPower: "",
    estimatedLoad: "",
    contactMethod: "email",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [showError, setShowError] = useState(false);

  const systemOptions = [
    "Solar Panels",
    "Inverters",
    "Battery Storage",
    "Monitoring Systems",
    "EV Charging",
    "Solar Carports",
    "Commercial Energy Systems",
  ];

  const [selectedSystems, setSelectedSystems] = useState<string[]>([]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSystemToggle = (system: string) => {
    setSelectedSystems((prev) =>
      prev.includes(system)
        ? prev.filter((s) => s !== system)
        : [...prev, system]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (!formData.fullName.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setShowError(true);
      return;
    }

    setShowError(false);
    setSubmitted(true);

    // Reset form after 3 seconds
    setTimeout(() => {
      setFormData({
        fullName: "",
        companyName: "",
        email: "",
        phone: "",
        location: "",
        classification: "commercial",
        propertyType: "",
        projectType: "",
        currentPower: "",
        estimatedLoad: "",
        contactMethod: "email",
        message: "",
      });
      setSelectedSystems([]);
      setSubmitted(false);
    }, 3000);
  };

  return (
    <>
      {/* Hero Section */}
      <section
        style={{
          background: "var(--midnight-navy)",
          padding: "64px 24px 48px",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
          <p
            style={{
              fontFamily: "var(--font-inter)",
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: "var(--solar-amber)",
              margin: "0 0 14px",
            }}
          >
            Request a Quotation
          </p>
          <h1
            style={{
              fontFamily: "var(--font-space-grotesk)",
              fontWeight: 700,
              fontSize: "clamp(28px, 3.6vw, 42px)",
              letterSpacing: "-0.02em",
              lineHeight: "1.1",
              margin: 0,
              color: "var(--warm-white)",
              maxWidth: "700px",
            }}
          >
            Tell us about your project. We&rsquo;ll come back with a considered
            recommendation.
          </h1>
          <p
            style={{
              margin: "18px 0 0",
              fontFamily: "var(--font-inter)",
              fontSize: "15.5px",
              lineHeight: "1.7",
              color: "var(--light-grey)",
              maxWidth: "600px",
            }}
          >
            This starts a conversation, not a checkout. A member of our team reviews
            every submission before responding.
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section style={{ padding: "64px 24px 96px" }}>
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1.5fr 1fr",
            gap: "56px",
            alignItems: "start",
          }}
        >
          {!submitted ? (
            <form
              onSubmit={handleSubmit}
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(13, 27, 36, 0.1)",
                borderRadius: "2px",
                padding: "40px",
                display: "flex",
                flexDirection: "column",
                gap: "32px",
              }}
            >
              {/* Contact Details Fieldset */}
              <fieldset
                style={{
                  border: "none",
                  margin: 0,
                  padding: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                }}
              >
                <legend
                  style={{
                    fontFamily: "var(--font-space-grotesk)",
                    fontWeight: 700,
                    fontSize: "16px",
                    color: "var(--midnight-navy)",
                    padding: "0 0 6px",
                  }}
                >
                  Contact details
                </legend>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                  <div>
                    <label
                      htmlFor="fullName"
                      style={{
                        display: "block",
                        fontFamily: "var(--font-inter)",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--muted-grey)",
                        marginBottom: "6px",
                      }}
                    >
                      Full name<span style={{ color: "var(--petrol-teal)" }}> *</span>
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      name="fullName"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        minHeight: "44px",
                        padding: "10px 14px",
                        border: "1px solid rgba(13, 27, 36, 0.2)",
                        borderRadius: "2px",
                        fontSize: "15px",
                        color: "var(--midnight-navy)",
                        background: "var(--warm-white)",
                        fontFamily: "var(--font-inter)",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="companyName"
                      style={{
                        display: "block",
                        fontFamily: "var(--font-inter)",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--muted-grey)",
                        marginBottom: "6px",
                      }}
                    >
                      Company (if applicable)
                    </label>
                    <input
                      id="companyName"
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleInputChange}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        minHeight: "44px",
                        padding: "10px 14px",
                        border: "1px solid rgba(13, 27, 36, 0.2)",
                        borderRadius: "2px",
                        fontSize: "15px",
                        color: "var(--midnight-navy)",
                        background: "var(--warm-white)",
                        fontFamily: "var(--font-inter)",
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                  <div>
                    <label
                      htmlFor="email"
                      style={{
                        display: "block",
                        fontFamily: "var(--font-inter)",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--muted-grey)",
                        marginBottom: "6px",
                      }}
                    >
                      Email<span style={{ color: "var(--petrol-teal)" }}> *</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        minHeight: "44px",
                        padding: "10px 14px",
                        border: "1px solid rgba(13, 27, 36, 0.2)",
                        borderRadius: "2px",
                        fontSize: "15px",
                        color: "var(--midnight-navy)",
                        background: "var(--warm-white)",
                        fontFamily: "var(--font-inter)",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      style={{
                        display: "block",
                        fontFamily: "var(--font-inter)",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--muted-grey)",
                        marginBottom: "6px",
                      }}
                    >
                      Phone<span style={{ color: "var(--petrol-teal)" }}> *</span>
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        minHeight: "44px",
                        padding: "10px 14px",
                        border: "1px solid rgba(13, 27, 36, 0.2)",
                        borderRadius: "2px",
                        fontSize: "15px",
                        color: "var(--midnight-navy)",
                        background: "var(--warm-white)",
                        fontFamily: "var(--font-inter)",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="location"
                    style={{
                      display: "block",
                      fontFamily: "var(--font-inter)",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--muted-grey)",
                      marginBottom: "6px",
                    }}
                  >
                    Location (city / state)
                  </label>
                  <input
                    id="location"
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      minHeight: "44px",
                      padding: "10px 14px",
                      border: "1px solid rgba(13, 27, 36, 0.2)",
                      borderRadius: "2px",
                      fontSize: "15px",
                      color: "var(--midnight-navy)",
                      background: "var(--warm-white)",
                      fontFamily: "var(--font-inter)",
                    }}
                  />
                </div>
              </fieldset>

              {/* Project Details Fieldset */}
              <fieldset
                style={{
                  border: "none",
                  margin: 0,
                  padding: 0,
                  paddingTop: "24px",
                  borderTop: "1px solid rgba(13, 27, 36, 0.1)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                }}
              >
                <legend
                  style={{
                    fontFamily: "var(--font-space-grotesk)",
                    fontWeight: 700,
                    fontSize: "16px",
                    color: "var(--midnight-navy)",
                    padding: "0 0 6px",
                  }}
                >
                  Project details
                </legend>

                <div>
                  <span
                    style={{
                      display: "block",
                      fontFamily: "var(--font-inter)",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--muted-grey)",
                      marginBottom: "8px",
                    }}
                  >
                    Classification
                  </span>
                  <div style={{ display: "flex", gap: "20px" }}>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontFamily: "var(--font-inter)",
                        fontSize: "14.5px",
                        color: "var(--midnight-navy)",
                        minHeight: "44px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="classification"
                        value="commercial"
                        checked={formData.classification === "commercial"}
                        onChange={handleInputChange}
                      />
                      Commercial / Industrial
                    </label>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontFamily: "var(--font-inter)",
                        fontSize: "14.5px",
                        color: "var(--midnight-navy)",
                        minHeight: "44px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="classification"
                        value="residential"
                        checked={formData.classification === "residential"}
                        onChange={handleInputChange}
                      />
                      Residential / Estate
                    </label>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                  <div>
                    <label
                      htmlFor="propertyType"
                      style={{
                        display: "block",
                        fontFamily: "var(--font-inter)",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--muted-grey)",
                        marginBottom: "6px",
                      }}
                    >
                      Property / site type
                    </label>
                    <select
                      id="propertyType"
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleInputChange}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        minHeight: "44px",
                        padding: "10px 14px",
                        border: "1px solid rgba(13, 27, 36, 0.2)",
                        borderRadius: "2px",
                        fontSize: "15px",
                        color: "var(--midnight-navy)",
                        background: "var(--warm-white)",
                        fontFamily: "var(--font-inter)",
                      }}
                    >
                      <option value="">Select...</option>
                      <option value="Factory / industrial">Factory / industrial</option>
                      <option value="Hotel">Hotel</option>
                      <option value="Office / commercial building">
                        Office / commercial building
                      </option>
                      <option value="Residential estate">Residential estate</option>
                      <option value="Single residential property">
                        Single residential property
                      </option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="projectType"
                      style={{
                        display: "block",
                        fontFamily: "var(--font-inter)",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--muted-grey)",
                        marginBottom: "6px",
                      }}
                    >
                      Project type
                    </label>
                    <select
                      id="projectType"
                      name="projectType"
                      value={formData.projectType}
                      onChange={handleInputChange}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        minHeight: "44px",
                        padding: "10px 14px",
                        border: "1px solid rgba(13, 27, 36, 0.2)",
                        borderRadius: "2px",
                        fontSize: "15px",
                        color: "var(--midnight-navy)",
                        background: "var(--warm-white)",
                        fontFamily: "var(--font-inter)",
                      }}
                    >
                      <option value="">Select...</option>
                      <option value="New installation">New installation</option>
                      <option value="System upgrade">System upgrade</option>
                      <option value="Storage addition">Storage addition</option>
                      <option value="Monitoring only">Monitoring only</option>
                      <option value="EV charging">EV charging</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                  <div>
                    <label
                      htmlFor="currentPower"
                      style={{
                        display: "block",
                        fontFamily: "var(--font-inter)",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--muted-grey)",
                        marginBottom: "6px",
                      }}
                    >
                      Current power situation
                    </label>
                    <select
                      id="currentPower"
                      name="currentPower"
                      value={formData.currentPower}
                      onChange={handleInputChange}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        minHeight: "44px",
                        padding: "10px 14px",
                        border: "1px solid rgba(13, 27, 36, 0.2)",
                        borderRadius: "2px",
                        fontSize: "15px",
                        color: "var(--midnight-navy)",
                        background: "var(--warm-white)",
                        fontFamily: "var(--font-inter)",
                      }}
                    >
                      <option value="">Select...</option>
                      <option value="Grid only">Grid only</option>
                      <option value="Generator-dependent">Generator-dependent</option>
                      <option value="Existing solar, underperforming">
                        Existing solar, underperforming
                      </option>
                      <option value="Existing solar, expanding">
                        Existing solar, expanding
                      </option>
                      <option value="No power infrastructure yet">
                        No power infrastructure yet
                      </option>
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="estimatedLoad"
                      style={{
                        display: "block",
                        fontFamily: "var(--font-inter)",
                        fontSize: "13px",
                        fontWeight: 600,
                        color: "var(--muted-grey)",
                        marginBottom: "6px",
                      }}
                    >
                      Estimated load / usage (if known)
                    </label>
                    <input
                      id="estimatedLoad"
                      type="text"
                      name="estimatedLoad"
                      placeholder="e.g. 40kW average"
                      value={formData.estimatedLoad}
                      onChange={handleInputChange}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        minHeight: "44px",
                        padding: "10px 14px",
                        border: "1px solid rgba(13, 27, 36, 0.2)",
                        borderRadius: "2px",
                        fontSize: "15px",
                        color: "var(--midnight-navy)",
                        background: "var(--warm-white)",
                        fontFamily: "var(--font-inter)",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <span
                    style={{
                      display: "block",
                      fontFamily: "var(--font-inter)",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--muted-grey)",
                      marginBottom: "8px",
                    }}
                  >
                    Product interest
                  </span>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                    {systemOptions.map((option) => (
                      <label
                        key={option}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          fontFamily: "var(--font-inter)",
                          fontSize: "13.5px",
                          color: "var(--midnight-navy)",
                          background: "var(--warm-white)",
                          border: "1px solid rgba(13, 27, 36, 0.15)",
                          borderRadius: "2px",
                          padding: "9px 14px",
                          minHeight: "44px",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedSystems.includes(option)}
                          onChange={() => handleSystemToggle(option)}
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              </fieldset>

              {/* Message & Preference Fieldset */}
              <fieldset
                style={{
                  border: "none",
                  margin: 0,
                  padding: 0,
                  paddingTop: "24px",
                  borderTop: "1px solid rgba(13, 27, 36, 0.1)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "18px",
                }}
              >
                <legend
                  style={{
                    fontFamily: "var(--font-space-grotesk)",
                    fontWeight: 700,
                    fontSize: "16px",
                    color: "var(--midnight-navy)",
                    padding: "0 0 6px",
                  }}
                >
                  Message &amp; preference
                </legend>

                <div>
                  <span
                    style={{
                      display: "block",
                      fontFamily: "var(--font-inter)",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--muted-grey)",
                      marginBottom: "8px",
                    }}
                  >
                    Preferred contact method
                  </span>
                  <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontFamily: "var(--font-inter)",
                        fontSize: "14.5px",
                        color: "var(--midnight-navy)",
                        minHeight: "44px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="contactMethod"
                        value="email"
                        checked={formData.contactMethod === "email"}
                        onChange={handleInputChange}
                      />
                      Email
                    </label>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontFamily: "var(--font-inter)",
                        fontSize: "14.5px",
                        color: "var(--midnight-navy)",
                        minHeight: "44px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="contactMethod"
                        value="phone"
                        checked={formData.contactMethod === "phone"}
                        onChange={handleInputChange}
                      />
                      Phone call
                    </label>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontFamily: "var(--font-inter)",
                        fontSize: "14.5px",
                        color: "var(--midnight-navy)",
                        minHeight: "44px",
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="contactMethod"
                        value="whatsapp"
                        checked={formData.contactMethod === "whatsapp"}
                        onChange={handleInputChange}
                      />
                      WhatsApp
                    </label>
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    style={{
                      display: "block",
                      fontFamily: "var(--font-inter)",
                      fontSize: "13px",
                      fontWeight: 600,
                      color: "var(--muted-grey)",
                      marginBottom: "6px",
                    }}
                  >
                    Anything else we should know?
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleInputChange}
                    style={{
                      width: "100%",
                      boxSizing: "border-box",
                      padding: "12px 14px",
                      border: "1px solid rgba(13, 27, 36, 0.2)",
                      borderRadius: "2px",
                      fontSize: "15px",
                      color: "var(--midnight-navy)",
                      background: "var(--warm-white)",
                      resize: "vertical",
                      fontFamily: "var(--font-inter)",
                    }}
                  />
                </div>
              </fieldset>

              {showError && (
                <p
                  role="alert"
                  style={{
                    margin: 0,
                    fontFamily: "var(--font-inter)",
                    fontSize: "13.5px",
                    color: "#8A2A1F",
                  }}
                >
                  Please complete your name, email and phone number so we can respond.
                </p>
              )}

              <button
                type="submit"
                style={{
                  alignSelf: "flex-start",
                  fontFamily: "var(--font-inter)",
                  fontSize: "15px",
                  fontWeight: 600,
                  color: "var(--midnight-navy)",
                  background: "var(--solar-amber)",
                  border: "none",
                  padding: "15px 32px",
                  borderRadius: "2px",
                  cursor: "pointer",
                  minHeight: "44px",
                  transition: "background 0.2s ease",
                }}
              >
                Submit Request
              </button>
            </form>
          ) : (
            <div
              style={{
                background: "#FFFFFF",
                border: "1px solid rgba(13, 27, 36, 0.1)",
                borderRadius: "2px",
                padding: "48px",
                textAlign: "left",
              }}
            >
              <h2
                style={{
                  margin: "0 0 12px",
                  fontFamily: "var(--font-space-grotesk)",
                  fontWeight: 700,
                  fontSize: "24px",
                  color: "var(--midnight-navy)",
                }}
              >
                Thank you, {formData.fullName}.
              </h2>
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-inter)",
                  fontSize: "15.5px",
                  lineHeight: "1.75",
                  color: "var(--muted-grey)",
                }}
              >
                Your request has been received. A member of the GreenNet team will
                contact you via your preferred method within one business day to discuss
                next steps.
              </p>
            </div>
          )}

          {/* Sidebar */}
          <aside style={{ position: "sticky", top: "100px", display: "flex", flexDirection: "column", gap: "24px" }}>
            <div
              style={{
                background: "var(--midnight-navy)",
                borderRadius: "2px",
                padding: "32px",
              }}
            >
              <h2
                style={{
                  margin: "0 0 20px",
                  fontFamily: "var(--font-space-grotesk)",
                  fontWeight: 700,
                  fontSize: "17px",
                  color: "var(--warm-white)",
                }}
              >
                What happens next
              </h2>
              <ol
                style={{
                  margin: 0,
                  padding: 0,
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <li style={{ display: "flex", gap: "12px" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-space-grotesk)",
                      fontWeight: 700,
                      fontSize: "13px",
                      color: "var(--solar-amber)",
                    }}
                  >
                    01
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "13.5px",
                      lineHeight: "1.6",
                      color: "var(--light-grey)",
                    }}
                  >
                    Our team reviews your submission
                  </span>
                </li>
                <li style={{ display: "flex", gap: "12px" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-space-grotesk)",
                      fontWeight: 700,
                      fontSize: "13px",
                      color: "var(--solar-amber)",
                    }}
                  >
                    02
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "13.5px",
                      lineHeight: "1.6",
                      color: "var(--light-grey)",
                    }}
                  >
                    We contact you to confirm details and, where useful, arrange a site
                    assessment
                  </span>
                </li>
                <li style={{ display: "flex", gap: "12px" }}>
                  <span
                    style={{
                      fontFamily: "var(--font-space-grotesk)",
                      fontWeight: 700,
                      fontSize: "13px",
                      color: "var(--solar-amber)",
                    }}
                  >
                    03
                  </span>
                  <span
                    style={{
                      fontFamily: "var(--font-inter)",
                      fontSize: "13.5px",
                      lineHeight: "1.6",
                      color: "var(--light-grey)",
                    }}
                  >
                    You receive a written proposal with system recommendation and timeline
                  </span>
                </li>
              </ol>
            </div>
            <div
              style={{
                border: "1px solid rgba(13, 27, 36, 0.1)",
                borderRadius: "2px",
                padding: "32px",
                background: "#FFFFFF",
              }}
            >
              <h2
                style={{
                  margin: "0 0 12px",
                  fontFamily: "var(--font-space-grotesk)",
                  fontWeight: 700,
                  fontSize: "16px",
                  color: "var(--midnight-navy)",
                }}
              >
                Prefer to talk directly?
              </h2>
              <p
                style={{
                  margin: "0 0 16px",
                  fontFamily: "var(--font-inter)",
                  fontSize: "14px",
                  color: "var(--muted-grey)",
                }}
              >
                Call or message us on WhatsApp during business hours.
              </p>
              <p
                style={{
                  margin: 0,
                  fontFamily: "var(--font-inter)",
                  fontSize: "14px",
                  color: "var(--midnight-navy)",
                }}
              >
                [Phone number pending approval]
                <br />
                [WhatsApp number pending approval]
              </p>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
