import React from 'react';
import { AffiliateLinkButton } from './AffiliateLinkButton';
import affiliates from '../../data/affiliates.json';

type Affiliate = {
  id: string;
  name: string;
  description: string;
  url: string;
  cta: string;
  tags?: string[];
};

const AffiliateSection = () => {
  return (
    <section className="py-16 bg-gradient-to-b from-transparent to-gray-50 dark:to-gray-900/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white sm:text-4xl">
            Recommended Tools for 2026
          </h2>
          <p className="mt-4 max-w-2xl text-xl text-gray-500 dark:text-gray-400 mx-auto">
            Supercharge your workflow with our top-rated AI and development tools.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {affiliates.map((tool: Affiliate) => (
            <div 
              key={tool.id} 
              className="flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden border border-gray-100 dark:border-gray-700"
            >
              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    {tool.name}
                  </h3>
                  {tool.tags && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {tool.tags[0]}
                    </span>
                  )}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6 flex-1">
                  {tool.description}
                </p>
                <AffiliateLinkButton
                  href={tool.url}
                  toolSlug={tool.id}
                  toolName={tool.name}
                  position="recommended_tools"
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  {tool.cta}
                  <svg className="ml-2 -mr-1 w-4 h-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </AffiliateLinkButton>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-400 dark:text-gray-500">
          <p>We may earn a commission when you use our links. This supports our research.</p>
        </div>
      </div>
    </section>
  );
};

export default AffiliateSection;
