
import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowUpIcon, ArrowDownIcon, ArrowRightIcon } from "lucide-react";

interface GenrePopularityStatsProps {
  data: {
    genre: string;
    count: number;
    trend: "up" | "down" | "stable";
  }[];
}

const GenrePopularityStats: React.FC<GenrePopularityStatsProps> = ({ data }) => {
  // Sort data by count in descending order
  const sortedData = [...data].sort((a, b) => b.count - a.count);

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
      case "down":
        return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return <ArrowRightIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Genre</TableHead>
            <TableHead className="text-right">Users</TableHead>
            <TableHead>Trend</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData.map((item) => (
            <TableRow key={item.genre}>
              <TableCell className="font-medium">{item.genre}</TableCell>
              <TableCell className="text-right">{item.count}</TableCell>
              <TableCell>{getTrendIcon(item.trend)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default GenrePopularityStats;
