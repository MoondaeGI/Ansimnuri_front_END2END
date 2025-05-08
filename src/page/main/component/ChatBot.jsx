import React, { useState } from "react";
import "./css/ChatBot.css";

export const ChatBot = () => {
  const [chatLog, setChatLog] = useState([]);
  const [question, setQuestion] = useState("");
  const [selectedMainMenu, setSelectedMainMenu] = useState(null);

  const menuOptions = [
    "지구대 / 경찰서 안내",
    "안전한 귀가 경로 추천",
    "범죄 피해 대처 요령",
    "범죄 피해 지원 제도",
    "자주 묻는 질문 (FAQ)"
  ];

  const subMenus = {
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
      "기타 지원제도"
    ]
  };

  const sendQuestion = async (input) => {
    if (!input.trim()) return;

    const updated = [...chatLog, { role: "user", content: input }];
    setChatLog(updated);
    setQuestion("");
    setSelectedMainMenu(null);

    const prompt = `SafeRoad 사용자에게 다음 질문에 대해 안내해줘. 반드시 한국어로, UI 채팅창에 보기 좋게 정돈된 형태로 대답하되:
    - 문장은 짧고 명확하게 작성
    - 목록이 필요하면 다음 형식으로 작성: 
    1) 내용
    2) 내용
    ...
    - 각 항목은 줄바꿈을 포함해 구분되게 표현
    - 마크다운 기호(###, **, -, *, _, 숫자. 등)는 절대 사용하지 말 것
    - 줄바꿈은 자연스럽게 하고, 말풍선에 적합하도록 문단 간 간격을 고려
    질문: ${input}`;

    const res = await fetch("http://localhost:8080/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "당신은 SafeRoad라는 서비스의 한국어 전용 챗봇입니다. 어떤 질문이 와도 반드시 한국어로만, 문장 단위로, 깔끔하게 답변하세요. 중국어나 영어는 절대 사용하지 마세요."
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
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">💬 ChatBot</div>
      <div className="chatbot-subtitle">🔎 무엇을 도와드릴까요?</div>

      {!selectedMainMenu && (
        <div className="menu-list single-column">
          {menuOptions.map((option, i) => (
            subMenus[option] ? (
              <button key={i} className="menu-button" onClick={() => setSelectedMainMenu(option)}>
                {option}
              </button>
            ) : (
              <button key={i} className="menu-button" onClick={() => sendQuestion(option)}>
                {option}
              </button>
            )
          ))}
        </div>
      )}

      {selectedMainMenu && (
        <div className="menu-list single-column">
          {subMenus[selectedMainMenu].map((option, i) => (
            <button key={i} className="menu-button" onClick={() => sendQuestion(option)}>
              {option}
            </button>
          ))}
          <button className="menu-button" onClick={resetChat}>🔙 처음으로</button>
        </div>
      )}

      <div className="chat-window">
        {chatLog.map((msg, i) => (
          <div key={i} className={`chat-bubble ${msg.role === "user" ? "user" : "assistant"}`}>
            {msg.content}
          </div>
        ))}
      </div>

      <div className="input-area">
        <input
          type="text"
          placeholder="질문을 입력하세요"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendQuestion(question)}
        />
        <button onClick={() => sendQuestion(question)}>전송</button>
      </div>
    </div>
  );
};
