export default function CustomSpinner() {
    const spinnerStyle = {
      transformOrigin: 'center',
      animation: 'spinner 0.75s infinite linear'
    };
  
    return (
      <svg
        width="36"
        height="36"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <style>
          {`
            @keyframes spinner {
              100% {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
        <circle
          cx="12"
          cy="12"
          r="8"
          fill="none"
          stroke="#868ba4"
          strokeWidth="3"
          strokeDasharray="50"
          strokeDashoffset="12"
          style={spinnerStyle}
        />
      </svg>
    );
  }
  