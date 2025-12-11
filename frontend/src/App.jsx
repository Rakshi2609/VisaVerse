import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Predict from "./pages/Predict";
import Assistant from "./pages/Assistant";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/predict" element={<Predict />} />
        <Route path="/assistant" element={<Assistant />} />
      </Routes>
      < Footer />
    </BrowserRouter>
  );
}
