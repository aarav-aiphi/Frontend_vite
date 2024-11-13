import React, { useState, useEffect, useRef ,useContext} from "react";
import { motion } from "framer-motion";
// import Search from "../Components/Search/search";
// import { Card } from "../Components/AgentsCtgCard.js/Card";
import AgentFilterAndCard from "../Components/AgentFilterandCard";
import { Agents } from "../Components/FeaturedAgent/Agents";
import { AuthContext } from "../context/AuthContext";
import SearchComponent from "../Components/PromptSearch/Search";
import bg3 from "../Images/whitebg.jpg";
const Body = () => {
  const [model, setModel] = useState("Model");
  const [pricing, setPricing] = useState("Pricing");
  const [category, setCategory] = useState('Category');
  const [industry, setIndustry] = useState("Industry");
  const isAuthenticated = useContext(AuthContext);
  const cardSectionRef = useRef(null);
  const [isCardSectionInView, setIsCardSectionInView] = useState(true);

  // Observe when the card section is in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsCardSectionInView(entry.isIntersecting),
      { threshold: 0.1 }
    );

    if (cardSectionRef.current) {
      observer.observe(cardSectionRef.current);
    }

    return () => {
      if (cardSectionRef.current) {
        observer.unobserve(cardSectionRef.current);
      }
    };
  }, [isAuthenticated]);

  return (
    <>
      <div className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-blue-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h1
            className="text-6xl font-extrabold tracking-tight text-primaryBlue drop-shadow-lg"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          >
            Transform{" "}
            <motion.span
              className="text-primaryBlue2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.8, delay: 0.2 }}
            >
              your business{" "}
            </motion.span>
            with AiAzent
          </motion.h1>
          <motion.p
            className="mt-4 text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, delay: 0.5 }}
          >
            Leverage the power of AI to automate processes, boost productivity, and unlock new possibilities for growth.
          </motion.p>
          <motion.div
            className="mt-10 flex justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 1 }}
          >
            <button className="bg-primaryBlue3 text-white font-semibold py-4 px-10 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition transform duration-300">
              Get Started with AiAzent
            </button>
          </motion.div>
        </div>
      </div>
<Agents/>
      <div className="bg-cover bg-center "
      style={{
        backgroundImage: `url(${bg3})`,
      }}
      >

        <SearchComponent/>

      </div>

      

      <div 
        className="mt-5" 
        style={{ backgroundImage: `url(${bg3})` }}
      >
        <AgentFilterAndCard />
      </div>
    </>
  );
};

export default Body;