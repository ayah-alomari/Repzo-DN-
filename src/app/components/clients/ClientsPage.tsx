import { useState, useMemo, useCallback } from "react";
import {
  ArrowLeft,
  Search,
  Download,
  Plus,
  SlidersHorizontal,
  LayoutGrid,
  Table2,
  Settings2,
  UserPlus,
  FileSpreadsheet,
  Columns3,
  Upload,
} from "lucide-react";
import { generateClients, ALL_COLUMNS } from "./clientData";
import type { Client } from "./clientData";
import { CardView } from "./CardView";
import { TableView } from "./TableView";
import { ClientTableDetail } from "./ClientTableDetail";
import { Pagination } from "./Pagination";
import { ColumnCustomizer } from "./ColumnCustomizer";

type ViewMode = "card" | "table";

const allClients = generateClients(1205);

export function ClientsPage({ onBack }: { onBack: () => void }) {
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  const [showFilters, setShowFilters] = useState(false);
  const [showColumnCustomizer, setShowColumnCustomizer] = useState(false);
  const [selectedTableClient, setSelectedTableClient] = useState<Client | null>(
    null
  );

  // Column management
  const [visibleColumns, setVisibleColumns] = useState<string[]>(
    ALL_COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key)
  );
  const [columnOrder, setColumnOrder] = useState<string[]>(
    ALL_COLUMNS.map((c) => c.key)
  );
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const w: Record<string, number> = {};
    ALL_COLUMNS.forEach((c) => (w[c.key] = c.width));
    return w;
  });

  const filteredClients = useMemo(
    () =>
      allClients.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const totalClients = filteredClients.length;
  const paginatedClients = useMemo(
    () => filteredClients.slice((page - 1) * perPage, page * perPage),
    [filteredClients, page, perPage]
  );

  const toggleColumn = useCallback((key: string) => {
    setVisibleColumns((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }, []);

  const resetColumns = useCallback(() => {
    setVisibleColumns(ALL_COLUMNS.filter((c) => c.defaultVisible).map((c) => c.key));
    setColumnOrder(ALL_COLUMNS.map((c) => c.key));
  }, []);

  const handleColumnResize = useCallback((key: string, width: number) => {
    setColumnWidths((prev) => ({ ...prev, [key]: width }));
  }, []);

  return (
    <div className="flex-1 flex flex-col min-h-0 min-w-0 bg-[#f5f5f7]">
      {/* Top Bar */}
      <div className="bg-white border-b border-[#e8e8ec] px-5 py-3">
        <div className="flex items-center justify-between">
          {/* Left side */}
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-1 text-[#8b8b9e] hover:text-[#4a4a5a] cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <h1 className="text-[18px] text-[#1a1a2e]" style={{ fontWeight: 600 }}>
              Clients
            </h1>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-0.5 bg-[#f5f5f7] rounded-md p-0.5 ml-2">
              <button
                onClick={() => setViewMode("card")}
                className={`p-1.5 rounded cursor-pointer transition-colors ${
                  viewMode === "card" ? "bg-white shadow-sm text-[#7c3aed]" : "text-[#8b8b9e]"
                }`}
                title="Card View"
              >
                <LayoutGrid size={15} />
              </button>
              <button
                onClick={() => { setViewMode("table"); setSelectedTableClient(null); }}
                className={`p-1.5 rounded cursor-pointer transition-colors ${
                  viewMode === "table" ? "bg-white shadow-sm text-[#7c3aed]" : "text-[#8b8b9e]"
                }`}
                title="Table View"
              >
                <Table2 size={15} />
              </button>
              <button
                className="p-1.5 rounded text-[#8b8b9e] cursor-pointer hover:text-[#4a4a5a]"
                title="Map View"
              >
                <Columns3 size={15} />
              </button>
            </div>
          </div>

          {/* Center - Search */}
          <div className="flex items-center gap-2 flex-1 max-w-md mx-6">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#f5f5f7] rounded-md border border-[#e8e8ec] flex-1">
              <Search size={14} className="text-[#8b8b9e]" />
              <input
                type="text"
                placeholder="Search Clients"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="flex-1 text-[13px] text-[#1a1a2e] bg-transparent outline-none placeholder:text-[#b0b0be]"
              />
            </div>
            {viewMode === "table" && (
              <button
                className="p-1.5 text-[#22c55e] bg-[#22c55e]/10 rounded-md hover:bg-[#22c55e]/20 cursor-pointer"
                title="Export to Excel"
              >
                <FileSpreadsheet size={16} />
              </button>
            )}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-[#4a4a5a] border border-[#e8e8ec] rounded-md hover:bg-[#f5f5f7] cursor-pointer" style={{ fontWeight: 500 }}>
              <Download size={13} />
              Import Clients
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] text-white bg-[#7c3aed] rounded-md hover:bg-[#6d28d9] cursor-pointer" style={{ fontWeight: 500 }}>
              <Plus size={13} />
              Create Client
            </button>
          </div>
        </div>

        {/* Second row */}
        <div className="flex items-center justify-between mt-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] rounded-md cursor-pointer transition-colors ${
                showFilters
                  ? "bg-[#7c3aed] text-white"
                  : "text-[#7c3aed] bg-[#f3f0ff] border border-[#7c3aed]/20"
              }`}
              style={{ fontWeight: 500 }}
            >
              <SlidersHorizontal size={12} />
              Filters
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-[#8b8b9e] hover:text-[#4a4a5a] cursor-pointer" style={{ fontWeight: 400 }}>
              <UserPlus size={13} />
              Request to add a client
            </button>
            {viewMode === "table" && (
              <button
                onClick={() => setShowColumnCustomizer(true)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] text-[#8b8b9e] border border-[#e8e8ec] rounded-md hover:bg-[#f5f5f7] cursor-pointer"
                style={{ fontWeight: 500 }}
              >
                <Settings2 size={13} />
                Customize Columns
              </button>
            )}
            {viewMode === "table" && (
              <button className="p-1.5 text-white bg-[#7c3aed] rounded-full cursor-pointer hover:bg-[#6d28d9]">
                <Upload size={13} />
              </button>
            )}
          </div>
        </div>

        {/* Filter chips (when open) */}
        {showFilters && (
          <div className="flex items-center gap-2 mt-2.5 py-2 border-t border-[#f0f0f3]">
            {["Status: Active", "Region: All", "Channel: All", "Assigned To: All"].map((filter) => (
              <span
                key={filter}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] text-[#4a4a5a] bg-[#f5f5f7] rounded-full border border-[#e8e8ec]"
                style={{ fontWeight: 400 }}
              >
                {filter}
                <button className="text-[#8b8b9e] hover:text-[#4a4a5a] cursor-pointer ml-0.5">×</button>
              </span>
            ))}
            <button className="text-[11px] text-[#7c3aed] hover:underline cursor-pointer" style={{ fontWeight: 500 }}>
              + Add Filter
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 p-4">
        {viewMode === "card" ? (
          <CardView clients={paginatedClients} totalClients={totalClients} />
        ) : selectedTableClient ? (
          <ClientTableDetail
            client={selectedTableClient}
            onClose={() => setSelectedTableClient(null)}
          />
        ) : (
          <TableView
            clients={paginatedClients}
            visibleColumns={visibleColumns}
            columnOrder={columnOrder}
            allColumns={ALL_COLUMNS}
            columnWidths={columnWidths}
            onColumnResize={handleColumnResize}
            onClientClick={(client) => setSelectedTableClient(client)}
          />
        )}

        {/* Pagination */}
        {!selectedTableClient && (
          <Pagination
            total={totalClients}
            page={page}
            perPage={perPage}
            onPageChange={setPage}
            onPerPageChange={setPerPage}
          />
        )}
      </div>

      {/* Column Customizer Drawer */}
      <ColumnCustomizer
        open={showColumnCustomizer}
        onClose={() => setShowColumnCustomizer(false)}
        columns={ALL_COLUMNS}
        visibleColumns={visibleColumns}
        columnOrder={columnOrder}
        onToggleColumn={toggleColumn}
        onReorder={setColumnOrder}
        onReset={resetColumns}
      />
    </div>
  );
}