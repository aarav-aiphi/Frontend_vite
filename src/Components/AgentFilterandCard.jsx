// AgentFilterAndCard.js
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from 'axios';
import { 
  FaChevronDown, 
  FaChevronUp, 
  FaCheckCircle, 
  FaTimes, 
  FaRegBookmark,
  FaFilter // Importing filter icon
} from "react-icons/fa";
import { Link } from 'react-router-dom';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Import AOS and its styles
import AOS from 'aos';
import 'aos/dist/aos.css';

// Define default filter values
const DEFAULT_FILTERS = {
  accessModel: "Model",
  pricingModel: "Pricing",
  category: "Category",
  industry: "Industry",
};

// AgentCard Component
const AgentCard = ({ agent, saveCounts, handleWishlist }) => (
  <Link to={`agent/${agent._id}`}>
    <motion.div
      className="relative bg-white rounded-lg shadow-md p-6 sm:p-8 hover:shadow-xl transition-shadow duration-300 overflow-hidden w-full sm:w-80 h-72 flex flex-col"
      whileHover={{ translateY: -5 }}
      data-aos="fade-up" // AOS attribute
    >
      {/* Accent Border at the Top */}
      <div className="absolute inset-0 border-t-4 border-blue-500 rounded-lg"></div>

      {/* Side Ribbon */}
      <div className="absolute top-0 left-0 bg-blue-500 text-white px-2 py-1 text-xs font-bold rounded-tr-lg rounded-br-lg">
        {agent.category}
      </div>

      {/* Save Icon at Top Right */}
      <button
        className="absolute top-2 right-2 flex items-center text-blue-500 hover:text-blue-700 transition-colors duration-200"
        onClick={(event) => handleWishlist(event, agent._id)}
        aria-label="Save Agent"
      >
        <FaRegBookmark className="mr-1" /> {saveCounts[agent._id] || 0}
      </button>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center flex-grow">
        {/* Agent Logo */}
        {agent.logo && (
          <img
            src={agent.logo}
            alt={`${agent.name} Logo`}
            className="h-20 w-20 sm:h-24 sm:w-24 mb-4 object-contain"
          />
        )}

        {/* Agent Name */}
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2 sm:mb-4 text-center">
          {agent.name}
        </h3>

        {/* Short Description */}
        <p className="text-gray-600 text-sm sm:text-base mb-4 sm:mb-6 text-center flex-grow">
          {agent.shortDescription || 'No description provided.'}
        </p>
      </div>
    </motion.div>
  </Link>
);

const AgentFilterAndCard = () => {
  // State for sticky filter and its visibility
  const [isSticky, setIsSticky] = useState(false);
  const [showFilter, setShowFilter] = useState(true); // State for filter visibility
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false); // State for filter panel on small screens
  const filterRef = useRef(null);
  const placeholderRef = useRef(null);

  // State for filter options
  const [filterOptions, setFilterOptions] = useState({
    accessModels: [],
    pricingModels: [],
    categories: [],
    industries: [],
  });

  // State for loading and error
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // State to manage which dropdown is open
  const [openDropdown, setOpenDropdown] = useState({
    accessModel: false,
    pricingModel: false,
    category: false,
    industry: false,
  });

  // Selected filter values
  const [selected, setSelected] = useState({ ...DEFAULT_FILTERS });

  // State for agents and save counts
  const [agents, setAgents] = useState([]);
  const [saveCounts, setSaveCounts] = useState({});

  // Animation variants for filter elements
  const filterVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5 } },
    hover: { scale: 1.02, transition: { type: "spring", stiffness: 300 } },
  };

  // Fetch filter options and agents from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch filter options
        const filtersResponse = await axios.get('https://backend-1-sval.onrender.com/api/agents/filters');
        console.log('Filter API Response:', filtersResponse.data);
        setFilterOptions({
          accessModels: filtersResponse.data.accessModels || [],
          pricingModels: filtersResponse.data.pricingModels || [],
          categories: filtersResponse.data.categories || [],
          industries: filtersResponse.data.industries || [],
        });

        // Fetch agents
        const agentsResponse = await axios.get('https://backend-1-sval.onrender.com/api/agents/all');
        const initialSaves = {};
        agentsResponse.data.forEach(agent => {
          initialSaves[agent._id] = agent.savedByCount || 0;
        });
        setSaveCounts(initialSaves);
        setAgents(agentsResponse.data || []);

        setLoading(false);
        AOS.refresh(); // Refresh AOS after data fetch
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(true);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Initialize AOS
  useEffect(() => {
    AOS.init({
      duration: 800, // Animation duration in ms
      easing: 'ease-in-out', // Easing option
      once: true, // Whether animation should happen only once
    });
  }, []);

  // Sticky filter functionality
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (filterRef.current && placeholderRef.current) {
            const filterTop = placeholderRef.current.getBoundingClientRect().top;
            // Adjust the offset as needed (e.g., 70px)
            if (filterTop <= 70) {
              if (!isSticky) {
                setIsSticky(true);
                placeholderRef.current.style.height = `${filterRef.current.offsetHeight}px`;
              }
            } else {
              if (isSticky) {
                setIsSticky(false);
                placeholderRef.current.style.height = '0px';
              }
            }
          }

          // Scroll Detection for Bottom
          const scrollTop = window.scrollY;
          const windowHeight = window.innerHeight;
          const documentHeight = document.documentElement.scrollHeight;

          // If the user has scrolled to within 300px of the bottom
          if (scrollTop + windowHeight >= documentHeight - 300) {
            if (showFilter) setShowFilter(false);
          } else {
            if (!showFilter) setShowFilter(true);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isSticky, showFilter]);

  // Handle selection of an option
  const handleSelect = (filterType, value) => {
    console.log(`Selecting ${filterType}: ${value}`);
    setSelected(prev => ({
      ...prev,
      [filterType]: value
    }));
    setOpenDropdown(prev => ({
      ...prev,
      [filterType]: false
    }));
  };

  // Reset individual filter to default
  const resetFilter = (filterType) => {
    console.log(`Resetting filter: ${filterType}`);
    setSelected(prev => ({
      ...prev,
      [filterType]: DEFAULT_FILTERS[filterType]
    }));
  };

  // Toggle dropdown visibility
  const toggleDropdown = (filterType) => {
    setOpenDropdown(prev => ({
      ...prev,
      [filterType]: !prev[filterType]
    }));
  };

  // Close all dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setOpenDropdown({
          accessModel: false,
          pricingModel: false,
          category: false,
          industry: false,
        });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle wishlist functionality
  const handleWishlist = async (event, agentId) => {
    event.preventDefault();
    event.stopPropagation();

    try {
    

      const url = `https://backend-1-sval.onrender.com/api/users/wishlist/${agentId}`;
      const method = 'post';

      const response = await axios({
        method,
        url,
       
        withCredentials: true,
      });

      const message = response.status === 200 ? 'Agent added to wishlist!' : 'Agent removed from wishlist!';
      toast.success(message);

      setSaveCounts((prevSaveCounts) => ({
        ...prevSaveCounts,
        [agentId]: response.data.agent.savedByCount,
      }));
    } catch (error) {
      toast.error('An error occurred while updating the wishlist.');
      console.error('Error updating wishlist:', error);
    }
  };

  // Filter agents based on selected filters
  const filteredAgents = agents.filter(agent =>
    ((selected.accessModel === 'Model') || agent.accessModel === selected.accessModel) &&
    ((selected.pricingModel === 'Pricing') || agent.pricingModel === selected.pricingModel) &&
    ((selected.category === 'Category') || agent.category === selected.category) &&
    ((selected.industry === 'Industry') || agent.industry === selected.industry)
  );

  const categorizedAgents = filteredAgents.reduce((categories, agent) => {
    const category = agent.category || 'Uncategorized';
    if (!categories[category]) {
      categories[category] = [];
    }
    categories[category].push(agent);
    return categories;
  }, {});

  // Animation variants for agent cards
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.4, ease: 'easeOut' }
    },
    hover: {
      scale: 1.05,
      y: -10,
      transition: { type: 'spring', stiffness: 300 }
    },
    tap: {
      scale: 0.95
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-4">
        <p className="text-gray-500">Loading filters and agents...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center p-4">
        <p className="text-red-500">Failed to load filters and agents.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Placeholder to maintain layout when fixed */}
      <div ref={placeholderRef}></div>

      {/* Toggle Button for Small Screens */}
      {/* <div className="flex justify-end p-4 md:hidden">
        <button
          onClick={() => setIsFilterPanelOpen(true)}
          className="flex items-center px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors duration-200"
          aria-label="Open Filters"
        >
          <FaFilter className="mr-2" /> Filters
        </button>
      </div> */}

      {/* Filter Panel for Small Screens */}
      <AnimatePresence>
        {isFilterPanelOpen && (
          <>
            {/* Overlay */}
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsFilterPanelOpen(false)}
            />

            {/* Slide-In Filter Panel */}
            <motion.div
              className="fixed top-0 left-0 right-0 bg-white z-50 p-4 overflow-y-auto max-h-full"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              data-aos="fade-down"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold">Filters</h2>
                <button
                  onClick={() => setIsFilterPanelOpen(false)}
                  className="text-gray-700 hover:text-gray-900"
                  aria-label="Close Filters"
                >
                  <FaTimes size={24} />
                </button>
              </div>
              <div className="space-y-4">
                {/* Access Model Dropdown */}
                <div className="relative" data-aos="fade-right">
                  <button
                    onClick={() => toggleDropdown('accessModel')}
                    className="w-full text-gray-700 text-base border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none hover:bg-indigo-50 transition-colors duration-200 flex items-center justify-between relative"
                    aria-haspopup="true"
                    aria-expanded={openDropdown.accessModel}
                  >
                    <span>{selected.accessModel}</span>
                    <div className="flex items-center space-x-1">
                      {openDropdown.accessModel ? <FaChevronUp /> : <FaChevronDown />}
                      {selected.accessModel !== DEFAULT_FILTERS.accessModel && (
                        <FaTimes
                          className="text-gray-500 hover:text-indigo-500 cursor-pointer ml-2"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering dropdown toggle
                            resetFilter('accessModel');
                          }}
                          aria-label="Clear Access Model Filter"
                        />
                      )}
                    </div>
                  </button>
                  {openDropdown.accessModel && (
                    <motion.ul
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50"
                    >
                      {filterOptions.accessModels.length === 0 ? (
                        <li className="px-4 py-3 text-gray-500">No Access Models Available</li>
                      ) : (
                        filterOptions.accessModels.map((model) => (
                          <li
                            key={model}
                            onClick={() => handleSelect('accessModel', model)}
                            className={`flex items-center px-4 py-3 cursor-pointer hover:bg-indigo-100 ${
                              selected.accessModel === model ? 'bg-indigo-100' : ''
                            }`}
                          >
                            <FaCheckCircle className="text-indigo-500 mr-2" />
                            <span>{model}</span>
                          </li>
                        ))
                      )}
                    </motion.ul>
                  )}
                </div>

                {/* Pricing Dropdown */}
                <div className="relative" data-aos="fade-up">
                  <button
                    onClick={() => toggleDropdown('pricingModel')}
                    className="w-full text-gray-700 text-base border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none hover:bg-indigo-50 transition-colors duration-200 flex items-center justify-between relative"
                    aria-haspopup="true"
                    aria-expanded={openDropdown.pricingModel}
                  >
                    <span>{selected.pricingModel}</span>
                    <div className="flex items-center space-x-1">
                      {openDropdown.pricingModel ? <FaChevronUp /> : <FaChevronDown />}
                      {selected.pricingModel !== DEFAULT_FILTERS.pricingModel && (
                        <FaTimes
                          className="text-gray-500 hover:text-indigo-500 cursor-pointer ml-2"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering dropdown toggle
                            resetFilter('pricingModel');
                          }}
                          aria-label="Clear Pricing Model Filter"
                        />
                      )}
                    </div>
                  </button>
                  {openDropdown.pricingModel && (
                    <motion.ul
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50"
                    >
                      {filterOptions.pricingModels.length === 0 ? (
                        <li className="px-4 py-3 text-gray-500">No Pricing Models Available</li>
                      ) : (
                        filterOptions.pricingModels.map((price) => (
                          <li
                            key={price}
                            onClick={() => handleSelect('pricingModel', price)}
                            className={`flex items-center px-4 py-3 cursor-pointer hover:bg-indigo-100 ${
                              selected.pricingModel === price ? 'bg-indigo-100' : ''
                            }`}
                          >
                            <FaCheckCircle className="text-indigo-500 mr-2" />
                            <span>{price}</span>
                          </li>
                        ))
                      )}
                    </motion.ul>
                  )}
                </div>

                {/* Category Dropdown */}
                <div className="relative" data-aos="fade-left">
                  <button
                    onClick={() => toggleDropdown('category')}
                    className="w-full text-gray-700 text-base border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none hover:bg-indigo-50 transition-colors duration-200 flex items-center justify-between relative"
                    aria-haspopup="true"
                    aria-expanded={openDropdown.category}
                  >
                    <span>{selected.category}</span>
                    <div className="flex items-center space-x-1">
                      {openDropdown.category ? <FaChevronUp /> : <FaChevronDown />}
                      {selected.category !== DEFAULT_FILTERS.category && (
                        <FaTimes
                          className="text-gray-500 hover:text-indigo-500 cursor-pointer ml-2"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering dropdown toggle
                            resetFilter('category');
                          }}
                          aria-label="Clear Category Filter"
                        />
                      )}
                    </div>
                  </button>
                  {openDropdown.category && (
                    <motion.ul
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50"
                    >
                      {filterOptions.categories.length === 0 ? (
                        <li className="px-4 py-3 text-gray-500">No Categories Available</li>
                      ) : (
                        filterOptions.categories.map((cat) => (
                          <li
                            key={cat}
                            onClick={() => handleSelect('category', cat)}
                            className={`flex items-center px-4 py-3 cursor-pointer hover:bg-indigo-100 ${
                              selected.category === cat ? 'bg-indigo-100' : ''
                            }`}
                          >
                            <FaCheckCircle className="text-indigo-500 mr-2" />
                            <span>{cat}</span>
                          </li>
                        ))
                      )}
                    </motion.ul>
                  )}
                </div>

                {/* Industry Dropdown */}
                <div className="relative" data-aos="fade-right">
                  <button
                    onClick={() => toggleDropdown('industry')}
                    className="w-full text-gray-700 text-base border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none hover:bg-indigo-50 transition-colors duration-200 flex items-center justify-between relative"
                    aria-haspopup="true"
                    aria-expanded={openDropdown.industry}
                  >
                    <span>{selected.industry}</span>
                    <div className="flex items-center space-x-1">
                      {openDropdown.industry ? <FaChevronUp /> : <FaChevronDown />}
                      {selected.industry !== DEFAULT_FILTERS.industry && (
                        <FaTimes
                          className="text-gray-500 hover:text-indigo-500 cursor-pointer ml-2"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering dropdown toggle
                            resetFilter('industry');
                          }}
                          aria-label="Clear Industry Filter"
                        />
                      )}
                    </div>
                  </button>
                  {openDropdown.industry && (
                    <motion.ul
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50"
                    >
                      {filterOptions.industries.length === 0 ? (
                        <li className="px-4 py-3 text-gray-500">No Industries Available</li>
                      ) : (
                        filterOptions.industries.map((ind) => (
                          <li
                            key={ind}
                            onClick={() => handleSelect('industry', ind)}
                            className={`flex items-center px-4 py-3 cursor-pointer hover:bg-indigo-100 ${
                              selected.industry === ind ? 'bg-indigo-100' : ''
                            }`}
                          >
                            <FaCheckCircle className="text-indigo-500 mr-2" />
                            <span>{ind}</span>
                          </li>
                        ))
                      )}
                    </motion.ul>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Filter Bar for Medium and Larger Screens */}
      <AnimatePresence>
        {showFilter && (
          <motion.div
            ref={filterRef}
            className={`w-full z-40 hidden md:block ${
              isSticky
                ? "fixed top-[70px] left-0 right-0 shadow-lg bg-white"
                : "relative bg-white"
            }`}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            data-aos="fade-down" // AOS attribute
          >
            <div className="max-w-6xl mx-auto px-4 py-3">
              <motion.div
                className="w-full"
                variants={filterVariants}
                initial="hidden"
                animate="visible"
              >
                <div className="flex flex-col md:flex-row items-center justify-center space-y-4 md:space-y-0 md:space-x-6">
                  {/* Access Model Dropdown */}
                  <div className="relative w-full md:w-1/4" data-aos="fade-right">
                    <button
                      onClick={() => toggleDropdown('accessModel')}
                      className="w-full text-gray-700 text-base border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none hover:bg-indigo-50 transition-colors duration-200 flex items-center justify-between relative"
                      aria-haspopup="true"
                      aria-expanded={openDropdown.accessModel}
                    >
                      <span>{selected.accessModel}</span>
                      <div className="flex items-center space-x-1">
                        {openDropdown.accessModel ? <FaChevronUp /> : <FaChevronDown />}
                        {selected.accessModel !== DEFAULT_FILTERS.accessModel && (
                          <FaTimes
                            className="text-gray-500 hover:text-indigo-500 cursor-pointer ml-2"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent triggering dropdown toggle
                              resetFilter('accessModel');
                            }}
                            aria-label="Clear Access Model Filter"
                          />
                        )}
                      </div>
                    </button>
                    {openDropdown.accessModel && (
                      <motion.ul
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50"
                      >
                        {filterOptions.accessModels.length === 0 ? (
                          <li className="px-4 py-3 text-gray-500">No Access Models Available</li>
                        ) : (
                          filterOptions.accessModels.map((model) => (
                            <li
                              key={model}
                              onClick={() => handleSelect('accessModel', model)}
                              className={`flex items-center px-4 py-3 cursor-pointer hover:bg-indigo-100 ${
                                selected.accessModel === model ? 'bg-indigo-100' : ''
                              }`}
                            >
                              <FaCheckCircle className="text-indigo-500 mr-2" />
                              <span>{model}</span>
                            </li>
                          ))
                        )}
                      </motion.ul>
                    )}
                  </div>

                  {/* Pricing Dropdown */}
                  <div className="relative w-full md:w-1/4" data-aos="fade-up">
                    <button
                      onClick={() => toggleDropdown('pricingModel')}
                      className="w-full text-gray-700 text-base border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none hover:bg-indigo-50 transition-colors duration-200 flex items-center justify-between relative"
                      aria-haspopup="true"
                      aria-expanded={openDropdown.pricingModel}
                    >
                      <span>{selected.pricingModel}</span>
                      <div className="flex items-center space-x-1">
                        {openDropdown.pricingModel ? <FaChevronUp /> : <FaChevronDown />}
                        {selected.pricingModel !== DEFAULT_FILTERS.pricingModel && (
                          <FaTimes
                            className="text-gray-500 hover:text-indigo-500 cursor-pointer ml-2"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent triggering dropdown toggle
                              resetFilter('pricingModel');
                            }}
                            aria-label="Clear Pricing Model Filter"
                          />
                        )}
                      </div>
                    </button>
                    {openDropdown.pricingModel && (
                      <motion.ul
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50"
                      >
                        {filterOptions.pricingModels.length === 0 ? (
                          <li className="px-4 py-3 text-gray-500">No Pricing Models Available</li>
                        ) : (
                          filterOptions.pricingModels.map((price) => (
                            <li
                              key={price}
                              onClick={() => handleSelect('pricingModel', price)}
                              className={`flex items-center px-4 py-3 cursor-pointer hover:bg-indigo-100 ${
                                selected.pricingModel === price ? 'bg-indigo-100' : ''
                              }`}
                            >
                              <FaCheckCircle className="text-indigo-500 mr-2" />
                              <span>{price}</span>
                            </li>
                          ))
                        )}
                      </motion.ul>
                    )}
                  </div>

                  {/* Category Dropdown */}
                  <div className="relative w-full md:w-1/4" data-aos="fade-left">
                    <button
                      onClick={() => toggleDropdown('category')}
                      className="w-full text-gray-700 text-base border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none hover:bg-indigo-50 transition-colors duration-200 flex items-center justify-between relative"
                      aria-haspopup="true"
                      aria-expanded={openDropdown.category}
                    >
                      <span>{selected.category}</span>
                      <div className="flex items-center space-x-1">
                        {openDropdown.category ? <FaChevronUp /> : <FaChevronDown />}
                        {selected.category !== DEFAULT_FILTERS.category && (
                          <FaTimes
                            className="text-gray-500 hover:text-indigo-500 cursor-pointer ml-2"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent triggering dropdown toggle
                              resetFilter('category');
                            }}
                            aria-label="Clear Category Filter"
                          />
                        )}
                      </div>
                    </button>
                    {openDropdown.category && (
                      <motion.ul
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50"
                      >
                        {filterOptions.categories.length === 0 ? (
                          <li className="px-4 py-3 text-gray-500">No Categories Available</li>
                        ) : (
                          filterOptions.categories.map((cat) => (
                            <li
                              key={cat}
                              onClick={() => handleSelect('category', cat)}
                              className={`flex items-center px-4 py-3 cursor-pointer hover:bg-indigo-100 ${
                                selected.category === cat ? 'bg-indigo-100' : ''
                              }`}
                            >
                              <FaCheckCircle className="text-indigo-500 mr-2" />
                              <span>{cat}</span>
                            </li>
                          ))
                        )}
                      </motion.ul>
                    )}
                  </div>

                  {/* Industry Dropdown */}
                  <div className="relative w-full md:w-1/4" data-aos="fade-right">
                    <button
                      onClick={() => toggleDropdown('industry')}
                      className="w-full text-gray-700 text-base border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none hover:bg-indigo-50 transition-colors duration-200 flex items-center justify-between relative"
                      aria-haspopup="true"
                      aria-expanded={openDropdown.industry}
                    >
                      <span>{selected.industry}</span>
                      <div className="flex items-center space-x-1">
                        {openDropdown.industry ? <FaChevronUp /> : <FaChevronDown />}
                        {selected.industry !== DEFAULT_FILTERS.industry && (
                          <FaTimes
                            className="text-gray-500 hover:text-indigo-500 cursor-pointer ml-2"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent triggering dropdown toggle
                              resetFilter('industry');
                            }}
                            aria-label="Clear Industry Filter"
                          />
                        )}
                      </div>
                    </button>
                    {openDropdown.industry && (
                      <motion.ul
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute mt-2 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto z-50"
                      >
                        {filterOptions.industries.length === 0 ? (
                          <li className="px-4 py-3 text-gray-500">No Industries Available</li>
                        ) : (
                          filterOptions.industries.map((ind) => (
                            <li
                              key={ind}
                              onClick={() => handleSelect('industry', ind)}
                              className={`flex items-center px-4 py-3 cursor-pointer hover:bg-indigo-100 ${
                                selected.industry === ind ? 'bg-indigo-100' : ''
                              }`}
                            >
                              <FaCheckCircle className="text-indigo-500 mr-2" />
                              <span>{ind}</span>
                            </li>
                          ))
                        )}
                      </motion.ul>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Agent Cards */}
      <div className="relative w-full overflow-hidden">
        <motion.div 
          className="max-w-6xl w-full mx-auto p-6 relative z-10" 
          initial="hidden" 
          animate="visible" 
          variants={containerVariants}
        >
          {Object.keys(categorizedAgents).map((category, categoryIndex) => (
            <motion.div key={categoryIndex} className="mb-12" data-aos="fade-up">
              {/* Category Header */}
              <motion.div
                className="mb-4 flex items-center space-x-4"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 1 }}
                data-aos="fade-right"
              >
                <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-primaryBlue2">
                  Explore {category}
                </h1>
                <motion.div className="bg-gradient-to-r from-indigo-500 to-blue-400 h-1 w-20 animate-pulse" data-aos="fade-left"></motion.div>
              </motion.div>

              {/* Category Description */}
              <motion.p
                className="text-gray-500 text-lg italic mb-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
                data-aos="fade-up"
              >
                Discover top agents in the {category} space, crafted for your needs.
              </motion.p>

              <hr className="border-t bg-gray-300 my-4" />

              {/* Agent Grid */}
              <motion.div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
                {categorizedAgents[category].slice(0, 6).map(agent => (
                  <AgentCard 
                    key={agent._id} 
                    agent={agent} 
                    saveCounts={saveCounts} 
                    handleWishlist={handleWishlist} 
                  />
                ))}
              </motion.div>

              {/* More Button */}
              <div className="flex justify-end mt-4">
                <Link to="/allagent">
                  <motion.button
                    className="flex items-center px-4 py-2 text-sm text-gray-500 border border-gray-300 rounded-full hover:bg-gray-100 hover:text-indigo-500 focus:outline-none transition-all duration-200 space-x-1 shadow-sm"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    data-aos="fade-up"
                  >
                    <span>More</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </motion.button>
                </Link>
              </div>
            </motion.div>
          ))}

          {/* Sentinel Element (Optional, can be removed if using scroll detection) */}
          {/* <div ref={bottomRef} className="sentinel"></div> */}
        </motion.div>
      </div>
    </div>
  );
};

export default AgentFilterAndCard;
