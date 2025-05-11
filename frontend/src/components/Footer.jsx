import { FaGithub } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const teamMembers = [
    { name: 'Laiba Nadeem', id: '22L-7998 ' },
    { name: 'Eman Awan', id: '22L-7996' },
    { name: 'Attiya Hassan ', id: '22L-7865' },
     { name: 'Muhammad Rehan', id: '22P-9106' },
  ];

  return (
    <footer className="bg-gray-900/95 backdrop-blur-lg shadow-lg border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between py-4 space-y-4 md:space-y-0">
          {/* Copyright Section */}
          <div className="flex items-center space-x-2">
            <span className="text-yellow-400 font-semibold">Ramadan Flow</span>
            <span className="text-gray-400">•</span>
            <span className="text-sm text-gray-300">
              © {currentYear} All rights reserved
            </span>
          </div>

          {/* Team Section */}
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-4">
              {teamMembers.map((member, index) => (
                <div key={index} className="text-sm text-gray-300">
                  <span className="text-yellow-400">{member.name}</span>
                  <span className="text-gray-400 mx-1">•</span>
                  <span>{member.id}</span>
                </div>
              ))}
            </div>
            <a
              href="https://github.com/Rohtanza/RamadanFlow"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 text-gray-300 hover:text-yellow-400 transition-colors duration-200"
            >
              <FaGithub className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 
