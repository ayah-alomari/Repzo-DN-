import React from "react";
import { ChevronsRight, Printer, MoreHorizontal, Filter, MoreVertical } from "lucide-react";

type QuickFilter = "all" | "pending" | "failed";

interface BulkActionBarProps {
  onCheckAll?: (checked: boolean) => void;
  isAllChecked?: boolean;
  showCreditNoteAction?: boolean;
  activeFilter?: QuickFilter;
  onFilterChange?: (filter: QuickFilter) => void;
  selectedCount?: number;
  onBulkTransfer?: () => void;
  canBulkTransfer?: boolean;
}

export function BulkActionBar({ onCheckAll, isAllChecked, showCreditNoteAction, activeFilter = "all", onFilterChange, selectedCount = 0, onBulkTransfer, canBulkTransfer = true }: BulkActionBarProps) {
  const tabs: { key: QuickFilter; label: string }[] = [
    { key: "all",     label: "All" },
    { key: "pending", label: "Waiting for Transfer" },
    { key: "failed",  label: "Canceled" },
  ];

  return (
    <div className="flex items-center justify-between mb-4 bg-white border border-gray-100 rounded-[8px] p-1.5 shadow-sm">
      <div className="flex items-center gap-4">
        {/* Segmented Control */}
        {onFilterChange && (
          <div className="flex items-center bg-white border border-gray-100 rounded-[6px] overflow-hidden shadow-sm">
            {tabs.map((tab, i) => (
              <button
                key={tab.key}
                onClick={() => onFilterChange(tab.key)}
                className={`px-5 py-1.5 text-[12px] font-semibold transition-colors ${i > 0 ? "border-l border-gray-100" : ""} ${
                  activeFilter === tab.key
                    ? "bg-[#e8a0fa] text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Check All */}
        <label className="flex items-center gap-2 cursor-pointer ml-1">
          <div className="relative flex items-center justify-center w-[15px] h-[15px] bg-[#a855f7] rounded-[3px]">
            <div className="w-1.5 h-1.5 bg-white rounded-[1px]" />
            <input
              type="checkbox"
              className="absolute opacity-0 cursor-pointer w-full h-full"
              checked={isAllChecked || false}
              onChange={(e) => onCheckAll && onCheckAll(e.target.checked)}
            />
          </div>
          <span className="text-[13px] font-medium text-[#4a4a5a] pt-0.5">Check All</span>
        </label>
      </div>

      <div className="flex items-center gap-2 pr-1">
        {showCreditNoteAction && (
          <button className="flex items-center gap-2 px-3 py-1.5 border border-indigo-200 bg-indigo-50 rounded-[6px] text-[12px] font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors">
            Generate Bulk Credit Notes
          </button>
        )}
        <button
          onClick={onBulkTransfer}
          disabled={!selectedCount || !canBulkTransfer}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-semibold transition-colors ${
            selectedCount && canBulkTransfer
              ? "bg-[#1a1a2e] text-white border border-[#1a1a2e] hover:bg-[#111827] shadow-sm"
              : "border border-gray-200 text-[#4a4a5a] opacity-40 cursor-not-allowed"
          }`}
        >
          <ChevronsRight className="w-3.5 h-3.5" />
          Confirm Transfer
          {selectedCount > 0 && (
            <span className="ml-0.5 bg-white/25 rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none">
              {selectedCount}
            </span>
          )}
        </button>
        <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-[6px] text-[12px] font-medium text-[#4a4a5a] hover:bg-gray-50 transition-colors">
          <Printer className="w-3.5 h-3.5 text-gray-400" /> Print
        </button>
        <button className="flex items-center justify-center px-1.5 py-1.5 border border-gray-200 rounded-[6px] text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
        <button className="flex items-center justify-center w-7 h-7 border border-gray-200 rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors ml-1">
          <MoreVertical className="w-3.5 h-3.5" />
        </button>
        <button className="flex items-center justify-center w-8 h-8 bg-[#4f6ef7] hover:bg-[#3b5bdb] rounded-full text-white shadow-sm transition-colors ml-1">
          <Filter className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
