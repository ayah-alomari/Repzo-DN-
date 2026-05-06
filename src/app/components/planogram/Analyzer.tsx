import { useState } from 'react';
import { Upload, CheckCircle2, AlertCircle, BarChart3, Image as ImageIcon, Search } from 'lucide-react';
import { SavedPlanogram } from './types';

interface AnalyzerProps {
    templates: SavedPlanogram[];
}

export function Analyzer({ templates }: AnalyzerProps) {
    const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
    const [uploadedImage, setUploadedImage] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [results, setResults] = useState<{
        overallScore: number;
        facingCompliance: number;
        positionCompliance: number;
        priceTagCompliance: number;
        shelfTalkerCompliance: number;
    } | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setUploadedImage(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const runAnalysis = () => {
        if (!selectedTemplateId || !uploadedImage) return;
        setIsAnalyzing(true);
        // Mocking analysis delay
        setTimeout(() => {
            setResults({
                overallScore: 85,
                facingCompliance: 92,
                positionCompliance: 78,
                priceTagCompliance: 100,
                shelfTalkerCompliance: 60,
            });
            setIsAnalyzing(false);
        }, 2000);
    };

    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

    return (
        <div className="p-6 h-full flex flex-col gap-6 overflow-auto bg-[#f5f5f7]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto w-full">
                {/* Setup Card */}
                <div className="bg-white rounded-2xl border border-[#e8e8ec] p-6 shadow-sm">
                    <h3 className="text-[16px] font-bold text-[#1a1a2e] mb-5 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-[#f0f2ff] flex items-center justify-center">
                            <BarChart3 size={18} className="text-[#4f6ef7]" />
                        </div>
                        Analysis Setup
                    </h3>

                    <div className="space-y-5">
                        <div>
                            <label className="block text-[11px] font-bold text-[#8b8b9e] uppercase mb-2 tracking-wider">
                                Reference Template
                            </label>
                            <div className="relative">
                                <select
                                    value={selectedTemplateId}
                                    onChange={(e) => setSelectedTemplateId(e.target.value)}
                                    className="w-full h-11 pl-3 pr-10 bg-[#f8f8fb] border border-[#e0e0ea] rounded-xl text-[13px] outline-none focus:border-[#4f6ef7] appearance-none transition-all"
                                >
                                    <option value="">Select a template...</option>
                                    {templates.map(t => (
                                        <option key={t.id} value={t.id}>{t.name}</option>
                                    ))}
                                </select>
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#8b8b9e]">
                                    <Search size={14} />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-[#8b8b9e] uppercase mb-2 tracking-wider">
                                Shelf Image
                            </label>
                            <div className="relative group">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                <div className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center gap-3 transition-all ${uploadedImage ? 'border-[#4f6ef7] bg-[#f0f2ff]' : 'border-[#e8e8ec] bg-[#fcfcfd] group-hover:border-[#4f6ef7]'}`}>
                                    {uploadedImage ? (
                                        <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-[#e8e8ec] shadow-inner">
                                            <img src={uploadedImage} alt="Uploaded" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                <span className="text-white text-[13px] font-bold bg-[#1a1a2e]/60 px-4 py-2 rounded-full backdrop-blur-sm">Replace Image</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-14 h-14 rounded-2xl bg-white border border-[#e8e8ec] shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Upload size={28} className="text-[#8b8b9e]" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-[14px] font-bold text-[#1a1a2e]">Drop your image here</p>
                                                <p className="text-[12px] text-[#8b8b9e] mt-1 font-medium">Upload a clear photo of the retail shelf</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={runAnalysis}
                            disabled={!selectedTemplateId || !uploadedImage || isAnalyzing}
                            className={`w-full h-12 rounded-xl font-bold text-[14px] transition-all flex items-center justify-center gap-2 ${!selectedTemplateId || !uploadedImage ? 'bg-[#e8e8ec] text-[#a0a0b0] cursor-not-allowed' : 'bg-[#4f6ef7] text-white shadow-lg shadow-[#4f6ef7]/25 hover:bg-[#3d5de8] active:scale-[0.98]'}`}
                        >
                            {isAnalyzing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Analyzing Compliance...
                                </>
                            ) : (
                                'Analyze Compliance'
                            )}
                        </button>
                    </div>
                </div>

                {/* Results Pane */}
                <div className="flex flex-col gap-6">
                    {!results && !isAnalyzing && (
                        <div className="bg-white rounded-2xl border border-[#e8e8ec] p-16 shadow-sm flex flex-col items-center justify-center text-center h-full">
                            <div className="w-20 h-20 rounded-[24px] bg-[#f8f8fb] border border-[#e8e8ec] flex items-center justify-center mb-6">
                                <ImageIcon size={40} className="opacity-20 text-[#1a1a2e]" />
                            </div>
                            <h4 className="text-[16px] font-bold text-[#1a1a2e]">Analysis Results</h4>
                            <p className="text-[13px] text-[#8b8b9e] mt-2 max-w-[280px] leading-relaxed font-medium">
                                Configure the analysis setup on the left to generate real-time compliance metrics.
                            </p>
                        </div>
                    )}

                    {isAnalyzing && (
                        <div className="bg-white rounded-2xl border border-[#e8e8ec] p-16 shadow-sm flex flex-col items-center justify-center text-center h-full animate-pulse">
                            <div className="w-20 h-20 rounded-[24px] bg-[#f0f2ff] border border-[#c0caff] flex items-center justify-center mb-6">
                                <BarChart3 size={40} className="text-[#4f6ef7]" />
                            </div>
                            <h4 className="text-[16px] font-bold text-[#1a1a2e]">Processing AI Model</h4>
                            <p className="text-[13px] text-[#8b8b9e] mt-2 font-medium">Checking facings, positions, and POS materials...</p>
                        </div>
                    )}

                    {results && !isAnalyzing && (
                        <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 h-full">
                            {/* Overall Score */}
                            <div className="bg-white rounded-2xl border border-[#e8e8ec] p-6 shadow-sm flex items-center justify-between overflow-hidden relative">
                                <div className="absolute top-0 left-0 w-1.5 h-full bg-[#12b76a]" />
                                <div>
                                    <h4 className="text-[11px] font-bold text-[#8b8b9e] uppercase tracking-wider">Overall Score</h4>
                                    <div className="text-[36px] font-black text-[#1a1a2e] mt-1 tracking-tight">{results.overallScore}%</div>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <CheckCircle2 size={14} className="text-[#12b76a]" />
                                        <span className="text-[12px] font-bold text-[#12b76a]">Good Compliance</span>
                                    </div>
                                </div>
                                <div className="w-20 h-20 relative">
                                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                                        <circle className="text-[#f0f0f3]" strokeWidth="3.5" stroke="currentColor" fill="none" r="16" cx="18" cy="18" />
                                        <circle className="text-[#12b76a]" strokeWidth="3.5" strokeDasharray={`${results.overallScore}, 100`} strokeLinecap="round" stroke="currentColor" fill="none" r="16" cx="18" cy="18" />
                                    </svg>
                                </div>
                            </div>

                            {/* Detailed Metrics */}
                            <div className="bg-white rounded-2xl border border-[#e8e8ec] p-6 shadow-sm">
                                <h4 className="text-[14px] font-bold text-[#1a1a2e] mb-6 uppercase tracking-wide flex items-center justify-between">
                                    Metric Breakdown
                                    <span className="text-[10px] text-[#8b8b9e] font-medium normal-case">Based on template settings</span>
                                </h4>
                                <div className="space-y-7">
                                    {/* Facing */}
                                    {!selectedTemplate?.ignoreFacing && (
                                        <div className="space-y-2.5">
                                            <div className="flex justify-between text-[13px] font-bold">
                                                <span className="text-[#4a4a5a]">Facing Compliance</span>
                                                <span className="text-[#12b76a]">{results.facingCompliance}%</span>
                                            </div>
                                            <div className="h-3 bg-[#f0f0f3] rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-[#12b76a] to-[#12b76a]/70 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(18,183,106,0.3)]" style={{ width: `${results.facingCompliance}%` }} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Position */}
                                    {!selectedTemplate?.ignorePosition && (
                                        <div className="space-y-2.5">
                                            <div className="flex justify-between text-[13px] font-bold">
                                                <span className="text-[#4a4a5a]">Position Accuracy</span>
                                                <span className="text-[#4f6ef7]">{results.positionCompliance}%</span>
                                            </div>
                                            <div className="h-3 bg-[#f0f0f3] rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-[#4f6ef7] to-[#4f6ef7]/70 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(79,110,247,0.3)]" style={{ width: `${results.positionCompliance}%` }} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Price Tags */}
                                    {!selectedTemplate?.ignorePriceTags && (
                                        <div className="space-y-2.5">
                                            <div className="flex justify-between text-[13px] font-bold">
                                                <span className="text-[#4a4a5a]">Price Tag Detection</span>
                                                <span className="text-[#12b76a]">{results.priceTagCompliance}%</span>
                                            </div>
                                            <div className="h-3 bg-[#f0f0f3] rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-[#12b76a] to-[#12b76a]/70 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(18,183,106,0.3)]" style={{ width: `${results.priceTagCompliance}%` }} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Shelf Talker */}
                                    {!selectedTemplate?.ignoreShelfTalker && (
                                        <div className="space-y-2.5">
                                            <div className="flex justify-between text-[13px] font-bold">
                                                <span className="text-[#4a4a5a]">Shelf Talker Compliance</span>
                                                <span className="text-[#ef4444]">{results.shelfTalkerCompliance}%</span>
                                            </div>
                                            <div className="h-3 bg-[#f0f0f3] rounded-full overflow-hidden">
                                                <div className="h-full bg-gradient-to-r from-[#ef4444] to-[#ef4444]/70 rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(239,68,68,0.3)]" style={{ width: `${results.shelfTalkerCompliance}%` }} />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Suggestions */}
                            <div className="bg-[#fffbeb] border border-[#fde68a] rounded-2xl p-5 flex gap-4 shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                                    <AlertCircle className="text-[#d97706]" size={22} />
                                </div>
                                <div>
                                    <h5 className="text-[14px] font-bold text-[#92400e]">Improvement Suggestions</h5>
                                    <p className="text-[13px] text-[#b45309] mt-1.5 leading-relaxed font-medium">
                                        The detected layout shows that some shelf talkers are missing or incorrectly placed compared to the template. Ensure all promotional banners are visible and aligned to increase the overall compliance score.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}