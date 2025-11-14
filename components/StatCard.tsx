
import React from 'react';

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative';
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, change, changeType }) => {
  const changeColor = changeType === 'positive' ? 'text-green-500' : 'text-red-500';

  return (
    <div className="p-6 bg-white rounded-xl shadow-md flex items-center space-x-6">
      <div className="flex-shrink-0 p-4 bg-brand-primary/10 rounded-full">
        {icon}
      </div>
      <div>
        <p className="text-xl font-bold text-brand-dark">{value}</p>
        <p className="text-gray-500">{title}</p>
        {change && (
          <p className={`text-sm font-medium ${changeColor}`}>
            {change}
          </p>
        )}
      </div>
    </div>
  );
};

export default StatCard;
