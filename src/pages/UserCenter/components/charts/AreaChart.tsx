import styles from "./areaChart.module.scss";
import React from "react";
import {
    AreaChart,
    Area,
    // XAxis,
    // YAxis,
    // CartesianGrid,
    Tooltip,
} from "recharts";


interface chartDataType {
    balance: string,
    time: string,
    recharge: string,
    symbol: string
}
type propsType = {
    chartData: chartDataType[]
}
// 自定义 Tooltip 组件
const CustomTooltip: React.FC<any> = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    return (
        <div
            className={`font-12 ${styles.area_tooltip}`}
        >
            <p >{payload[0].payload.time}</p>
            <p >
                <span
                    className={`mr-1 ${styles.tooltip_circle}`}
                />
                {payload[0].payload.symbol}&nbsp;{payload[0].payload.balance}</p>
        </div>
    );
};

const AssetsAreaChart: React.FC<propsType> = ({ chartData }) => {
    return (
        <AreaChart
            width={120}
            height={57}
            data={chartData}
            margin={{
                top: 5,
                right: 0,
                left: 0,
                bottom: 0,
            }}
            className={styles.chartBox}
        >
            {/* <CartesianGrid strokeDasharray="3 3" /> */}
            {/* <XAxis dataKey="name" />
            <YAxis /> */}
            <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--theme-color)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--theme-color)" stopOpacity={0} />
                </linearGradient>
            </defs>
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="balance" stroke="var(--theme-color)"
                fill="url(#gradient)" />
        </AreaChart>
    );
};

export default AssetsAreaChart;