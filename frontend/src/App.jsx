import React, { useState } from "react";

function App() {
  const [formData, setFormData] = useState({
    age: "",
    home_country: "",
    destination_country: "",
    education: "",
    employment: "",
    monthly_income: "",
    travel_purpose: "",
    travel_history: "",
    criminal_record: "",
    english_level: "",
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // --------------------------------------------
  // HANDLE INPUT CHANGES
  // --------------------------------------------
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // --------------------------------------------
  // SUBMIT DATA TO BACKEND
  // --------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          age: Number(formData.age),
          monthly_income: Number(formData.monthly_income),
          travel_history: Number(formData.travel_history),
          criminal_record: Number(formData.criminal_record),
        }),
      });

      const data = await res.json();
      setResult(data);
    } catch (error) {
      console.error("Error:", error);
      alert("Server error, check backend.");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "30px", maxWidth: "600px", margin: "auto" }}>
      <h1>AI Visa Approval Predictor</h1>
      <p>Enter your details to estimate your visa approval chances.</p>

      {/* -------------------------------------------- */}
      {/* FORM */}
      {/* -------------------------------------------- */}
      <form onSubmit={handleSubmit}>
        <input
          name="age"
          placeholder="Age"
          type="number"
          value={formData.age}
          onChange={handleChange}
        />

        <input
          name="home_country"
          placeholder="Home Country"
          value={formData.home_country}
          onChange={handleChange}
        />

        <input
          name="destination_country"
          placeholder="Destination Country"
          value={formData.destination_country}
          onChange={handleChange}
        />

        <input
          name="education"
          placeholder="Education (HighSchool / Bachelors / Masters)"
          value={formData.education}
          onChange={handleChange}
        />

        <input
          name="employment"
          placeholder="Employment (Employed / Unemployed)"
          value={formData.employment}
          onChange={handleChange}
        />

        <input
          name="monthly_income"
          type="number"
          placeholder="Monthly Income"
          value={formData.monthly_income}
          onChange={handleChange}
        />

        <input
          name="travel_purpose"
          placeholder="Purpose (Study / Work / Tourist / Business)"
          value={formData.travel_purpose}
          onChange={handleChange}
        />

        <input
          name="travel_history"
          type="number"
          placeholder="Past Trips Count"
          value={formData.travel_history}
          onChange={handleChange}
        />

        <select name="criminal_record" value={formData.criminal_record} onChange={handleChange}>
          <option value="">Criminal Record?</option>
          <option value="0">No Criminal Record</option>
          <option value="1">Has Criminal Record</option>
        </select>

        <input
          name="english_level"
          placeholder="English Level (Low / Medium / High)"
          value={formData.english_level}
          onChange={handleChange}
        />

        <button type="submit" disabled={loading}>
          {loading ? "Analyzing..." : "Predict Visa"}
        </button>
      </form>

      {/* -------------------------------------------- */}
      {/* RESULT DISPLAY */}
      {/* -------------------------------------------- */}
      {result && (
        <div style={{ marginTop: "30px", padding: "20px", border: "1px solid #ccc" }}>
          <h2>Status: {result.status}</h2>
          <p><b>Approval Probability:</b> {result.approval_probability}%</p>
          <p><b>Profile Strength:</b> {result.profile_strength_score}/100</p>

          {/* REJECTION REASONS */}
          {result.rejection_reasons.length > 0 && (
            <>
              <h3>Rejection Reasons:</h3>
              <ul>
                {result.rejection_reasons.map((reason, index) => (
                  <li key={index}>{reason}</li>
                ))}
              </ul>
            </>
          )}

          {/* ALTERNATE COUNTRIES WITH PERCENTAGES */}
          {result.alternate_country_suggestions.length > 0 && (
            <>
              <h3>Better Alternate Countries (with estimated approval %):</h3>
              <ul>
                {result.alternate_country_suggestions.map((c, index) => (
                  <li key={index}>
                    {c.country} — <b>{c.estimated_probability}%</b>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
