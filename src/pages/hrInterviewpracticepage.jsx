import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

const HRInterviewPracticePage = () => {
  const [activeTab, setActiveTab] = useState("generate");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [manualQuestion, setManualQuestion] = useState("");
  const [manualAnswer, setManualAnswer] = useState("");

  // Generate Questions Form State
  const [numberOfQuestions, setNumberOfQuestions] = useState(5);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [jobTitle, setJobTitle] = useState("");

  // Predefined job titles
  const jobTitles = [
    "Software Engineer",
    "Backend Developer",
    "Frontend Developer",
    "Full Stack Developer",
    "Python Developer",
    "JavaScript Developer",
    "Java Developer",
    "React Developer",
    "Node.js Developer",
    "Django Developer",
    "Flask Developer",
    "Angular Developer",
    "Vue.js Developer",
    "Mobile App Developer",
    "iOS Developer",
    "Android Developer",
    "DevOps Engineer",
    "Cloud Engineer",
    "Data Scientist",
    "Data Analyst",
    "Machine Learning Engineer",
    "AI Engineer",
    "Database Administrator",
    "System Administrator",
    "Network Engineer",
    "Security Engineer",
    "QA Engineer",
    "Test Engineer",
    "Product Manager",
    "Project Manager",
    "Technical Lead",
    "Senior Software Engineer",
    "Principal Software Engineer",
    "Software Architect",
    "Solutions Architect",
    "UI/UX Designer",
    "Web Designer",
    "Game Developer",
    "Blockchain Developer",
    "Cybersecurity Analyst",
    "IT Support Specialist",
    "Business Analyst",
    "Scrum Master",
    "Agile Coach",
    "Technical Writer",
    "Sales Engineer",
    "Customer Success Manager",
    "Marketing Manager",
    "Digital Marketing Specialist",
    "Content Manager"
  ];

  // Available programming languages
  const programmingLanguages = [
    "Python", "JavaScript", "Java", "C++", "C#", "Go", "Rust", "PHP", "Ruby",
    "Swift", "Kotlin", "TypeScript", "React", "Vue.js", "Angular", "Node.js",
    "Django", "Flask", "Spring", "Express.js", "Laravel", "ASP.NET", "SQL",
    "MongoDB", "PostgreSQL", "Redis", "Docker", "Kubernetes", "AWS", "Azure"
  ];

  const handleLanguageToggle = (language) => {
    setSelectedLanguages(prev =>
      prev.includes(language)
        ? prev.filter(lang => lang !== language)
        : [...prev, language]
    );
  };

  const generateQuestions = async () => {
    if (!jobTitle.trim() || selectedLanguages.length === 0) {
      alert("Please select a job title and at least one language/skill");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("/interview-practice/generate-questions/", {
        job: jobTitle,
        lang: selectedLanguages.join(", "),
        num: numberOfQuestions
      });

      setQuestions(response.data.questions_with_answers || []);
    } catch (error) {
      console.error("Error generating questions:", error);
      alert("Failed to generate questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const askManualQuestion = async () => {
    if (!manualQuestion.trim()) {
      alert("Please enter a question");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post("/interview-practice/ask-question/", {
        question: manualQuestion
      });

      setManualAnswer(response.data.answer || "No answer provided");
    } catch (error) {
      console.error("Error asking question:", error);
      alert("Failed to get answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-l from-[#059669] to-black py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold font-heading text-white/70">TR Interview Practice</h1>
              <p className="text-white/60 font-semibold mt-1">Practice with AI-generated questions or ask your own</p>
            </div>
            <Link
              to="/profiles"
              className="text-white/70 hover:text-white/50 flex items-center gap-1 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
              </svg>
              Back to Profiles
            </Link>
          </div>

          {/* Tab Navigation */}
          <div className="bg-black/50 rounded-xl shadow-md overflow-hidden mb-6">
            <div className="flex border-b border-white/20">
              <button
                onClick={() => setActiveTab("generate")}
                className={`flex-1 px-6 py-4 font-medium transition-colors ${activeTab === "generate"
                    ? "bg-[#34D399]/20 text-[#34D399] border-b-2 border-[#34D399]"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                  </svg>
                  Generate Questions
                </div>
              </button>
              <button
                onClick={() => setActiveTab("manual")}
                className={`flex-1 px-6 py-4 font-medium transition-colors ${activeTab === "manual"
                    ? "bg-[#34D399]/20 text-[#34D399] border-b-2 border-[#34D399]"
                    : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                  Ask Manual Question
                </div>
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === "generate" && (
                <div className="space-y-6">
                  {/* Generate Questions Form */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Job Title
                      </label>
                      <select
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        className="w-full bg-black/50 p-3 border border-white/50 rounded-lg text-white/80 focus:ring-2 focus:ring-[#34D399]/50 focus:border-[#34D399]"
                      >
                        <option value="">Select a job title...</option>
                        {jobTitles.map((title, index) => (
                          <option key={index} value={title} className="bg-black text-white">
                            {title}
                          </option>
                        ))}
                      </select>
                      {jobTitle && (
                        <p className="text-sm text-[#34D399]/70 mt-2">
                          Selected: {jobTitle}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/80 mb-2">
                        Number of Questions
                      </label>
                      <select
                        value={numberOfQuestions}
                        onChange={(e) => setNumberOfQuestions(parseInt(e.target.value))}
                        className="w-full bg-black/50 p-3 border border-white/50 rounded-lg text-white/80 focus:ring-2 focus:ring-[#34D399]/50 focus:border-[#34D399]"
                      >
                        {[3, 5, 10, 15, 20].map(num => (
                          <option key={num} value={num}>{num} Questions</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Language Selection */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-3">
                      Select Programming Languages/Skills
                    </label>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2 max-h-40 overflow-y-auto bg-black/30 p-4 rounded-lg">
                      {programmingLanguages.map(language => (
                        <label key={language} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedLanguages.includes(language)}
                            onChange={() => handleLanguageToggle(language)}
                            className="w-4 h-4 text-[#34D399] bg-black/50 border-white/50 rounded focus:ring-[#34D399]/50 focus:ring-2"
                          />
                          <span className="text-sm text-white/80">{language}</span>
                        </label>
                      ))}
                    </div>
                    {selectedLanguages.length > 0 && (
                      <p className="text-sm text-[#34D399]/70 mt-2">
                        Selected: {selectedLanguages.join(", ")}
                      </p>
                    )}
                  </div>

                  {/* Generate Button */}
                  <div className="flex justify-center">
                    <button
                      onClick={generateQuestions}
                      disabled={loading || !jobTitle.trim() || selectedLanguages.length === 0}
                      className={`px-8 py-3 rounded-lg font-medium transition-colors ${loading || !jobTitle.trim() || selectedLanguages.length === 0
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-[#34D399] hover:bg-[#10B981] text-white"
                        }`}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Generating {numberOfQuestions} questions...
                        </div>
                      ) : (
                        "Generate Questions"
                      )}
                    </button>
                  </div>

                  {/* Generated Questions */}
                  {questions.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-bold text-white/80 mb-4">Generated Questions</h3>
                      <div className="space-y-4">
                        {questions.map((q, index) => (
                          <div key={index} className="bg-black/50 p-6 rounded-lg border border-white/20">
                            <h4 className="text-lg font-semibold text-[#34D399] mb-3">
                              Q{index + 1}: {q.question}
                            </h4>
                            <div className="text-white/80 leading-relaxed">
                              <div className="prose prose-invert max-w-none">
                                {q.answer.replace(/\\n/g, '\n').split('\n').map((line, lineIndex) => {
                                  // Handle markdown headers
                                  if (line.startsWith('## ')) {
                                    return (
                                      <h4 key={lineIndex} className="text-[#34D399] font-bold mt-6 mb-3 text-xl">
                                        {line.replace('## ', '')}
                                      </h4>
                                    );
                                  }
                                  if (line.startsWith('### ')) {
                                    return (
                                      <h5 key={lineIndex} className="text-[#6EE7B7] font-semibold mt-4 mb-2 text-lg">
                                        {line.replace('### ', '')}
                                      </h5>
                                    );
                                  }
                                  // Handle Definition line without ##
                                  if (line.startsWith('Definition') && !line.startsWith('##')) {
                                    return (
                                      <h4 key={lineIndex} className="text-[#34D399] font-bold mt-6 mb-3 text-xl">
                                        Definition
                                      </h4>
                                    );
                                  }
                                  // Handle bold text
                                  if (line.startsWith('**') && line.endsWith('**')) {
                                    const section = line.replace(/\*\*/g, '');
                                    return (
                                      <h5 key={lineIndex} className="text-[#6EE7B7] font-semibold mt-4 mb-2 text-lg">
                                        {section}
                                      </h5>
                                    );
                                  }
                                  // Handle italic text
                                  if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
                                    const italicText = line.replace(/\*/g, '');
                                    return (
                                      <p key={lineIndex} className="italic text-white/70 mb-2">
                                        {italicText}
                                      </p>
                                    );
                                  }
                                  // Handle horizontal rules
                                  if (line.trim() === '---') {
                                    return (
                                      <hr key={lineIndex} className="border-white/20 my-4" />
                                    );
                                  }
                                  // Handle code blocks
                                  if (line.trim().startsWith('```')) {
                                    return (
                                      <div key={lineIndex} className="bg-gray-900/50 p-3 rounded mt-2 mb-2">
                                        <code className="text-[#34D399] text-sm">{line.replace(/```/g, '')}</code>
                                      </div>
                                    );
                                  }
                                  // Handle table rows with better parsing
                                  if (line.includes('|') && line.trim() !== '' && !line.includes('---')) {
                                    const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
                                    if (cells.length > 1) {
                                      return (
                                        <div key={lineIndex} className="flex mb-1 border-b border-white/10">
                                          {cells.map((cell, cellIndex) => (
                                            <div key={cellIndex} className={`flex-1 p-2 ${cellIndex === 0 ? 'font-semibold text-[#6EE7B7]' : 'text-white/80'}`}>
                                              {cell.replace(/\*\*/g, '').replace(/\*/g, '')}
                                            </div>
                                          ))}
                                        </div>
                                      );
                                    }
                                  }
                                  // Handle table separators
                                  if (line.includes('---') && line.includes('|')) {
                                    return (
                                      <div key={lineIndex} className="border-b border-white/20 my-2"></div>
                                    );
                                  }
                                  // Handle bullet points
                                  if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                                    const bulletText = line.replace(/^[•-]\s*/, '');
                                    return (
                                      <div key={lineIndex} className="flex items-start mb-2">
                                        <span className="text-[#34D399] mr-2 mt-1">•</span>
                                        <span className="text-white/80" dangerouslySetInnerHTML={{
                                          __html: bulletText.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#6EE7B7]">$1</strong>')
                                        }} />
                                      </div>
                                    );
                                  }
                                  // Handle numbered lists
                                  if (/^\d+\./.test(line.trim())) {
                                    const number = line.match(/^\d+/)[0];
                                    const text = line.replace(/^\d+\.\s*/, '');
                                    return (
                                      <div key={lineIndex} className="flex items-start mb-2">
                                        <span className="text-[#34D399] mr-2 mt-1 font-semibold">{number}.</span>
                                        <span className="text-white/80" dangerouslySetInnerHTML={{
                                          __html: text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#6EE7B7]">$1</strong>')
                                        }} />
                                      </div>
                                    );
                                  }
                                  // Handle regular paragraphs with bold text
                                  if (line.trim()) {
                                    return (
                                      <p key={lineIndex} className="mb-2 text-white/80" dangerouslySetInnerHTML={{
                                        __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#6EE7B7]">$1</strong>')
                                      }} />
                                    );
                                  }
                                  return null;
                                })}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "manual" && (
                <div className="space-y-6">
                  {/* Manual Question Form */}
                  <div>
                    <label className="block text-sm font-medium text-white/80 mb-2">
                      Ask Your Question
                    </label>
                    <textarea
                      value={manualQuestion}
                      onChange={(e) => setManualQuestion(e.target.value)}
                      placeholder="Enter your interview question here..."
                      rows={4}
                      className="w-full bg-black/50 p-3 border border-white/50 rounded-lg text-white/80 focus:ring-2 focus:ring-[#34D399]/50 focus:border-[#34D399]"
                    />
                  </div>

                  <div className="flex justify-center">
                    <button
                      onClick={askManualQuestion}
                      disabled={loading || !manualQuestion.trim()}
                      className={`px-8 py-3 rounded-lg font-medium transition-colors ${loading || !manualQuestion.trim()
                          ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                          : "bg-[#34D399] hover:bg-[#10B981] text-white"
                        }`}
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Getting Answer...
                        </div>
                      ) : (
                        "Get Answer"
                      )}
                    </button>
                  </div>

                  {/* Manual Answer */}
                  {manualAnswer && (
                    <div className="mt-8">
                      <h3 className="text-xl font-bold text-white/80 mb-4">Answer</h3>
                      <div className="bg-black/50 p-6 rounded-lg border border-white/20">
                        <div className="text-white/80 leading-relaxed">
                          <strong className="text-[#6EE7B7]">Question:</strong>
                          <p className="mt-2 mb-4">{manualQuestion}</p>
                          <strong className="text-[#6EE7B7]">Answer:</strong>
                          <div className="mt-2 prose prose-invert max-w-none">
                            {manualAnswer.replace(/\\n/g, '\n').split('\n').map((line, lineIndex) => {
                              // Handle markdown headers
                              if (line.startsWith('## ')) {
                                return (
                                  <h4 key={lineIndex} className="text-[#34D399] font-bold mt-6 mb-3 text-xl">
                                    {line.replace('## ', '')}
                                  </h4>
                                );
                              }
                              if (line.startsWith('### ')) {
                                return (
                                  <h5 key={lineIndex} className="text-[#6EE7B7] font-semibold mt-4 mb-2 text-lg">
                                    {line.replace('### ', '')}
                                  </h5>
                                );
                              }
                              // Handle Definition line without ##
                              if (line.startsWith('Definition') && !line.startsWith('##')) {
                                return (
                                  <h4 key={lineIndex} className="text-[#34D399] font-bold mt-6 mb-3 text-xl">
                                    Definition
                                  </h4>
                                );
                              }
                              // Handle bold text
                              if (line.startsWith('**') && line.endsWith('**')) {
                                const section = line.replace(/\*\*/g, '');
                                return (
                                  <h5 key={lineIndex} className="text-[#6EE7B7] font-semibold mt-4 mb-2 text-lg">
                                    {section}
                                  </h5>
                                );
                              }
                              // Handle italic text
                              if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
                                const italicText = line.replace(/\*/g, '');
                                return (
                                  <p key={lineIndex} className="italic text-white/70 mb-2">
                                    {italicText}
                                  </p>
                                );
                              }
                              // Handle horizontal rules
                              if (line.trim() === '---') {
                                return (
                                  <hr key={lineIndex} className="border-white/20 my-4" />
                                );
                              }
                              // Handle code blocks
                              if (line.trim().startsWith('```')) {
                                return (
                                  <div key={lineIndex} className="bg-gray-900/50 p-3 rounded mt-2 mb-2">
                                    <code className="text-[#34D399] text-sm">{line.replace(/```/g, '')}</code>
                                  </div>
                                );
                              }
                              // Handle table rows with better parsing
                              if (line.includes('|') && line.trim() !== '' && !line.includes('---')) {
                                const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
                                if (cells.length > 1) {
                                  return (
                                    <div key={lineIndex} className="flex mb-1 border-b border-white/10">
                                      {cells.map((cell, cellIndex) => (
                                        <div key={cellIndex} className={`flex-1 p-2 ${cellIndex === 0 ? 'font-semibold text-[#6EE7B7]' : 'text-white/80'}`}>
                                          {cell.replace(/\*\*/g, '').replace(/\*/g, '')}
                                        </div>
                                      ))}
                                    </div>
                                  );
                                }
                              }
                              // Handle table separators
                              if (line.includes('---') && line.includes('|')) {
                                return (
                                  <div key={lineIndex} className="border-b border-white/20 my-2"></div>
                                );
                              }
                              // Handle bullet points
                              if (line.trim().startsWith('•') || line.trim().startsWith('-')) {
                                const bulletText = line.replace(/^[•-]\s*/, '');
                                return (
                                  <div key={lineIndex} className="flex items-start mb-2">
                                    <span className="text-[#34D399] mr-2 mt-1">•</span>
                                    <span className="text-white/80" dangerouslySetInnerHTML={{
                                      __html: bulletText.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#6EE7B7]">$1</strong>')
                                    }} />
                                  </div>
                                );
                              }
                              // Handle numbered lists
                              if (/^\d+\./.test(line.trim())) {
                                const number = line.match(/^\d+/)[0];
                                const text = line.replace(/^\d+\.\s*/, '');
                                return (
                                  <div key={lineIndex} className="flex items-start mb-2">
                                    <span className="text-[#34D399] mr-2 mt-1 font-semibold">{number}.</span>
                                    <span className="text-white/80" dangerouslySetInnerHTML={{
                                      __html: text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#6EE7B7]">$1</strong>')
                                    }} />
                                  </div>
                                );
                              }
                              // Handle regular paragraphs with bold text
                              if (line.trim()) {
                                return (
                                  <p key={lineIndex} className="mb-2 text-white/80" dangerouslySetInnerHTML={{
                                    __html: line.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[#6EE7B7]">$1</strong>')
                                  }} />
                                );
                              }
                              return null;
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HRInterviewPracticePage;
