import { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';


const CVGenerator = () => {
  const [file, setFile] = useState(null);
  const [extra, setExtra] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [previewVisible, setPreviewVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('original');
  const [data, setData] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    if (e.target.files[0]) {
      document.getElementById('fileName').textContent = e.target.files[0].name;
    }
  };

  const parseMarkdown = (text) => {
    if (!text) return '';
    
    console.log('Original text:', text.substring(0, 500) + '...'); // Debug log
    
    let html = text;
    
    // First, clean up ALL raw markdown symbols completely
    html = html.replace(/^#+\s*/gm, ''); // Remove ALL # symbols from headers
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#34D399] font-bold">$1</strong>'); // Convert **text** to bold
    html = html.replace(/\*(.+?)\*/g, '<em class="text-[#6EE7B7]">$1</em>'); // Convert *text* to italic
    
    // Parse tables with improved detection - handle various table formats
    html = html.replace(/(?:^|\n)([^\n]*\|[^\n]*\|[\s\S]*?)(?=\n\n|\n[A-Z]|\n\*|\n-|\n#|$)/gm, (match) => {
      const lines = match.trim().split('\n').filter(line => line.trim());
      if (lines.length < 1) return match;
      
      // Check if any line contains table structure
      const hasTableStructure = lines.some(line => line.includes('|') && line.split('|').length >= 2);
      if (!hasTableStructure) return match;
      
      // Find separator line (if exists)
      let separatorIndex = -1;
      for (let i = 0; i < lines.length; i++) {
        if (/^\s*\|[\s\-:]+\|[\s\-:]*\|/.test(lines[i])) {
          separatorIndex = i;
          break;
        }
      }
      
      // Determine header and data rows
      let headerRow, dataRows;
      if (separatorIndex >= 0) {
        // Standard markdown table with separator
        headerRow = lines[0];
        dataRows = lines.slice(separatorIndex + 1).filter(line => line.includes('|'));
      } else {
        // Table without separator - treat first row as header if it looks like one
        const firstLine = lines[0];
        if (firstLine.includes('|') && firstLine.split('|').length >= 2) {
          headerRow = firstLine;
          dataRows = lines.slice(1).filter(line => line.includes('|'));
        } else {
          // No clear header, treat all rows as data
          headerRow = null;
          dataRows = lines.filter(line => line.includes('|'));
        }
      }
      
      if (dataRows.length === 0) return match;
      
      // Extract headers
      let headerCells = [];
      if (headerRow) {
        headerCells = headerRow.split('|').map(c => c.trim()).filter(c => c);
      } else {
        // Generate generic headers based on column count
        const firstDataRow = dataRows[0];
        const columnCount = firstDataRow.split('|').length;
        headerCells = Array.from({length: columnCount}, (_, i) => `Column ${i + 1}`);
      }
      
      if (headerCells.length === 0) return match;
      
      let table = '<div class="overflow-x-auto my-6"><table class="w-full border-collapse border border-[#34D399]/30 rounded-lg overflow-hidden bg-white/5">';
      
      // Add header if we have one
      if (headerRow) {
        table += '<thead><tr class="bg-gradient-to-r from-[#34D399]/20 to-[#6EE7B7]/20">';
        headerCells.forEach(header => {
          const cleanHeader = header.replace(/<strong[^>]*>|<\/strong>|<em[^>]*>|<\/em>/g, '').trim();
          table += `<th class="border border-[#34D399]/30 px-4 py-3 text-left font-bold text-[#34D399]">${cleanHeader}</th>`;
        });
        table += '</tr></thead>';
      }
      
      table += '<tbody>';
      
      dataRows.forEach((row, rowIndex) => {
        const cells = row.split('|').map(c => c.trim()).filter(c => c);
        if (cells.length === 0) return;
        
        table += `<tr class="${rowIndex % 2 === 0 ? 'bg-white/5' : 'bg-white/10'}">`;
        
        // Ensure we don't exceed header count
        const maxCells = Math.min(cells.length, headerCells.length);
        for (let i = 0; i < maxCells; i++) {
          let cellContent = cells[i] || '';
          // Process bold and italic text in cells
          cellContent = cellContent.replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#34D399]">$1</strong>');
          cellContent = cellContent.replace(/\*(.+?)\*/g, '<em class="text-[#6EE7B7]">$1</em>');
          table += `<td class="border border-[#34D399]/20 px-4 py-3 text-white/90">${cellContent}</td>`;
        }
        
        // Fill remaining cells if needed
        for (let i = maxCells; i < headerCells.length; i++) {
          table += `<td class="border border-[#34D399]/20 px-4 py-3 text-white/90"></td>`;
        }
        
        table += '</tr>';
      });
      
      table += '</tbody></table></div>';
      return table;
    });
    
    // Additional table detection - catch any remaining table-like structures
    html = html.replace(/(?:^|\n)([^\n]*\|[^\n]*\|[\s\S]*?)(?=\n\n|\n[A-Z]|\n\*|\n-|\n#|$)/gm, (match) => {
      // Skip if already processed as table
      if (match.includes('<table')) return match;
      
      const lines = match.trim().split('\n').filter(line => line.trim());
      if (lines.length < 1) return match;
      
      // Check if this looks like a table (has multiple lines with |)
      const tableLines = lines.filter(line => line.includes('|') && line.split('|').length >= 2);
      if (tableLines.length < 2) return match;
      
      // Simple table without separator - treat first line as header
      const headerCells = tableLines[0].split('|').map(c => c.trim()).filter(c => c);
      const dataRows = tableLines.slice(1);
      
      if (headerCells.length === 0 || dataRows.length === 0) return match;
      
      let table = '<div class="overflow-x-auto my-6"><table class="w-full border-collapse border border-[#34D399]/30 rounded-lg overflow-hidden bg-white/5">';
      table += '<thead><tr class="bg-gradient-to-r from-[#34D399]/20 to-[#6EE7B7]/20">';
      
      headerCells.forEach(header => {
        const cleanHeader = header.replace(/<strong[^>]*>|<\/strong>|<em[^>]*>|<\/em>/g, '').trim();
        table += `<th class="border border-[#34D399]/30 px-4 py-3 text-left font-bold text-[#34D399]">${cleanHeader}</th>`;
      });
      table += '</tr></thead><tbody>';
      
      dataRows.forEach((row, rowIndex) => {
        const cells = row.split('|').map(c => c.trim()).filter(c => c);
        if (cells.length === 0) return;
        
        table += `<tr class="${rowIndex % 2 === 0 ? 'bg-white/5' : 'bg-white/10'}">`;
        
        const maxCells = Math.min(cells.length, headerCells.length);
        for (let i = 0; i < maxCells; i++) {
          let cellContent = cells[i] || '';
          cellContent = cellContent.replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#34D399]">$1</strong>');
          cellContent = cellContent.replace(/\*(.+?)\*/g, '<em class="text-[#6EE7B7]">$1</em>');
          table += `<td class="border border-[#34D399]/20 px-4 py-3 text-white/90">${cellContent}</td>`;
        }
        
        for (let i = maxCells; i < headerCells.length; i++) {
          table += `<td class="border border-[#34D399]/20 px-4 py-3 text-white/90"></td>`;
        }
        
        table += '</tr>';
      });
      
      table += '</tbody></table></div>';
      return table;
    });
    
    // Remove ALL remaining table separator lines and | symbols
    html = html.replace(/^\s*\|[\s\-:]+\|[\s\-:]*\|.*$/gm, '');
    html = html.replace(/\|\|/g, ' | '); // Convert || to |
    html = html.replace(/(?<!<[^>]*)\|(?!<[^>]*>)/g, ' | '); // Convert standalone | to | with spaces
    
    console.log('After table processing:', html.substring(0, 500) + '...'); // Debug log
    
    // Parse horizontal rules - remove --- symbols
    html = html.replace(/^---+$/gm, '<hr class="border-0 h-1 bg-gradient-to-r from-transparent via-[#34D399]/50 to-transparent my-8">');
    
    // Parse headers (now that # symbols are removed)
    html = html.replace(/^([A-Z][^:\n]*):?\s*$/gm, (match, title) => {
      if (title.length > 50) return match; // Don't convert long lines to headers
      return `<h2 class="text-3xl font-bold text-white mt-8 mb-4 pb-2 border-b-2 border-[#34D399]/50 bg-gradient-to-r from-[#34D399]/10 to-[#6EE7B7]/10 px-4 py-2 rounded-lg">${title}</h2>`;
    });
    
    // Parse sub-headers (shorter lines that might be sub-headers)
    html = html.replace(/^([A-Z][A-Z\s&]+[A-Z])\s*$/gm, (match, title) => {
      if (title.length > 30) return match;
      return `<h3 class="text-2xl font-bold text-white mt-6 mb-3 text-[#34D399]">${title}</h3>`;
    });
    
    // Parse bullets - remove - and * symbols
    html = html.replace(/^[\*\-]\s+(.+)$/gm, '<li class="text-white/90 mb-2 ml-4 flex items-start"><span class="text-[#34D399] mr-2 mt-1">•</span><span>$1</span></li>');
    html = html.replace(/(<li class="text-white\/90 mb-2 ml-4 flex items-start"><span class="text-[#34D399] mr-2 mt-1">•<\/span><span>.*<\/span><\/li>\n?)+/g, '<ul class="space-y-2 my-4">$&</ul>');
    
    // Parse numbered lists - remove 1. symbols
    html = html.replace(/^\d+\.\s+(.+)$/gm, '<li class="text-white/90 mb-2 ml-4 flex items-start"><span class="text-[#34D399] mr-2 mt-1 font-bold">$&</span><span>$1</span></li>');
    html = html.replace(/(<li class="text-white\/90 mb-2 ml-4 flex items-start"><span class="text-[#34D399] mr-2 mt-1 font-bold">\d+\.\s+.*<\/span><span>.*<\/span><\/li>\n?)+/g, '<ol class="space-y-2 my-4">$&</ol>');
    
    // Parse paragraphs
    html = html.split('\n\n').map(para => {
      para = para.trim();
      if (!para) return '';
      if (para.match(/^<[h|u|o|t|d]/)) return para; // Already processed
      if (para.match(/^\s*\|[\s\-:]+\|/)) return ''; // Skip separator lines
      
      return `<p class="text-white/90 leading-relaxed mb-4 text-lg">${para}</p>`;
    }).join('\n\n');
    
    // Clean up empty paragraphs and extra whitespace
    html = html.replace(/<p class="text-white\/90 leading-relaxed mb-4 text-lg"><\/p>/g, '');
    html = html.replace(/\n{3,}/g, '\n\n');
    
    // Final cleanup - remove ANY remaining raw markdown symbols
    html = html.replace(/^#+\s*/gm, ''); // Remove any remaining #
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong class="text-[#34D399] font-bold">$1</strong>'); // Convert any remaining **
    html = html.replace(/\*(.+?)\*/g, '<em class="text-[#6EE7B7]">$1</em>'); // Convert any remaining *
    html = html.replace(/^\s*[\*\-]\s+/gm, ''); // Remove any remaining bullet symbols
    html = html.replace(/^\d+\.\s+/gm, ''); // Remove any remaining numbered list symbols
    
    return html;
  };

  const generateCV = async () => {
    if (!file) {
      setStatus({ type: 'error', message: '❌ Please select a PDF file first' });
      return;
    }

    setLoading(true);
    setStatus({ type: 'loading', message: '⏳ Generating your professional CV. This may take 30-60 seconds...' });
    setPreviewVisible(false);
    setActiveTab('original');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('extra', extra);

      const response = await axiosInstance.post('/api/cv-generator/generate/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setData(response.data);
      setPreviewVisible(true);
      setStatus({ type: 'success', message: '✅ Your CV has been generated successfully! Switch between Original and Generated tabs, or export to Word.' });

    } catch (error) {
      setStatus({ type: 'error', message: '❌ Error generating CV. Please try again or check your connection.' });
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportWord = () => {
    if (data?.word_file) {
      window.open(`http://127.0.0.1:5000/api/cv-generator/export/?file=${encodeURIComponent(data.word_file)}`, '_blank');
    } else {
      alert('No Word file available. Please generate your CV first.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-l from-[#059669] to-black">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center text-white mb-12">
            <div className="inline-block bg-gradient-to-r from-[#34D399] to-[#6EE7B7] text-black px-6 py-2 rounded-full text-sm font-bold mb-4">
              ✨ AI-Powered CV Generator
            </div>
            <h1 className="text-5xl font-bold mb-4 drop-shadow-2xl bg-gradient-to-r from-[#34D399] to-[#6EE7B7] bg-clip-text text-transparent">
              🚀 Transform Your Resume
            </h1>
            <p className="text-xl opacity-90 max-w-2xl mx-auto leading-relaxed">
              Upload your PDF resume and watch our AI create a stunning, professional, ATS-optimized CV with detailed content spanning 5-10 pages
            </p>
          </div>

          {/* Upload Form */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-8 border border-[#34D399]/20">
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="mb-8">
                <label className="block font-bold text-white text-lg mb-4 flex items-center gap-2">
                  <span className="text-2xl">📄</span>
                  Upload Your Resume PDF
                </label>
                <div 
                  className="border-3 border-dashed border-[#34D399] rounded-2xl p-12 text-center bg-gradient-to-br from-[#34D399]/10 to-[#6EE7B7]/10 cursor-pointer transition-all hover:bg-gradient-to-br hover:from-[#34D399]/20 hover:to-[#6EE7B7]/20 hover:scale-105 hover:shadow-xl"
                  onClick={() => document.getElementById('pdfInput').click()}
                >
                  <input
                    type="file"
                    id="pdfInput"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    required
                  />
                  <div className="text-8xl mb-6 animate-bounce">📎</div>
                  <div className="text-2xl font-semibold text-white mb-2">
                    Click to select or drag & drop your PDF
                  </div>
                  <div className="text-lg text-white/70 mb-4">
                    Supported formats: PDF only
                  </div>
                  <div id="fileName" className="mt-4 text-lg text-[#34D399] font-bold bg-black/20 px-4 py-2 rounded-lg inline-block"></div>
                </div>
              </div>

              <div className="mb-8">
                <label className="block font-bold text-white text-lg mb-4 flex items-center gap-2">
                  <span className="text-2xl">✨</span>
                  Extra Achievements & Notes (Optional)
                </label>
                <textarea
                  rows="8"
                  placeholder="Add additional accomplishments, leadership roles, research, hackathons, certifications, projects, awards, publications, or any other details you'd like to include in your comprehensive CV..."
                  className="w-full px-6 py-4 border-2 border-[#34D399]/30 rounded-2xl focus:border-[#34D399] focus:ring-4 focus:ring-[#34D399]/20 transition-all bg-white/10 backdrop-blur-sm text-white placeholder-white/60 text-lg resize-none"
                  value={extra}
                  onChange={(e) => setExtra(e.target.value)}
                />
                <div className="text-sm text-white/60 mt-2">
                  💡 Tip: The more details you provide, the more comprehensive and personalized your CV will be!
                </div>
              </div>

              <button
                onClick={generateCV}
                disabled={loading}
                className="w-full py-6 bg-gradient-to-r from-[#059669] via-[#10B981] to-[#34D399] text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-[#34D399]/25 transform hover:-translate-y-1 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#10B981] via-[#34D399] to-[#6EE7B7] opacity-0 hover:opacity-100 transition-opacity"></div>
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-8 w-8 border-t-4 border-b-4 border-white"></div>
                    <span className="relative z-10">Generating Your Professional CV...</span>
                  </>
                ) : (
                  <>
                    <span className="text-3xl">✨</span>
                    <span className="relative z-10">Generate Professional CV</span>
                    <span className="text-3xl">🚀</span>
                  </>
                )}
              </button>
            </form>

            {/* Status Message */}
            {status.message && (
              <div className={`mt-6 p-6 rounded-2xl text-center font-bold text-lg ${
                status.type === 'loading' ? 'bg-gradient-to-r from-[#34D399]/20 to-[#6EE7B7]/20 text-[#34D399] border-2 border-[#34D399]/50' :
                status.type === 'success' ? 'bg-gradient-to-r from-[#059669]/20 to-[#10B981]/20 text-[#6EE7B7] border-2 border-[#059669]/50' :
                'bg-gradient-to-r from-red-400/20 to-pink-500/20 text-red-200 border-2 border-red-400/50'
              }`}>
                {status.message}
              </div>
            )}
          </div>

          {/* Preview Section */}
          {previewVisible && data && (
            <div className="bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border border-[#34D399]/20">
              {/* Tabs */}
              <div className="flex gap-2 border-b-2 border-[#34D399]/20 p-6 bg-gradient-to-r from-[#059669]/10 to-[#34D399]/10">
                <button
                  onClick={() => setActiveTab('original')}
                  className={`px-8 py-4 font-bold rounded-xl transition-all flex items-center gap-2 ${
                    activeTab === 'original' 
                      ? 'bg-gradient-to-r from-[#059669] to-[#34D399] text-white shadow-lg' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-xl">📄</span>
                  Original Text
                </button>
                <button
                  onClick={() => setActiveTab('generated')}
                  className={`px-8 py-4 font-bold rounded-xl transition-all flex items-center gap-2 ${
                    activeTab === 'generated' 
                      ? 'bg-gradient-to-r from-[#059669] to-[#34D399] text-white shadow-lg' 
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-xl">✨</span>
                  AI Generated CV
                </button>
              </div>

              {/* Export Button */}
              <div className="text-center p-6 border-b border-[#34D399]/20 bg-gradient-to-r from-[#059669]/10 to-[#10B981]/10">
                <button
                  onClick={exportWord}
                  className="px-8 py-4 bg-gradient-to-r from-[#059669] to-[#10B981] text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all inline-flex items-center gap-3 text-lg"
                >
                  <span className="text-2xl">📥</span>
                  Export to Word (.docx)
                </button>
                <div className="text-sm text-white/60 mt-2">
                  Download your professionally formatted CV
                </div>
              </div>

              {/* Content */}
              <div className="p-8  overflow-y-auto bg-gradient-to-br from-white/5 to-white/10">
                {activeTab === 'original' ? (
                  <div className="whitespace-pre-wrap font-mono text-sm bg-black/20 p-6 rounded-xl border border-[#34D399]/20 text-white/90 leading-relaxed">
                    {data.original || 'No content extracted from PDF'}
                  </div>
                ) : (
                  <div 
                    className="prose prose-lg max-w-none text-white prose-headings:text-white prose-strong:text-[#34D399] prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg prose-p:text-white/90 prose-li:text-white/90 prose-td:text-white/90 prose-th:text-[#34D399]"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(data.generated) }}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CVGenerator;


