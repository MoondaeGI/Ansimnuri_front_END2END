import React, { useState } from 'react';
import { Chat, ChatBot, Map, News } from './component';
import './component/css/main.css';

const Main = () => {
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);
  const [isNewsOpen, setIsNewsOpen] = useState(false); // 뉴스 토글 상태 추가

  const toggleChatBot = () => {
    setIsChatBotOpen(prev => !prev);
  };

  const toggleNews = () => {
    setIsNewsOpen(prev => !prev);
  };

  return (
    <div className="mainContainer">
      <div className="mainContent">
          <button className="newsToggleBtn" onClick={toggleNews}>
            📰
          </button>
          {isNewsOpen && (
            <div className="newsPanel">
              <div className="newsBox">
                <div className="newsHeader">
                  <span>뉴스</span>
                  <button onClick={toggleNews}>✕</button>
                </div>
              </div>
              <div className="newsList">
                <News />
              </div>
            </div>
          )}
      

        <div className="mapSection">
          <div className="mapContainer">
            <Map />
          </div>
        </div>

        <button className="chatbotBtn" onClick={toggleChatBot}>
          💬
        </button>
        {isChatBotOpen && (
          <div className="infoPanel">
            <div className="infoSection">
              <div className="infoTitle">
                <div className="chatbotHeader">
                  <span>안심 챗봇</span>
                
                </div>
              </div>
              <ChatBot />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Main;
