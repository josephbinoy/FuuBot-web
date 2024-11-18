import {
    Card,
    CardBody
  } from "@material-tailwind/react";
// import Chart from "react-apexcharts";
import Spinner from "./CustomSpinner";
import  { Suspense, lazy } from "react";
  const Chart = lazy(() => import("react-apexcharts"));
  const labels = [
    "1", "1.5", "2", "2.5", "3", "3.5", "4", "4.5", "5", "5.5",
    "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10"
  ]
   
  const chartConfig = {
    type: "line",
    height: 400,
    series: [
      {
        name: "‎ 4.5 - 6* Lobby‎ ‎ ‎ ",
        data: [7.49, 6.06, 5.35, 5.33, 5.30, 5.28, 5.24, 5.21, 5.17, 5.12, 5.06, 5.00, 4.92, 4.83, 4.71, 4.55, 4.35, 4.07, 3.64],
      },
      {
        name: "‎ 5 - 6.5* Lobby",
        data: [9.31, 7.54, 6.65, 6.62, 6.59, 6.56, 6.52, 6.47, 6.42, 6.36, 6.30, 6.22, 6.12, 6.00, 5.85, 5.66, 5.4, 5.05, 4.52],
      },
    ],
    options: {
      chart: {
        toolbar: {
          show: false,
        },
      },
      legend: {
        color: "#d1d5db",
        fontSize: '14px',
        fontFamily: 'inherit',
        fontWeight: 600,
        labels: {
          useSeriesColors: true
        },
        onItemClick: {
          toggleDataSeries: false
        },
      },
      colors: ["#eded8a", "#f09c78"],
      stroke: {
        lineCap: "round",
        curve: "monotoneCubic",
      },
      markers: {
        size: 0,
      },
      xaxis: {
        axisTicks: {
          show: false,
        },
        axisBorder: {
          show: false,
        },
        labels: {
          style: {
            colors: "#d1d5db",
            fontSize: "12px",
            fontFamily: "inherit",
            fontWeight: 600,
          },
          formatter: function(value) {
            if (value % 1 === 0)
              return value;
            else
              return "";
          }
        },
        categories: labels,
        tooltip: {
            enabled: false,
        },
        crosshairs: {
            show: false,
        },
        title: {
            text: "Map Length (Minutes)",
            offsetX: 0,
            offsetY: 0,
            style: {
                color: "#d1d5db",
                fontSize: '12px',
                fontFamily: 'inherit',
                fontWeight: 600,
            },
        },
      },
      yaxis: {
        labels: {
          style: {
            colors: "#d1d5db",
            fontSize: "12px",
            fontFamily: "inherit",
            fontWeight: 400,
          },
        },
        title: {
            text: "Stamina Limit (CPS)",
            offsetX: -5,
            offsetY: 0,
            style: {
                color: "#d1d5db",
                fontSize: '12px',
                fontFamily: 'inherit',
                fontWeight: 600
            },
        },
      },
      grid: {
        show: true,
        borderColor: "#868ba4",
        strokeDashArray: 5,
        xaxis: {
          lines: {
            show: true,
          },
        },
        padding: {
          top: 5,
          right: 20,
        },
      },
      fill: {
        opacity: 1,
      },
      tooltip: {
        theme: false,
        custom: function({series, seriesIndex, dataPointIndex, w}) {
          const length = labels[dataPointIndex];       
          const firstObjectCount=Math.floor(series[1][dataPointIndex]*(length)*60);
          const secondObjectCount=Math.floor(series[0][dataPointIndex]*(length)*60);
          return `
            <div class="chart_tooltip">
              <p>Stamina Limit (${length%1==0?length: Math.floor(length)+':30'} min)</p>
              <p><span class="second">${series[1][dataPointIndex]} CPS (${firstObjectCount} objects)</span></p>
              <p><span class="first">${series[0][dataPointIndex]} CPS (${secondObjectCount} objects)</span></p>
            </div>
          `;
          }
        }
    },
  };
   
  export default function StaminaChart() {
    return (
      <Card className="w-11/12 mx-auto mt-10">
        <CardBody className="px-7 pb-0 bg-osuslate-900 rounded-lg">
          <Suspense fallback={<Spinner />}>
            <Chart {...chartConfig} />
          </Suspense>
        </CardBody>
      </Card>
    );
  }