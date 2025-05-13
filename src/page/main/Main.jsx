import React, { useState } from 'react';
import { Chat, ChatBot, Map, News } from './component';
import './component/css/main.css';

const Main = () => {

  const [searchText, setSearchText] = useState('');

  return (
    <div className="mainContainer">
      <div className="mainContent">
        <div className="chatListPanel">
          <div className="newsBox">
           <p>뉴스</p>
          </div>

          <div className="newsList">
            <News/>
          </div>
        </div>

        <div className="mapSection">
          <div className="mapContainer">
            <Map />
          </div>
        </div>

        <div className="infoPanel">
          <div className="infoSection">
            <div className="infoTitle">챗봇</div>
            <ChatBot/>
          </div>

        </div>
      </div>

      <div className="chatSection">
        <div className="chatTitle">채팅</div>
        <div className="chatInput">
          <input type="text" placeholder="메시지를 입력하세요" />
        </div>
      </div>
    </div>
    
  );
};

export default Main;