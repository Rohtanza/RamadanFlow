import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  PlusIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  CalendarIcon,
  BookOpenIcon,
  MoonIcon,
  HeartIcon,
  StarIcon,
  PencilSquareIcon,
  TrashIcon,
  ArrowDownOnSquareIcon as SaveIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import NavBar from '../components/NavBar';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'framer-motion';
import * as ramadanService from '../services/ramadanService';
import { useNotification } from '../context/NotificationContext';

const RamadanGoals = () => {
  const { theme } = useTheme();
  const { addNotification } = useNotification();
  const [goals, setGoals] = useState([]);
  const [reflections, setReflections] = useState([]);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showReflectionForm, setShowReflectionForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    type: 'Salah',
    date: format(new Date(), 'yyyy-MM-dd')
  });
  const [newReflection, setNewReflection] = useState({
    content: '',
    mood: 'Grateful',
    tags: [],
    date: format(new Date(), 'yyyy-MM-dd')
  });

  useEffect(() => {
    fetchGoals();
    fetchReflections();
  }, []);

  const fetchGoals = async () => {
    try {
      const data = await ramadanService.fetchGoals();
      setGoals(data);
    } catch (error) {
      toast.error('Failed to fetch goals');
    }
  };

  const fetchReflections = async () => {
    try {
      const data = await ramadanService.fetchReflections();
      setReflections(data);
    } catch (error) {
      toast.error('Failed to fetch reflections');
    }
  };

  const handleGoalSubmit = async (e) => {
    e.preventDefault();
    try {
      await ramadanService.createGoal(newGoal);
      addNotification('Goal added successfully', 'success');
      setShowGoalForm(false);
      setNewGoal({
        title: '',
        description: '',
        type: 'Salah',
        date: format(new Date(), 'yyyy-MM-dd')
      });
      fetchGoals();
    } catch (error) {
      addNotification('Failed to add goal', 'error');
    }
  };

  const handleReflectionSubmit = async (e) => {
    e.preventDefault();
    try {
      await ramadanService.createReflection(newReflection);
      addNotification('Reflection added successfully', 'success');
      setShowReflectionForm(false);
      setNewReflection({
        content: '',
        mood: 'Grateful',
        tags: [],
        date: format(new Date(), 'yyyy-MM-dd')
      });
      fetchReflections();
    } catch (error) {
      addNotification('Failed to add reflection', 'error');
    }
  };

  const toggleGoalStatus = async (goalId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'pending' ? 'completed' : 'pending';
      await ramadanService.updateGoalStatus(goalId, newStatus);
      fetchGoals();
      addNotification(
        `Goal marked as ${newStatus}`,
        newStatus === 'completed' ? 'success' : 'info'
      );
    } catch (error) {
      addNotification('Failed to update goal status', 'error');
    }
  };

  const deleteGoal = async (goalId) => {
    if (!window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      await ramadanService.deleteGoal(goalId);
      fetchGoals();
      addNotification('Goal deleted successfully', 'info');
    } catch (error) {
      addNotification('Failed to delete goal', 'error');
    }
  };

  const deleteReflection = async (reflectionId) => {
    if (!window.confirm('Are you sure you want to delete this reflection?')) return;
    try {
      await ramadanService.deleteReflection(reflectionId);
      fetchReflections();
      addNotification('Reflection deleted successfully', 'info');
    } catch (error) {
      addNotification('Failed to delete reflection', 'error');
    }
  };

  const goalTypes = ['Salah', 'Quran', 'Fasting', 'Charity', 'Dhikr', 'Other'];
  const moods = ['Grateful', 'Reflective', 'Challenged', 'Inspired', 'Peaceful', 'Other'];

  const completedGoals = goals.filter(goal => goal.status === 'completed').length;
  const pendingGoals = goals.filter(goal => goal.status === 'pending').length;

  const progressData = [
    { name: 'Completed', value: completedGoals },
    { name: 'Pending', value: pendingGoals }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  const getGoalTypeIcon = (type) => {
    switch (type) {
      case 'Salah':
        return <MoonIcon className="h-5 w-5" />;
      case 'Quran':
        return <BookOpenIcon className="h-5 w-5" />;
      case 'Fasting':
        return <StarIcon className="h-5 w-5" />;
      case 'Charity':
        return <HeartIcon className="h-5 w-5" />;
      default:
        return <StarIcon className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <NavBar />
      <div className="relative min-h-screen w-full bg-cover bg-center pt-24" 
           style={{ backgroundImage: "url('/home-back.jpg')" }}>
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/95 via-gray-800/90 to-gray-900/95 backdrop-blur-sm" />
        
        <motion.div 
          className="relative z-10 container mx-auto px-4 py-8"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div 
            className="text-center mb-12"
            variants={itemVariants}
          >
            <h1 className="text-5xl md:text-6xl font-bold text-yellow-400 mb-4 drop-shadow-lg">
              Ramadan Goals & Reflections
            </h1>
            <p className="text-gray-300 text-xl max-w-3xl mx-auto">
              Track your spiritual journey through Ramadan with daily goals and meaningful reflections
            </p>
          </motion.div>
          
          {/* Progress Chart */}
          <motion.div 
            className="bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 mb-12 shadow-2xl border border-gray-700/50 hover:border-yellow-500/30 transition-all duration-500"
            variants={itemVariants}
          >
            <div className="flex items-center mb-8">
              <StarIcon className="h-8 w-8 text-yellow-400 mr-3" />
              <h2 className="text-3xl font-bold text-yellow-400">Progress Overview</h2>
            </div>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                  <XAxis dataKey="name" stroke="#E5E7EB" fontSize={14} fontWeight="500" />
                  <YAxis stroke="#E5E7EB" fontSize={14} fontWeight="500" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(17, 24, 39, 0.95)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '1rem',
                      color: '#E5E7EB',
                      padding: '1rem',
                      fontWeight: '500'
                    }}
                  />
                  <Bar 
                    dataKey="value" 
                    fill="#FBBF24" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Goals and Reflections Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Goals Section */}
            <motion.div 
              className="bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-700/50 hover:border-yellow-500/30 transition-all duration-500"
              variants={itemVariants}
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                  <BookOpenIcon className="h-8 w-8 text-yellow-400 mr-3" />
                  <h2 className="text-3xl font-bold text-yellow-400">Daily Goals</h2>
                </div>
                <button
                  onClick={() => setShowGoalForm(true)}
                  className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-6 py-3 rounded-full flex items-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold group"
                >
                  <PlusIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Add Goal
                </button>
              </div>

              {showGoalForm && (
                <motion.form 
                  onSubmit={handleGoalSubmit} 
                  className="mb-8 bg-gray-900/90 backdrop-blur-md p-6 rounded-2xl border border-gray-700/50"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="space-y-4">
                    <div className="relative">
                      <PencilSquareIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Goal Title"
                        value={newGoal.title}
                        onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })}
                        className="w-full pl-10 p-4 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent transition-all duration-300"
                        required
                      />
                    </div>
                    <div className="relative">
                      <BookOpenIcon className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
                      <textarea
                        placeholder="Description"
                        value={newGoal.description}
                        onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })}
                        className="w-full pl-10 p-4 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent transition-all duration-300 min-h-[100px]"
                      />
                    </div>
                    <div className="relative">
                      <StarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        value={newGoal.type}
                        onChange={(e) => setNewGoal({ ...newGoal, type: e.target.value })}
                        className="w-full pl-10 p-4 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent transition-all duration-300"
                      >
                        {goalTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={newGoal.date}
                        onChange={(e) => setNewGoal({ ...newGoal, date: e.target.value })}
                        className="w-full pl-10 p-4 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    <div className="flex justify-end space-x-4 mt-6">
                      <button
                        type="button"
                        onClick={() => setShowGoalForm(false)}
                        className="px-6 py-3 border border-gray-600 rounded-full text-gray-300 hover:bg-gray-800 transition-all duration-300 font-medium flex items-center"
                      >
                        <XCircleIcon className="h-5 w-5 mr-2" />
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-semibold flex items-center"
                      >
                        <SaveIcon className="h-5 w-5 mr-2" />
                        Save Goal
                      </button>
                    </div>
                  </div>
                </motion.form>
              )}

              <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                {goals.map(goal => (
                  <motion.div 
                    key={goal._id} 
                    className="bg-gray-900/90 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50 hover:border-yellow-500/30 transition-all duration-300 group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          {getGoalTypeIcon(goal.type)}
                          <h3 className="text-xl font-bold text-yellow-400 group-hover:text-yellow-300 transition-colors duration-300 ml-2">
                            {goal.title}
                          </h3>
                        </div>
                        <p className="text-gray-300 mt-2 leading-relaxed">
                          {goal.description}
                        </p>
                        <div className="flex items-center mt-4">
                          <span className="text-sm font-medium text-gray-300 bg-gray-700/50 px-4 py-1.5 rounded-full flex items-center">
                            {getGoalTypeIcon(goal.type)}
                            <span className="ml-2">{goal.type}</span>
                          </span>
                          <span className="mx-2 text-gray-500">•</span>
                          <span className="text-sm text-gray-400 flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {format(new Date(goal.date), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-3">
                        <button
                          onClick={() => toggleGoalStatus(goal._id, goal.status)}
                          className={`p-2.5 rounded-full transition-all duration-300 ${
                            goal.status === 'completed' 
                              ? 'text-green-400 hover:bg-green-500/20' 
                              : 'text-gray-400 hover:bg-gray-700'
                          }`}
                        >
                          {goal.status === 'completed' ? (
                            <CheckCircleIcon className="h-6 w-6" />
                          ) : (
                            <XCircleIcon className="h-6 w-6" />
                          )}
                        </button>
                        <button
                          onClick={() => deleteGoal(goal._id)}
                          className="p-2.5 text-red-400 rounded-full hover:bg-red-500/20 transition-all duration-300"
                        >
                          <TrashIcon className="h-6 w-6" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Reflections Section */}
            <motion.div 
              className="bg-gray-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-gray-700/50 hover:border-yellow-500/30 transition-all duration-500"
              variants={itemVariants}
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                  <HeartIcon className="h-8 w-8 text-yellow-400 mr-3" />
                  <h2 className="text-3xl font-bold text-yellow-400">Reflections</h2>
                </div>
                <button
                  onClick={() => setShowReflectionForm(true)}
                  className="bg-yellow-500 hover:bg-yellow-400 text-gray-900 px-6 py-3 rounded-full flex items-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 font-semibold group"
                >
                  <PlusIcon className="h-5 w-5 mr-2 group-hover:scale-110 transition-transform" />
                  Add Reflection
                </button>
              </div>

              {showReflectionForm && (
                <motion.form 
                  onSubmit={handleReflectionSubmit} 
                  className="mb-8 bg-gray-900/90 backdrop-blur-md p-6 rounded-2xl border border-gray-700/50"
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="space-y-4">
                    <div className="relative">
                      <PencilSquareIcon className="absolute left-3 top-4 h-5 w-5 text-gray-400" />
                      <textarea
                        placeholder="Write your reflection..."
                        value={newReflection.content}
                        onChange={(e) => setNewReflection({ ...newReflection, content: e.target.value })}
                        className="w-full pl-10 p-4 bg-gray-800/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent transition-all duration-300 min-h-[150px]"
                        required
                      />
                    </div>
                    <div className="relative">
                      <HeartIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <select
                        value={newReflection.mood}
                        onChange={(e) => setNewReflection({ ...newReflection, mood: e.target.value })}
                        className="w-full pl-10 p-4 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent transition-all duration-300"
                      >
                        {moods.map(mood => (
                          <option key={mood} value={mood}>{mood}</option>
                        ))}
                      </select>
                    </div>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="date"
                        value={newReflection.date}
                        onChange={(e) => setNewReflection({ ...newReflection, date: e.target.value })}
                        className="w-full pl-10 p-4 bg-gray-800/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                    <div className="flex justify-end space-x-4 mt-6">
                      <button
                        type="button"
                        onClick={() => setShowReflectionForm(false)}
                        className="px-6 py-3 border border-gray-600 rounded-full text-gray-300 hover:bg-gray-800 transition-all duration-300 font-medium flex items-center"
                      >
                        <XCircleIcon className="h-5 w-5 mr-2" />
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-semibold flex items-center"
                      >
                        <SaveIcon className="h-5 w-5 mr-2" />
                        Save Reflection
                      </button>
                    </div>
                  </div>
                </motion.form>
              )}

              <div className="space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                {reflections.map(reflection => (
                  <motion.div 
                    key={reflection._id} 
                    className="bg-gray-900/90 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50 hover:border-yellow-500/30 transition-all duration-300 group"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-4">
                        <p className="text-gray-200 text-lg leading-relaxed">
                          {reflection.content}
                        </p>
                        <div className="flex items-center mt-4">
                          <span className="text-sm font-medium text-gray-300 bg-gray-700/50 px-4 py-1.5 rounded-full flex items-center">
                            <HeartIcon className="h-4 w-4 mr-2" />
                            {reflection.mood}
                          </span>
                          <span className="mx-2 text-gray-500">•</span>
                          <span className="text-sm text-gray-400 flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {format(new Date(reflection.date), 'MMM d, yyyy')}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteReflection(reflection._id)}
                        className="p-2.5 text-red-400 rounded-full hover:bg-red-500/20 transition-all duration-300 flex-shrink-0"
                      >
                        <TrashIcon className="h-6 w-6" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RamadanGoals; 