import React, { useState } from 'react';
import { X } from 'lucide-react';

interface TableDialogProps {
  onClose: () => void;
  onInsert: (rows: number, cols: number, withHeader: boolean, borderStyle: string) => void;
}

export function TableDialog({ onClose, onInsert }: TableDialogProps) {
  const [rows, setRows] = useState(3);
  const [cols, setCols] = useState(3);
  const [withHeader, setWithHeader] = useState(true);
  const [borderStyle, setBorderStyle] = useState('thin');

  const handleNumberInput = (value: string, setter: (value: number) => void) => {
    const num = parseInt(value);
    if (!isNaN(num) && num >= 1 && num <= 10) {
      setter(num);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onInsert(rows, cols, withHeader, borderStyle);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Insert Table</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rows
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={rows}
                onChange={(e) => handleNumberInput(e.target.value, setRows)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-nexius-teal focus:border-nexius-teal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Columns
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={cols}
                onChange={(e) => handleNumberInput(e.target.value, setCols)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-nexius-teal focus:border-nexius-teal"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Border Style
            </label>
            <select
              value={borderStyle}
              onChange={(e) => setBorderStyle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-nexius-teal focus:border-nexius-teal"
            >
              <option value="thin">Thin</option>
              <option value="medium">Medium</option>
              <option value="thick">Thick</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="withHeader"
              checked={withHeader}
              onChange={(e) => setWithHeader(e.target.checked)}
              className="h-4 w-4 text-nexius-teal focus:ring-nexius-teal border-gray-300 rounded"
            />
            <label htmlFor="withHeader" className="ml-2 text-sm text-gray-700">
              Include header row
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-nexius-teal text-white rounded-lg hover:bg-nexius-teal/90"
            >
              Insert Table
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}