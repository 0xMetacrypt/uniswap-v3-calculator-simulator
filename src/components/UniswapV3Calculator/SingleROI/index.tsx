import { FC } from "react";

import { classNames } from "@/utils/tailwind";

interface ISingleROI {
  title: string;
  primary: number;
  percentage: number;
}

export const SingleROI: FC<ISingleROI> = ({ title, primary, percentage }) => (
  <div className="rounded-md border border-gray-200 p-4">
    <div className="text-xs text-gray-500">{title}</div>
    <div className="text-3xl">
      ${(primary || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
    </div>
    <span className={classNames("rounded-full px-2 py-0.5 text-xs font-bold uppercase", "bg-green-100 text-green-600")}>
      {(percentage || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%
    </span>
  </div>
);
