// src/utils/toast.js
import toast from "react-hot-toast";

export const showErrorToast = (message) => {
  toast.error(message, {
    duration: 4000,
    position: "top-center",
    style: {
      background: "linear-gradient(135deg, #1a0b2e 0%, #2a1b3d 100%)",
      color: "#fff",
      padding: "16px 24px",
      borderRadius: "16px",
      border: "1px solid rgba(168, 85, 247, 0.3)",
      backdropFilter: "blur(12px)",
      boxShadow: "0 8px 32px rgba(168, 85, 247, 0.2)",
      fontSize: "14px",
      fontWeight: "500",
    },
    icon: "⚠️",
  });
};

export const showSuccessToast = (message) => {
  toast.success(message, {
    duration: 3000,
    position: "top-center",
    style: {
      background: "linear-gradient(135deg, #1a0b2e 0%, #2a1b3d 100%)",
      color: "#fff",
      padding: "16px 24px",
      borderRadius: "16px",
      border: "1px solid rgba(236, 72, 153, 0.3)",
      backdropFilter: "blur(12px)",
      boxShadow: "0 8px 32px rgba(236, 72, 153, 0.2)",
      fontSize: "14px",
      fontWeight: "500",
    },
    icon: "✨",
  });
};
