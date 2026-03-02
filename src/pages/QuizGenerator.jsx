import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import Navbar from '../components/Navbar';

const LANGUAGES = ['Python', 'JavaScript', 'Java', 'PHP', 'C++', 'React', 'Node.js', 'SQL', 'Django', 'TypeScript'];

const QuizGenerator = () => {
  const [language, setLanguage] = useState('Python');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [quizData, setQuizData] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [answers, setAnswers] = useState({});
  const [scoreResult, setScoreResult] = useState(null);
  const [scoreHistory, setScoreHistory] = useState([]);

  useEffect(() => {
    fetchScoreHistory();
  }, []);

  const fetchScoreHistory = async () => {
    try {
      const res = await axiosInstance.get('/api/quiz/history/');
      setScoreHistory(res.data?.scores || []);
    } catch (e) {
      // Ignore - user might not be logged in
    }
  };

  const generateQuiz = async () => {
    setLoading(true);
    setError('');
    setQuizData([]);
    setSessionId(null);
    setAnswers({});
    setScoreResult(null);

    try {
      const res = await axiosInstance.post('/api/quiz/generate/', {
        language,
        count,
      });

      if (!Array.isArray(res.data?.quiz)) {
        setError(res.data?.error || 'Invalid response from server');
        return;
      }

      setQuizData(res.data.quiz);
      setSessionId(res.data.session_id);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionIndex, value) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: value }));
  };

  const submitQuiz = async () => {
    if (!sessionId || quizData.length === 0) return;

    const answerList = quizData.map((_, i) => answers[i] ?? '');

    try {
      const res = await axiosInstance.post('/api/quiz/submit/', {
        session_id: sessionId,
        answers: answerList,
      });

      setScoreResult(res.data);
      fetchScoreHistory();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit quiz.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-l from-[#059669] to-black py-12">
      <Navbar />
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white/90">AI Quiz Generator</h1>
              <p className="text-white/60 mt-1">Generate MCQs, take the quiz, and store your scores</p>
            </div>
            <Link
              to="/profiles"
              className="text-white/70 hover:text-white flex items-center gap-1 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Profile
            </Link>
          </div>

          {/* Controls */}
          <div className="bg-black/50 rounded-xl shadow-md p-6 mb-8 border border-gray-700">
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Topic / Language</label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="px-4 py-2.5 bg-white/10 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-[#34D399]/50 focus:border-[#34D399]/50"
                >
                  {LANGUAGES.map((lang) => (
                    <option key={lang} value={lang} className="bg-gray-800 text-white">
                      {lang}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">Number of Questions</label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={count}
                  onChange={(e) => setCount(Math.min(50, Math.max(1, parseInt(e.target.value) || 5)))}
                  className="px-4 py-2.5 w-24 bg-white/10 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-[#34D399]/50"
                />
              </div>
              <button
                onClick={generateQuiz}
                disabled={loading}
                className="px-6 py-2.5 bg-gradient-to-r from-[#34D399] to-[#10B981] hover:from-[#10B981] hover:to-[#059669] text-white font-semibold rounded-lg shadow transition disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                    Generating...
                  </>
                ) : (
                  <>Generate Quiz</>
                )}
              </button>
            </div>
            {error && (
              <p className="mt-4 text-red-400 text-sm">{error}</p>
            )}
          </div>

          {/* Score history */}
          {scoreHistory.length > 0 && (
            <div className="bg-black/50 rounded-xl shadow-md p-6 mb-8 border border-gray-700">
              <h3 className="text-lg font-semibold text-white/90 mb-3">Your Recent Scores</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {scoreHistory.map((s, i) => (
                  <div key={s.id || i} className="flex justify-between items-center py-2 border-b border-gray-700 last:border-0">
                    <span className="text-white/70">{s.language} – {s.score}/{s.total}</span>
                    <span className="text-[#34D399] font-medium">{s.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quiz */}
          {quizData.length > 0 && (
            <div className="bg-black/50 rounded-xl shadow-md overflow-hidden border border-gray-700 mb-8">
              <div className="bg-gradient-to-r from-[#34D399]/20 to-[#10B981]/20 px-6 py-4">
                <h2 className="text-xl font-bold text-[#34D399]">Quiz – {language}</h2>
                <p className="text-white/70 text-sm">{quizData.length} questions</p>
              </div>
              <div className="p-6 space-y-6">
                {quizData.map((q, i) => (
                  <div key={i} className="bg-white/5 rounded-lg p-4 border border-gray-700">
                    <h4 className="text-white font-medium mb-3">{i + 1}. {q.question}</h4>
                    <div className="space-y-2">
                      {q.options?.map((opt, j) => (
                        <label
                          key={j}
                          className="flex items-center gap-3 p-2 rounded cursor-pointer hover:bg-white/10"
                        >
                          <input
                            type="radio"
                            name={`q${i}`}
                            value={opt}
                            checked={answers[i] === opt}
                            onChange={() => handleAnswerChange(i, opt)}
                            className="w-4 h-4 text-[#34D399] focus:ring-[#34D399]"
                          />
                          <span className="text-white/90">{opt}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t border-gray-700">
                <button
                  onClick={submitQuiz}
                  className="w-full py-3 bg-gradient-to-r from-[#34D399] to-[#10B981] hover:from-[#10B981] hover:to-[#059669] text-white font-semibold rounded-lg shadow transition"
                >
                  Submit Quiz
                </button>
              </div>
            </div>
          )}

          {/* Score result */}
          {scoreResult && (
            <div className="bg-gradient-to-r from-[#34D399]/20 to-[#10B981]/20 rounded-xl p-8 border-2 border-[#34D399]/50 text-center">
              <h3 className="text-2xl font-bold text-[#34D399] mb-2">Quiz Complete!</h3>
              <p className="text-4xl font-bold text-white">
                Score: {scoreResult.score} / {scoreResult.total}
              </p>
              <p className="text-xl text-[#34D399] mt-2">{scoreResult.percentage}%</p>
              <p className="text-white/70 mt-4">Your score has been saved.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizGenerator;
