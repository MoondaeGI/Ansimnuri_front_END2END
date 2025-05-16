import React, { useState } from 'react';
import { Chat, ChatBot, Map, News } from './component';
import './component/css/main.css';

const Main = () => {
 const [isChatBotOpen, setIsChatBotOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  const toggleChatBot = () => {
    setIsChatBotOpen(prev => !prev);
  };
  return (
    <div className="mainContainer">
      <div className="mainContent">
        <div className="chatListPanel">
          <div className="newsBox">
            <p>뉴스</p>
          </div>

          <div className="newsList">
            <News />
          </div>
        </div>

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