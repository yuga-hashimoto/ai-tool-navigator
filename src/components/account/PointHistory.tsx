import { PointTransaction } from '@prisma/client';

interface PointHistoryProps {
  transactions: PointTransaction[];
}

export default function PointHistory({ transactions }: PointHistoryProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
        No point history yet.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Points</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {transactions.map((tx) => (
            <tr key={tx.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {new Date(tx.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">
                {tx.description}
              </td>
              <td className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${tx.amount > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {tx.amount > 0 ? '+' : ''}{tx.amount}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
