import React, { act } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
 
import { ThemeProvider } from "@material-tailwind/react";

const theme = {
  navbar: {
    styles: {
      variants: {
        filled: {
          "blue-gray": {
            background: "bg-osuslate-200",
            color: "text-osuslate-100",
          }
        },
      },
    },
  },
  typography: {
    styles: {
      colors: {
        "blue-gray": {
          gradient: "opacity-60 bg-gradient-to-tr from-glow-300 via-glow-200 to-glow-300 hover:text-shadow-yellow-glow",
        },
      },
    },
  },
  button: {
    styles: {
      base: {
        initial: {
          fontFamily: "font-visby",
          fontWeight: "font-bold",
          textTransform: "lowercase",
          transition: "transition-all",
          disabled: "disabled:opacity-50 disabled:shadow-none disabled:pointer-events-none",
        },
      },
      variants: {
        filled: {
          "blue-gray": {
            background: "bg-osuslate-500",
            color: "text-osuslate-100",
            shadow: "",
            hover: {
              color: "hover:text-osuslate-50",
            },
            active: {
              color: "active:text-osuslate-50",
            },
            focus: {
              color: "focus:text-white focus:-translate-y-px",
            },
          },
        },
        text: {
          "blue-gray": {
            color: "text-blue-gray-500",
          },
        }
      },
    },
  },
  buttonGroup: {
    styles: {
      dividerColor: {
        "blue-gray": {
          divideColor: "divide-osuslate-50 divide-opacity-40",
        },
      },
    },
  },
};
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider value={theme}>
      <App />
    </ThemeProvider>
  </React.StrictMode>
);