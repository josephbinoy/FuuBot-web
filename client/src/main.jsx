import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter,  RouterProvider } from "react-router-dom";
import Beatmaps from "./Beatmaps";
import Blacklist from "./Blacklist";
import History from "./History";
import "./index.css";
 
import { ThemeProvider } from "@material-tailwind/react";
import { DbvProvider } from "./context/DbvProvider";
import { AlertProvider } from "./context/AlertProvider";

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
          gradient: "bg-gradient-to-tr from-glow-300 via-glow-200 to-glow-300",
        },
      },
    },
  },
  alert: {
    styles: {
      base: {
        alert: {
          width: "w-fit",
          fontFamily: "font-visby",
          fontWeight: "font-bold",
          px: "px-4",
          py: "py-4",
          borderRadius: "rounded-lg",
        },
      },
      variants: {
        filled: {
          "blue-gray": {
            background: "bg-osuslate-200",
            color: "text-white",
          },
        }
      }
    }
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
            text: "text-xl",
            background: "bg-osuslate-500",
            color: "text-osuslate-100",
            shadow: "",
            hover: {
              color: "hover:text-osuslate-50",
            },
            active: {
              color: "",
            },
            focus: {
              color: "focus:text-white outline-none ",
            },
          },
        },
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

const router = createBrowserRouter([
  {
    path: "/",
    element: (<Beatmaps />),
  },
  {
    path: "blacklist",
    element: (<Blacklist />),
  },
  {
    path: "history/:beatmapId",
    element: (<History />),
  }
]);
ReactDOM.createRoot(document.getElementById("root")).render(
    <ThemeProvider value={theme}>
      <AlertProvider>
        <DbvProvider>
          <RouterProvider router={router} />
        </DbvProvider>
      </AlertProvider>
    </ThemeProvider>
);