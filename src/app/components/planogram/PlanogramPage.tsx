import { useState } from 'react';
import { SavedPlanogram, ShelfData, StandType } from './types';
import { PlanogramList } from './PlanogramList';
import { SetupPage } from './SetupPage';
import { PlanogramDesigner } from './PlanogramDesigner';
import { Analyzer } from './Analyzer';
import { LayoutGrid } from 'lucide-react';

type View =
  | { type: 'list' }
  | { type: 'setup' }
  | { type: 'designer'; template: SavedPlanogram | null; fromSetup: boolean; prefill?: { name: string; standType: StandType } };

export function PlanogramPage() {
  const [view, setView] = useState<View>({ type: 'list' });
  const [templates, setTemplates] = useState<SavedPlanogram[]>([]);
  const [activeTab, setActiveTab] = useState<'templates' | 'analyzer'>('templates');

  const handleCreate = () => setView({ type: 'setup' });

  const handleSetupStart = (name: string, standType: StandType) =>
    setView({ type: 'designer', template: null, fromSetup: true, prefill: { name, standType } });

  const handleEdit = (t: SavedPlanogram) =>
    setView({ type: 'designer', template: t, fromSetup: false });

  const handleBackToList = () => setView({ type: 'list' });
  const handleBackToSetup = () => setView({ type: 'setup' });

  const handleSave = (
    name: string,
    shelves: ShelfData[],
    gondolaWidthCm: number,
    ignoreFacing: boolean,
    ignorePosition: boolean,
    ignorePriceTags: boolean,
    ignoreShelfTalker: boolean,
    standType: StandType,
  ) => {
    if (view.type === 'designer' && view.template) {
      setTemplates(prev =>
        prev.map(t =>
          t.id === view.template!.id
            ? { ...t, name, shelves, gondolaWidthCm, ignoreFacing, ignorePosition, ignorePriceTags, ignoreShelfTalker, standType }
            : t
        )
      );
    } else {
      setTemplates(prev => [
        ...prev,
        {
          id: `tmpl_${Date.now()}`,
          name,
          createdAt: new Date().toISOString(),
          shelves,
          gondolaWidthCm,
          ignoreFacing,
          ignorePosition,
          ignorePriceTags,
          ignoreShelfTalker,
          standType,
        },
      ]);
    }
    setView({ type: 'list' });
  };

  const handleDelete = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const handleClone = (t: SavedPlanogram) => {
    const base = t.name.replace(/ - clone #\d+$/, '');
    const existing = templates
      .map(x => x.name)
      .filter(n => n === `${base} - clone #1` || /^.+ - clone #\d+$/.test(n))
      .map(n => { const m = n.match(/ - clone #(\d+)$/); return m ? parseInt(m[1], 10) : 0; });
    const next = existing.length > 0 ? Math.max(...existing) + 1 : 1;
    setTemplates(prev => [
      ...prev,
      {
        ...t,
        id: `tmpl_${Date.now()}`,
        name: `${base} - clone #${next}`,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  if (view.type === 'setup') {
    return <SetupPage onBack={handleBackToList} onStart={handleSetupStart} />;
  }

  if (view.type === 'designer') {
    return (
      <PlanogramDesigner
        initialTemplate={view.template}
        prefill={view.prefill}
        confirmOnBack={view.fromSetup}
        onBack={view.fromSetup ? handleBackToSetup : handleBackToList}
        onSave={handleSave}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f5f5f7]">
      {/* Sub-tabs Header */}
      <div className="bg-white border-b border-[#e8e8ec] px-6 py-0 shrink-0">
        <div className="flex items-center gap-8">
          <button
            onClick={() => setActiveTab('templates')}
            className={`py-4 text-[13px] font-bold border-b-2 transition-all cursor-pointer ${activeTab === 'templates'
              ? "border-[#4f6ef7] text-[#4f6ef7]"
              : "border-transparent text-[#8b8b9e] hover:text-[#4a4a5a]"
              }`}
          >
            AI Planogram Templates
          </button>
          <button
            onClick={() => setActiveTab('analyzer')}
            className={`py-4 text-[13px] font-bold border-b-2 transition-all cursor-pointer ${activeTab === 'analyzer'
              ? "border-[#4f6ef7] text-[#4f6ef7]"
              : "border-transparent text-[#8b8b9e] hover:text-[#4a4a5a]"
              }`}
          >
            Analyzer
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {activeTab === 'templates' ? (
          <PlanogramList
            templates={templates}
            onCreate={handleCreate}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onClone={handleClone}
          />
        ) : (
          <Analyzer templates={templates} />
        )}
      </div>
    </div>
  );
}
