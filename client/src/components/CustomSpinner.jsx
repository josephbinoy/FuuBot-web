// export default function CustomSpinner() {
//   const spinnerStyle = {
//     transformOrigin: 'center',
//     animation: 'spinner 0.75s infinite linear'
//   };

//   return (
//     <svg width="30" height="30" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
//       <style>
//         {`
//           @keyframes spinner {
//             100% {
//               transform: rotate(360deg);
//             }
//           }
//         `}
//       </style>
//       <path d="M12,4a8,8,0,0,1,7.89,6.7A1.53,1.53,0,0,0,21.38,12h0a1.5,1.5,0,0,0,1.48-1.75,11,11,0,0,0-21.72,0A1.5,1.5,0,0,0,2.62,12h0a1.53,1.53,0,0,0,1.49-1.3A8,8,0,0,1,12,4Z" style={spinnerStyle} fill="#868ba4" />
//     </svg>
//   );
// }

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
  