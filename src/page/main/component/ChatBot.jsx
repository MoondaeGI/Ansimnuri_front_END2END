import React, { useState } from "react";
import "./css/ChatBot.css";

export const ChatBot = () => {
  const [chatLog, setChatLog] = useState([]);
  const [question, setQuestion] = useState("");
  const [selectedMainMenu, setSelectedMainMenu] = useState(null);
  const [policeSearchMode, setPoliceSearchMode] = useState(false);

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
      "기타 지원제도"
    ],
    "자주 묻는 질문 (FAQ)": [
      "무슨 사이트인가요?",
      "이용 방법은?",
      "GPS 꺼도 되나요?",
      "비회원도 가능해요?",
      "관리자에게 질문은?"
    ]
  };

  const promptStyles = {
    "안전한 귀가 경로 추천": "출발지와 목적지를 물어보고, 가로등·CCTV·사람 많은 길 등 기준으로 안전한 길을 안내하세요.",
    "범죄 피해 대처 요령": "피해 유형에 맞춰 행동 요령을 단계별로 짧고 명확하게 정리하세요.",
    "범죄 피해 지원 제도": "어떤 제도인지, 어떻게 신청하는지, 어디서 도움받는지 정리해서 알려주세요.",
    "자주 묻는 질문 (FAQ)": "짧고 간결한 문장으로 사용자들이 자주 묻는 내용을 답해주세요.",
    default: "사용자에게 친절하고 명확하게 안내해주세요. 반드시 한국어로, UI 채팅창에 보기 좋게 정돈된 형태. 마크다운 기호(##, **, -, *, _, 숫자. 등)는 절대 사용하지 말 것"
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

        if (Array.isArray(policeList) && policeList.length > 0) {
          const formatted = policeList
            .map((p, i) => `${i + 1}. ${p.name} (${p.address})`)
            .join("\n");
          setChatLog([...updated, { role: "assistant", content: `해당 지역의 경찰서입니다:\n\n${formatted}` }]);
        } else {
          setChatLog([...updated, { role: "assistant", content: "해당 지역에 대한 경찰서 정보를 찾을 수 없습니다." }]);
        }
      } catch (error) {
        console.error("경찰서 조회 실패:", error);
        setChatLog([...updated, { role: "assistant", content: "오류가 발생했습니다. 다시 시도해주세요." }]);
      }
      return;
    }

    const stylePrompt = promptStyles[selectedMainMenu] || promptStyles.default;
    const prompt = `${stylePrompt}\n질문: ${input}`;

    const res = await fetch("http://localhost:80/chatBot/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [
          {
            role: "system",
            content:
              "당신은 안심누리의 한국어 전용 챗봇입니다. 반드시 한국어로, 말풍선 UI에 어울리는 문장으로 깔끔하게 답변해주세요. 중국어나 영어는 절대 사용하지 마세요."
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
    setPoliceSearchMode(false);
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">🧐 NuriBot 😎</div>
      <div className="chatbot-subtitle">안녕하세요! 저는 안심누리의 누리봇입니다. <br></br>🔎 어떤 도움이 필요하신가요?</div>

      {policeSearchMode && (
        <div className="top-reset-button">
          <button onClick={resetChat} className="menu-button">↩ 처음으로</button>
        </div>
      )}

      {!selectedMainMenu && (
        <div className="menu-list single-column">
          {menuOptions.map((option, i) => (
            subMenus[option] && subMenus[option].length > 0 ? (
              <button key={i} className="menu-button" onClick={() => setSelectedMainMenu(option)}>
                {option}
              </button>
            ) : (
              <button key={i} className="menu-button" onClick={() => {
                setSelectedMainMenu(option);
                if (option === "지구대 / 경찰서 안내") {
                  setPoliceSearchMode(true);
                }
                setChatLog(prev => [...prev, {
                  role: "assistant",
                  content: `'${option}' 메뉴를 선택하셨습니다. 안내받고 싶은 지역명을 입력해주세요.`
                }]);
              }}>
                {option}
              </button>
            )
          ))}
        </div>
      )}

      {selectedMainMenu && subMenus[selectedMainMenu].length > 0 && (
        <div className="menu-list single-column">
          {subMenus[selectedMainMenu].map((option, i) => (
            <button key={i} className="menu-button" onClick={() => sendQuestion(option)}>
              {option}
            </button>
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
      </div>

      <div className="input-area">
        <input
          type="text"
          className="chat-input"
          placeholder={
            policeSearchMode
              ? "예: 강남구, 신림, 서원동"
              : "챗봇의 도움이 필요하신가요?"
          }
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendQuestion(question)}
        />
        <button onClick={() => sendQuestion(question)} className="send-btn">전송</button>
      </div>
    </div>
  );
};
