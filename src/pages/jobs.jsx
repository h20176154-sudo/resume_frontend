import { useState, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";

const JobMatche = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedJob, setExpandedJob] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axiosInstance.get("jobs/matching-jobs/");
        setJobs(res.data.matches || []);
        setError(null);
      } catch (err) {
        console.error(err);
        const errorMessage =
          err.response?.data?.error ||
          "Unable to load matching jobs. Please try again later.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const truncateDescription = (description, maxLines) => {
    if (!description) return "";
    const lines = description.split("\n");
    if (lines.length <= maxLines) {
      return description;
    }
    return lines.slice(0, maxLines).join("\n") + " ...";
  };

  const toggleDescription = (jobId) => {
    setExpandedJob(expandedJob === jobId ? null : jobId);
  };

  const getScoreClass = (score) => {
    if (score >= 80) return "bg-green-100 text-green-800";
    if (score >= 60) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const getApplyLink = (job) =>
    job.apply_url ||
    job.job_apply_link ||
    (job.apply_options && job.apply_options[0] && job.apply_options[0].apply_link) ||
    null;

  return (
    <div className="bg-gradient-to-l from-[#059669] to-black min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
        <header className="mb-8">
          <div className="bg-black/50 rounded-xl shadow-md p-6 border-l-4 border-[#34D399]/50">
            <h1 className="text-3xl font-bold text-white/70 font-heading">Job Matches</h1>
            <p className="text-white/50 font-semibold mt-1">Opportunities matching your professional profile</p>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            <div className="flex">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
              </svg>
              {error}
            </div>
          </div>
        )}

        {loading ? (
          <div className="bg-black/50 rounded-xl shadow-md p-12 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600 font-medium">Finding your matching jobs...</p>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-black/50 rounded-xl shadow-md p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No matching jobs found</h2>
            <p className="text-gray-500">We couldn't find any jobs that match your profile at this time.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {jobs.map((job, idx) => {
              const score = job.match_score ?? 0;
              const applyLink = getApplyLink(job);

              return (
                <div key={job.job_id || idx} className="bg-black/50 rounded-xl shadow-md overflow-hidden border border-black/70 hover:shadow-lg transition-shadow duration-300">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h2 className="text-xl font-bold text-[#34D399]/50 mb-1">{job.job_title}</h2>
                        <div className="flex items-center text-[#34D399]/50 text-sm">
                          <span>{job.employer_name}</span>
                          <span className="mx-2">|</span>
                          <span>{job.job_employment_type}</span>
                        </div>
                      </div>

                      <div className="ml-4 flex-shrink-0">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getScoreClass(score)}`}>
                          {score}% Match
                        </div>
                      </div>
                    </div>


                    <div className="bg-black/50 rounded-lg p-4 mb-4">
                      <div className="prose prose-sm max-w-none text-white/70">
                        <p className="whitespace-pre-line">
                          {expandedJob === job.job_id
                            ? job.job_description
                            : truncateDescription(job.job_description, 4)}
                        </p>
                      </div>

                      {job.job_description && job.job_description.split("\n").length > 4 && (
                        <button
                          className="mt-3 text-[#34D399]/50 font-medium flex items-center hover:text-[#6EE7B7] transition-colors"
                          onClick={() => toggleDescription(job.job_id)}
                        >
                          {expandedJob === job.job_id ? (
                            <>
                              <span>Read Less</span>
                              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                              </svg>
                            </>
                          ) : (
                            <>
                              <span>Read More</span>
                              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                              </svg>
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {applyLink && (
                      <div className="mb-4">
                        <a
                          href={applyLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-4 py-2 bg-[#10B981] text-white rounded-md hover:bg-[#059669] transition-colors"
                        >
                          <span>Apply Now</span>
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                          </svg>
                        </a>
                      </div>
                    )}

                    {job.apply_options && job.apply_options.length > 0 && (
                      <div>
                        <h3 className="font-semibold text-[#34D399]/50 mb-3">Application Options</h3>
                        <div className="flex flex-wrap gap-2">
                          {job.apply_options.map((option, index) => (
                            <a
                              key={index}
                              href={option.apply_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 bg-[#34D399]/50 text-white rounded-md hover:bg-[#10B981] transition-colors"
                            >
                              <span>{option.publisher}</span>
                              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                              </svg>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default JobMatche;

