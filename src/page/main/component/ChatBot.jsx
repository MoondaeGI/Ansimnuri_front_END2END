// ChatBot.jsx
import React, { useState, useRef, useEffect } from "react";
import "./css/ChatBot.css";

export const ChatBot = () => {
  const [chatLog, setChatLog] = useState([]);
  const [question, setQuestion] = useState("");
  const [selectedMainMenu, setSelectedMainMenu] = useState(null);
  const [selectedSubMenu, setSelectedSubMenu] = useState(null);
  const [policeSearchMode, setPoliceSearchMode] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatLog]);

  const menuOptions = [
    "지구대 / 경찰서 안내",
    "안전한 귀가 경로 추천",
    "범죄 피해 대처 요령",
    "범죄 피해 지원 제도",
    "자주 묻는 질문 (FAQ)"
  ];

  const subMenus = {
    "지구대 / 경찰서 안내": [],
    "범죄 피해 대처 요령": [
      "강력범죄 피해시 대처요령",
      "성폭력 피해시 대처요령",
      "가정폭력 피해시 대처요령",
      "학교폭력 피해시 대처요령"
    ],
    "범죄 피해 지원 제도": [
      "경제적 지원제도",
      "법률적 지원제도",
      "심리치료 지원제도",
      "주거 지원제도"
    ],
    "자주 묻는 질문 (FAQ)": [
      "무슨 사이트인가요?",
      "이용 방법은?",
      "GPS 꺼도 되나요?",
      "비회원도 가능해요?",
      "관리자에게 질문은?"
    ]
  };

  const subDetailMenus = {
    "경제적 지원제도": [
      "범죄피해자구조금제도",
      "긴급복지 지원제도",
      "무보험차량·뺑소니 피해자 구조제도",
      "이전비 지원제도",
      "주거지원제도",
      "자동차사고 피해가족 지원제도",
      "배상명령제도",
      "보험급여 지원제도"
    ],
    "법률적 지원제도": [
      "무료법률구조제도",
      "형사조정제도",
      "법률홈닥터",
      "화해제도"
    ],
    "심리치료 지원제도": [
      "스마일센터를 통한 심리치료 지원",
      "CARE(피해자심리전문요원)"
    ],
    "주거 지원제도": [
      "피해자 임시숙소 제도",
      "성폭력피해자 보호시설",
      "가정폭력피해자 보호시설"
    ]
  };

  const sendQuestion = async (input) => {
    if (!input.trim()) return;

    const updated = [...chatLog, { role: "user", content: input }];
    setChatLog(updated);
    setQuestion("");

    if (policeSearchMode) {
      try {
        const res = await fetch(`http://localhost:80/chatBot/police?keyword=${encodeURIComponent(input)}`);
        const policeList = await res.json();

        const formatted = Array.isArray(policeList) && policeList.length > 0
          ? policeList.map((p, i) => `${i + 1}. ${p.name} (${p.address})`).join("\n")
          : "해당 지역에 대한 경찰서 정보를 찾을 수 없습니다.";

        setChatLog([...updated, { role: "assistant", content: formatted }]);
      } catch (error) {
        console.error("경찰서 조회 실패:", error);
        setChatLog([...updated, { role: "assistant", content: "오류가 발생했습니다. 다시 시도해주세요." }]);
      }
      return;
    }

    let endpoint = null;
    if (selectedMainMenu === "범죄 피해 대처 요령") endpoint = "guide";
    if (selectedMainMenu === "범죄 피해 지원 제도" && selectedSubMenu) endpoint = "support";
    if (selectedMainMenu === "자주 묻는 질문 (FAQ)") endpoint = "faq";

    if (endpoint) {
      const res = await fetch(`http://localhost:80/chatBot/${endpoint}?question=${encodeURIComponent(input)}`);
      const answer = await res.text();
      setChatLog([...updated, { role: "assistant", content: answer }]);
      return;
    }

    const prompt = `질문: ${input}`;
    const res = await fetch("http://localhost:80/chatBot/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content: "당신은 안심누리의 한국어 전용 챗봇입니다. 반드시 한국어로, 말풍선 UI에 어울리는 문장으로 깔끔하게 답변해주세요. 중국어나 영어는 절대 사용하지 마세요."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      })
    });

    const data = await res.json();
    const raw = data.choices?.[0]?.message?.content || "답변이 없습니다.";
    const clean = raw.replace(/\n{2,}/g, "\n").trim();

    setChatLog([...updated, { role: "assistant", content: clean }]);
  };

  const resetChat = () => {
    setChatLog([]);
    setQuestion("");
    setSelectedMainMenu(null);
    setSelectedSubMenu(null);
    setPoliceSearchMode(false);
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">🧐 NuriBot 😎</div>
      <div className="chatbot-subtitle">
        안녕하세요! 저는 안심누리의 누리봇입니다. <br />
        🔎 어떤 도움이 필요하신가요?
      </div>

      {policeSearchMode && (
        <div className="top-reset-button">
          <button onClick={resetChat} className="menu-button">↩ 처음으로</button>
        </div>
      )}

      {!selectedMainMenu && (
        <div className="menu-list single-column">
          {menuOptions.map((option, i) => (
            <button key={i} className="menu-button" onClick={() => {
              setSelectedMainMenu(option);
              setSelectedSubMenu(null);
              if (option === "지구대 / 경찰서 안내") setPoliceSearchMode(true);
              if (subMenus[option]?.length === 0) {
                setChatLog(prev => [...prev, {
                  role: "assistant",
                  content: `'${option}' 메뉴를 선택하셨습니다. 안내받고 싶은 지역명을 입력해주세요.`
                }]);
              }
            }}>{option}</button>
          ))}
        </div>
      )}

      {selectedMainMenu && !selectedSubMenu && subMenus[selectedMainMenu]?.length > 0 && (
        <div className="menu-list single-column">
          {subMenus[selectedMainMenu].map((option, i) => (
            <button key={i} className="menu-button" onClick={() => {
              if (selectedMainMenu === "범죄 피해 지원 제도" && subDetailMenus[option]) {
                setSelectedSubMenu(option);
              } else {
                sendQuestion(option);
              }
            }}>{option}</button>
          ))}
          <button className="menu-button" onClick={resetChat}>↩ 처음으로</button>
        </div>
      )}

      {selectedSubMenu && subDetailMenus[selectedSubMenu]?.length > 0 && (
        <div className="menu-list single-column">
          {subDetailMenus[selectedSubMenu].map((item, i) => (
            <button key={i} className="menu-button" onClick={() => sendQuestion(item)}>{item}</button>
          ))}
          <button className="menu-button" onClick={resetChat}>↩ 처음으로</button>
        </div>
      )}

      <div className="chat-window">
        {chatLog.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.role === "user" ? "user" : "assistant"}`}>
            {msg.content}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      <div className="input-area">
        <input
          type="text"
          className="chat-input"
          placeholder={policeSearchMode ? "예: 강남구, 신림, 서원동" : "챗봇의 도움이 필요하신가요?"}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendQuestion(question)}
        />
        <button onClick={() => sendQuestion(question)} className="send-btn">전송</button>
      </div>
    </div>
  );
};
