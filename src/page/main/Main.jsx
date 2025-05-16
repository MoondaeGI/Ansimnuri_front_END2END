import React, { useState, useEffect } from 'react';
import { ChatBot, Map, News } from './component';
import './component/css/main.css';
import { Steps } from 'intro.js-react';
import 'intro.js/introjs.css';

const Main = () => {
  const [isChatBotOpen, setIsChatBotOpen] = useState(false);
  const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [stepsEnabled, setStepsEnabled] = useState(false);

useEffect(() => {
  const done = localStorage.getItem("isIntroDone");
  if (done !== "true") {
    setStepsEnabled(true);  
  }
}, []);

  const steps = [
    {
      element: ".step1",
      title: "뉴스 토글 버튼",
      intro: "이 버튼을 눌러 실시간 범죄 관련 뉴스를 확인할 수 있습니다."
    },
    {
      element: ".step2",
      title: "지도 기능",
      intro: "현재 위치 기반 안전 정보를 지도에서 확인할 수 있습니다."
    },
    {
      element: ".step3",
      title: "안심 챗봇",
      intro: "안전 관련 질문을 챗봇에게 할 수 있습니다."
    }
  ];

  const stepsOption = {
    nextLabel: "다음",
    prevLabel: "이전",
    doneLabel: "확인",
    skipLabel: "건너뛰기"
  };

  const toggleChatBot = () => {
    setIsChatBotOpen(prev => !prev);
  };

  const toggleNews = () => {
    setIsNewsOpen(prev => !prev);
  };

  return (
    <div className="mainContainer">
      <div className="mainContent">
        <Steps
          enabled={stepsEnabled}
          steps={steps}
          initialStep={0}
          options={stepsOption}
          onExit={() => {
            setStepsEnabled(false);
            localStorage.setItem("isIntroDone", "true");
          }}
          onComplete={() => {
            setStepsEnabled(false);
            localStorage.setItem("isIntroDone", "true");
          }}
        />

     
        <button className="newsToggleBtn step1" onClick={toggleNews}>
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

  
        <div className="mapSection step2">
          <div className="mapContainer">
            <Map />
          </div>
        </div>

    
        <button className="chatbotBtn step3" onClick={toggleChatBot}>
          💬
        </button>

        {isChatBotOpen && (
          <div className="infoPanel">
            <div className="infoSection">
              <div className="chatbotHeader">
                <span>안심 챗봇</span>
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
