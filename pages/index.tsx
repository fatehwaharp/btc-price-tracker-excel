import * as React from "react";
import { GetStaticPropsResult, InferGetStaticPropsType } from "next";
import type { ChartOptions } from "chart.js";
import {
  Chart as ChartJS,
  CategoryScale,
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import "chartjs-adapter-date-fns";
import { Line } from "react-chartjs-2";
import { format } from "date-fns";
import StyledButton from "../components/StyledButton";

interface BtcDataLog {
  date: string;
  price: number;
  dominance: number;
}

interface HomeProps {
  fiveMinutes: BtcDataLog[];
  oneHour: BtcDataLog[];
  oneDay: BtcDataLog[];
  lastFetchedAt: string;
}

interface BtcPriceLog {
  range: string;
  majorDimension: string;
  values: string[][];
}

export default function Home({
  fiveMinutes,
  oneHour,
  oneDay,
  lastFetchedAt,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  ChartJS.register(
    CategoryScale,
    LinearScale,
    TimeScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );
  const [duration, setDuration] = React.useState("1d");

  const fiveMinutesBtcPriceDataSets = fiveMinutes.map((data) => {
    return {
      x: data.date,
      y: data.price,
    };
  });

  const fiveMinutesDominanceDataSets = fiveMinutes.map((data) => {
    return {
      x: data.date,
      y: data.dominance,
    };
  });

  const oneHourBtcPriceDataSets = oneHour.map((data) => {
    return {
      x: data.date,
      y: data.price,
    };
  });

  const oneHourDominanceeDataSets = oneHour.map((data) => {
    return {
      x: data.date,
      y: data.dominance,
    };
  });

  const oneDayBtcPriceDataSets = oneDay.map((data) => {
    return {
      x: data.date,
      y: data.price,
    };
  });

  const oneDayDominanceDataSets = oneDay.map((data) => {
    return {
      x: data.date,
      y: data.dominance,
    };
  });

  const lastRowUpdatedAt = format(
    new Date(fiveMinutes[fiveMinutes.length - 1].date),
    "dd MMM yyyy HH:mm:ss"
  );

  const options: ChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: "Bitcoin price tracker",
      },
    },
    scales: {
      x: {
        type: "time",
        time: {
          unit: duration === "1d" ? "day" : "hour",
        },
        grid: {
          display: false,
        },
        ticks: {
          color: "rgba(109,104,117,1)",
          major: {
            enabled: true,
          },
          font: (ctx: any) => {
            const boldedTicks = ctx.tick && ctx.tick.major ? "bold" : "";
            return { weight: boldedTicks };
          },
        },
      },
      y: {
        type: "linear" as const,
        display: true,
        position: "left" as const,
      },
      y1: {
        type: "linear" as const,
        display: true,
        position: "right" as const,
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  } as any;

  const data = {
    datasets: [
      {
        label: "Bitcoin price",
        fill: true,
        data:
          duration === "5m"
            ? fiveMinutesBtcPriceDataSets
            : duration === "1h"
            ? oneHourBtcPriceDataSets
            : oneDayBtcPriceDataSets,
        borderColor: "rgba(242,204,143,1)",
        backgroundColor: "rgba(229,152,155,1)",
        borderWidth: duration === "5m" ? 2 : 3,
        pointRadius: duration === "5m" ? 1 : 2,
        yAxisID: "y",
      },
      {
        label: "Dominance",
        data:
          duration === "5m"
            ? fiveMinutesDominanceDataSets
            : duration === "1h"
            ? oneHourDominanceeDataSets
            : oneDayDominanceDataSets,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
        borderWidth: duration === "5m" ? 2 : 3,
        pointRadius: duration === "5m" ? 1 : 2,
        yAxisID: "y1",
      },
    ],
  };

  return (
    <div className="container mx-auto mt-[50px]">
      <div className="w-full md:w-8/12 mx-auto">
        <Line options={options} data={data} />
        <div className="flex flex-col gap-2 items-center justify-center mt-5">
          <p className="text-sm text-gray-500">Filter duration</p>
          <div className="flex gap-1">
            <StyledButton
              selected={duration === "5m"}
              onClick={() => setDuration("5m")}
            >
              5m
            </StyledButton>
            <StyledButton
              selected={duration === "1h"}
              onClick={() => setDuration("1h")}
            >
              1h
            </StyledButton>
            <StyledButton
              selected={duration === "1d"}
              onClick={() => setDuration("1d")}
            >
              24h
            </StyledButton>
          </div>
          <p className="text-sm text-gray-400 italic mt-2">
            Last updated at: {lastRowUpdatedAt}
          </p>
          <p className="text-xs text-gray-300 italic">
            Last fetched at: {lastFetchedAt}
          </p>
        </div>
      </div>
    </div>
  );
}

export async function getStaticProps(): Promise<
  GetStaticPropsResult<HomeProps>
> {
  // General settings
  const googleSheetsTabName = "btc_price_log";
  const googleSheetsId = "1x6e3sVeWdv-E0czCTp3tGrmuAxrkyWR_HSLMnHKPNK0";
  const firstDateEntryTimestamp = "2021-10-08T12:23:02.000Z"; // First date from the google sheet

  const latestRowNumber = rowNumberApprox(firstDateEntryTimestamp) + 63;
  const fromRowNumber = getFromRowNumber(latestRowNumber, 4);

  const response = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${googleSheetsId}/values/${googleSheetsTabName}!A${fromRowNumber}:C?key=${process.env.GSHEETS_API_KEY}`
  );
  const data: BtcPriceLog = await response.json();

  const checkDate = data.values.slice(0, 5);

  const rowNeedToRemoved = rowsNeedtoBeRemoved(checkDate, 4);

  const btcPriceLog = data.values.slice(rowNeedToRemoved);

  const btcLog = btcPriceLog.map((crypto) => {
    return {
      date: crypto[0],
      price: parseFloat(crypto[1]),
      dominance: parseFloat(crypto[2]),
    };
  });

  return {
    props: {
      fiveMinutes: btcLog,
      oneHour: btcLog.filter((_, index) => (index + 1) % 12 === 0),
      oneDay: [
        btcLog[0],
        ...btcLog.filter((_, index) => (index + 1) % 288 === 0),
      ],
      lastFetchedAt: format(new Date(), "dd MMM yyyy HH:mm:ss"),
    },
    revalidate: 300,
  };
}

const rowNumberApprox = (date: string) => {
  const startDate = new Date(date);
  const currentDate = new Date();

  const diffInMilliseconds = currentDate.getTime() - startDate.getTime();
  const diffInMinutes = diffInMilliseconds / 60000;

  return Math.floor(diffInMinutes / 5);
};

const rowsNeedtoBeRemoved = (dates: string[][], daysBefore: number = 4) => {
  const today = new Date();
  let fourDaysBefore = String(today.getDate() - daysBefore).padStart(2, "0");
  let month = String(today.getMonth() + 1).padStart(2, "0");
  let year = today.getFullYear();

  const dateBefore = `${year}-${month}-${fourDaysBefore}T00:00:00.000Z`;

  let count = 0;
  dates.forEach((date, index) => {
    if (new Date(date[0]) < new Date(dateBefore)) {
      count++;
    }
  });
  return count;
};

const getFromRowNumber = (latestRowNumber: number, daysBefore: number = 4) => {
  const today = new Date();
  let day = String(today.getDate()).padStart(2, "0");
  let month = String(today.getMonth() + 1).padStart(2, "0");
  let year = today.getFullYear();

  const todayStart = `${year}-${month}-${day}T00:00:00.000Z`;
  const todayRowsNumber = rowNumberApprox(todayStart);

  const fourDaysRowNumber = 288 * daysBefore;

  return latestRowNumber - (fourDaysRowNumber + todayRowsNumber);
};
