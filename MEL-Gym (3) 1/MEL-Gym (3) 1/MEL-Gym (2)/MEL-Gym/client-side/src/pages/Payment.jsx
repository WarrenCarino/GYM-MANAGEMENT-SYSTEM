import React, { useState, useRef } from "react";

function Payment() {
  const [selectedPlan, setSelectedPlan] = useState("Premium");
  const [confirmedPlan, setConfirmedPlan] = useState("Premium");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [transactionDate, setTransactionDate] = useState("");
  const [showThankYou, setShowThankYou] = useState(false); // ✅ new state
  const receiptRef = useRef(null);

  const plans = [
    { name: "Basic", price: 20 },
    { name: "Premium", price: 50 },
    { name: "VIP", price: 80 },
  ];

  const handleSelect = (plan) => {
    setSelectedPlan(plan.name);
  };

  const handleConfirm = () => {
    setConfirmedPlan(selectedPlan);
    setReferenceNumber(Math.random().toString(36).substr(2, 9).toUpperCase());
    setTransactionDate(
      new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    );
    setShowThankYou(false); // hide thank you until Confirm Payment is pressed
  };

  const handlePrint = () => {
    setShowThankYou(true); // ✅ show thank-you message
    setTimeout(() => {
      window.print(); // then print
    }, 300); // small delay so it renders first
  };

  const selected = plans.find((plan) => plan.name === confirmedPlan);

  return (
    <div className="payment-page">
      <div className="payment-wrapper">
        {/* Header */}
        <div className="payment-header">
          <h1 className="payment-main-title">Payment</h1>
        </div>

        <div className="payment-content">
          {/* Choose Plan Section */}
          <div className="payment-section">
            <h2 className="section-title">Choose Membership Plan</h2>

            <div className="plan-options">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`plan-box ${
                    selectedPlan === plan.name ? "selected" : ""
                  }`}
                  onClick={() => handleSelect(plan)}
                >
                  <h3>{plan.name}</h3>
                  <p>${plan.price.toFixed(2)}</p>
                </div>
              ))}
            </div>

            <div className="button-group">
              <button className="confirm-btn" onClick={handleConfirm}>
                Confirm
              </button>
              <button className="cancel-btn">Cancel</button>
            </div>
          </div>

          {/* Payment Receipt Section */}
          <div className="payment-section" ref={receiptRef}>
            <div className="receipt-logo">
              <img
                src="1.png"
                alt="Company Logo"
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.parentElement.innerHTML =
                    '<div style="font-size: 2rem; font-weight: bold; color: #CA972D;">Your Company</div>';
                }}
              />
            </div>

            <h2 className="section-title">Payment Receipt</h2>

            <div className="receipt-info">
              <div className="receipt-row">
                <span className="receipt-label">Reference Number</span>
                <span className="receipt-value">#{referenceNumber}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Membership Type</span>
                <span className="receipt-value">{selected.name}</span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Amount</span>
                <span className="receipt-value">
                  ${selected.price.toFixed(2)}
                </span>
              </div>
              <div className="receipt-row">
                <span className="receipt-label">Date</span>
                <span className="receipt-value">{transactionDate}</span>
              </div>
            </div>

            {/* ✅ Show only AFTER clicking Confirm Payment */}
            {showThankYou && (
              <div className="receipt-footer">
                <p>Thank you for your payment!</p>
                <p>This is an official receipt of your transaction.</p>
              </div>
            )}

            <div className="button-group">
              <button className="confirm-pay-btn" onClick={handlePrint}>
                <span>✓</span> Confirm Payment
              </button>
              <button className="back-btn">
                <span>↩</span> Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Payment;
