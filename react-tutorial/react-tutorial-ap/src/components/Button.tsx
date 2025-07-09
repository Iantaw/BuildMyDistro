import React, { useState } from "react";

interface Props {
  children: React.ReactNode;
}

const Alert = ({ onClose }: { onClose: () => void }) => (
  <div className="alert alert-primary alert-dismissible fade show" role="alert">
    Clicked
    <button
      type="button"
      className="btn-close"
      aria-label="Close"
      onClick={onClose}
    ></button>
  </div>
);

const Button = ({ children }: Props) => {
  const [showAlert, setShowAlert] = useState(false);

  return (
    <>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => setShowAlert(true)}
      >
        {children}
      </button>
      {showAlert && <Alert onClose={() => setShowAlert(false)} />}
    </>
  );
};

export default Button;
