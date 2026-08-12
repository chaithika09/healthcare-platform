import React, { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// PaymentPage: Payment step removed — redirect straight to appointment confirmation
export default function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Skip payment entirely — go straight to appointment confirmation
    navigate("/appointment-confirm", { replace: true, state: location.state });
  }, [navigate, location.state]);

  return null;
}
