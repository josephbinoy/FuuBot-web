import {
    Card,
    CardBody
  } from "@material-tailwind/react";
  import Chart from "react-apexcharts";
   
  const chartConfig = {
    type: "line",
    height: 400,
    series: [
      {
        name: "‎ 4.5 - 6* Lobby‎ ‎ ‎ ",
        data: [7.49, 5.35, 5.30, 5.24, 5.17, 5.06, 4.92, 4.71, 4.35, 3.64],
      },
      {
        name: "‎ 5 - 6.5* Lobby",
        data: [9.31, 6.65, 6.59, 6.52, 6.42, 6.30, 6.12, 5.85, 5.4, 4.52],
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
        },
        categories: [
          "1",
          "2",
          "3",
          "4",
          "5",
          "6",
          "7",
          "8",
          "9",
          "10"
        ],
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
          const firstObjectCount=Math.floor(series[1][dataPointIndex]*(dataPointIndex+1)*60);
          const secondObjectCount=Math.floor(series[0][dataPointIndex]*(dataPointIndex+1)*60);
          return `
            <div class="chart_tooltip">
              <p>Stamina Limit (${dataPointIndex+1} min)</p>
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
      <Card className="w-8/12 mx-auto my-10">
        <CardBody className="px-7 pb-0 bg-osuslate-800">
          <Chart {...chartConfig} />
        </CardBody>
      </Card>
    );
  }