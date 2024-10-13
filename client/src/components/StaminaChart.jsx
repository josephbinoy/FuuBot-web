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
        name: "Stamina Limit",
        data: [9.31, 6.65, 6.59, 6.52, 6.30, 5.85, 4.52],
      },
    ],
    options: {
      chart: {
        toolbar: {
          show: false,
        },
      },
      dataLabels: {
        enabled: false,
        style: {
          colors: ["#232732"],
        },
      },
      colors: ["#eaeac2"],
      stroke: {
        lineCap: "round",
        curve: "smooth",
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
          "6",
          "8",
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
            return '<div class="chart_tooltip">' +
                '<span>Stamina Limit</span>' +
                '<span>' + series[seriesIndex][dataPointIndex] + ' CPS </span>' +
                '</div>'
            }
        },
        marker: {
        show: false,
        },
        dropShadow: {
            enabled: false
        }
    },
  };
   
  export default function StaminaChart() {
    return (
      <Card className="w-8/12 mx-auto">
        <CardBody className="px-7 pb-0 bg-osuslate-800">
          <Chart {...chartConfig} />
        </CardBody>
      </Card>
    );
  }