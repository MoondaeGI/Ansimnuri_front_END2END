import React, { useState, useRef, useEffect } from "react";
import "./css/ChatBot.css";

export const ChatBot = () => {
  const [chatLog, setChatLog] = useState([]);
  const [question, setQuestion] = useState("");
  const [selectedMainMenu, setSelectedMainMenu] = useState(null);
  const [selectedSubMenu, setSelectedSubMenu] = useState(null);
  const [policeSearchMode, setPoliceSearchMode] = useState(false);
  const [previousMenu, setPreviousMenu] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      scrollToBottom();
    }
  }, [chatLog]);

  const menuOptions = [
    "🚔 지구대 / 경찰서 안내",
    "📰 최근 범죄 뉴스 TOP 3",
    "🏡 안전한 귀가 경로 추천",
    "🚨 범죄 피해 대처 요령",
    "💙 범죄 피해 지원 제도",
    "💡 자주 묻는 질문 (FAQ)"
  ];

  const subMenus = {
    "🚔 지구대 / 경찰서 안내": [],
    "📰 최근 범죄 뉴스 TOP 3":[],
    "🏡 안전한 귀가 경로 추천":[],
    "🚨 범죄 피해 대처 요령": [
      "🔹 강력범죄 피해시 대처요령",
      "🔹 성폭력 피해시 대처요령",
      "🔹 가정폭력 피해시 대처요령",
      "🔹 학교폭력 피해시 대처요령"
    ],
    "💙 범죄 피해 지원 제도": [
      "◼️ 경제적 지원제도",
      "◼️ 법률적 지원제도",
      "◼️ 심리치료 지원제도",
      "◼️ 주거 지원제도"
    ],
    "💡 자주 묻는 질문 (FAQ)": [
      "🗺️ 무슨 사이트인가요?",
      "❔ 이용 방법은?",
      "⭕ GPS ON/OFF 차이는?",
      "🧑‍🤝‍🧑 회원만의 기능은?",
      "💌 지도 쪽지기능이란?"
    ]
  };

  const subDetailMenus = {
    "◼️ 경제적 지원제도": [
      "◼️ 범죄피해자구조금제도",
      "◼️ 긴급복지 지원제도",
      "◼️ 무보험차량·뺑소니 피해자 구조제도",
      "◼️ 이전비 지원제도",
      "◼️ 주거지원제도",
      "◼️ 자동차사고 피해가족 지원제도",
      "◼️ 배상명령제도",
      "◼️ 보험급여 지원제도"
    ],
    "◼️ 법률적 지원제도": [
      "◼️ 무료법률구조제도",
      "◼️ 형사조정제도",
      "◼️ 법률홈닥터",
      "◼️ 화해제도"
    ],
    "◼️ 심리치료 지원제도": [
      "◼️ 스마일센터를 통한 심리치료 지원",
      "◼️ CARE(피해자심리전문요원)"
    ],
    "◼️ 주거 지원제도": [
      "◼️ 피해자 임시숙소 제도",
      "◼️ 성폭력피해자 보호시설",
      "◼️ 가정폭력피해자 보호시설"
    ]
  };

  useEffect(() => {
    setChatLog([{
      role: "assistant",
      content: "안녕하세요! 누리봇이예요 🤗  어떤 도움이 필요하신가요? ❤️ ",
    }, {
      role: "menu",
      options: menuOptions
    }]);
  }, []);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (chatEndRef.current) {
        const chatWindow = chatEndRef.current.parentElement;
        const scrollHeight = chatWindow.scrollHeight;
        chatWindow.scrollTop = scrollHeight;
      }
    }, 50);
  };

  const resetChat = () => {
    setChatLog([{
      role: "assistant",
      content: "안녕하세요! 누리봇이예요 🤗  어떤 도움이 필요하신가요? ❤️ ",
    }, {
      role: "menu",
      options: menuOptions
    }]);
    setQuestion("");
    setSelectedMainMenu(null);
    setSelectedSubMenu(null);
    setPreviousMenu(null);
    setPoliceSearchMode(false);
    scrollToBottom();
  };

  const handleMenuSelect = async (option) => {
    if (option === "🏠 처음으로") {
      resetChat();
      return;
    }
    
    // try {
    //   await fetch("http://localhost:80/api/dashboard", {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ menuName: option })
    //   });
    // } catch (err) {
    //   console.error("클릭 로그 전송 실패:", err);
    // }

    if (option === "🚩 이전으로") {
      if (previousMenu) {
        setChatLog(prev => [...prev, {
          role: "menu",
          options: previousMenu.options,
          isSubMenu: previousMenu.isSubMenu,
          isSubDetail: previousMenu.isSubDetail,
          parentMenu: previousMenu.parentMenu
        }]);
        setSelectedMainMenu(previousMenu.parentMenu || null);
        setSelectedSubMenu(null);
        setPoliceSearchMode(previousMenu.parentMenu === "🚔 지구대 / 경찰서 안내");
        scrollToBottom();
      } else {
        setSelectedMainMenu(null);
        setSelectedSubMenu(null);
        setPoliceSearchMode(false);
        setChatLog(prev => [...prev, {
          role: "menu",
          options: menuOptions
        }]);
        scrollToBottom();
      }
      return;
    }
    setSelectedMainMenu(option);
    setChatLog(prev => [...prev, { role: "user", content: option }]);

    if (option === "📰 최근 범죄 뉴스 TOP 3") {
      try {
        setIsLoading(true);

        const res = await fetch("http://localhost:80/chatBot/news/top3");
        const newsList = await res.json();
        const summaryRes = await fetch("http://localhost:80/chatBot/news/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newsList)
        });
    
        const summaryList = await summaryRes.json();
        const summaryHTML = summaryList.map(
          (n, i) => `<p><strong>📅 제목:</strong> ${n.title}
<strong>📌 주요 내용 요약:</strong> ${n.summary}
<strong>🔗 기사 링크:</strong> <a href="${n.url}" target="_blank" rel="noopener noreferrer">${n.url}</a></p>`).join("");
        
        setChatLog(prev => [...prev, {
          role: "assistant",
          content: <div dangerouslySetInnerHTML={{ __html: summaryHTML }} />
        },
        {
          role: "menu",
          options: ["🏠 처음으로"]
        }]);
        scrollToBottom();
      } catch (err) {
        console.error("뉴스 요약 실패:", err);
        setChatLog(prev => [...prev, { role: "assistant", content: "뉴스를 가져오지 못했어요 😥" }]);
        scrollToBottom();
      }finally {
        setIsLoading(false);
      }
      return;
    }    
    
    if (option === "🚔 지구대 / 경찰서 안내") {
      setPoliceSearchMode(true);
      setChatLog(prev => [...prev, { role: "assistant", content: `'${option}' 메뉴를 선택하셨습니다.
안내받고 싶은 지역명을 입력해주세요.😊` }]);
    } else {
      setPoliceSearchMode(false);
    }

    if (subMenus[option]?.length > 0) {
      const menuData = {
        role: "menu",
        options: subMenus[option],
        isSubMenu: true,
        parentMenu: option
      };
      setPreviousMenu({ ...menuData });
      setChatLog(prev => [...prev, menuData]);
      scrollToBottom();
    } else {
      handleFinalSelection(option, option);
    }
  };

  const handleSubMenuSelect = async (parentMenu, option) => {
    setSelectedSubMenu(option);
    setChatLog(prev => [...prev, { role: "user", content: option }]);

    if (subDetailMenus[option]) {
      const menuData = {
        role: "menu",
        options: subDetailMenus[option],
        isSubDetail: true,
        parentMenu
      };
      setPreviousMenu({ ...menuData });
      setChatLog(prev => [...prev, menuData]);
      scrollToBottom();
    } else {
      handleFinalSelection(parentMenu, option);
    }
  };

  const handleFinalSelection = (parentMenu, input) => {
    if (parentMenu === "🚨 범죄 피해 대처 요령") {
      fetchBackendAndRespond("guide", input);
    } else if (parentMenu === "💙 범죄 피해 지원 제도") {
      fetchBackendAndRespond("support", input);
    } else if (parentMenu === "💡 자주 묻는 질문 (FAQ)") {
      fetchBackendAndRespond("faq", input);
    }
  };

  const fetchBackendAndRespond = async (endpoint, input) => {
    try {
      let url = `http://localhost:80/chatBot/${endpoint}`;
      if (endpoint === "police") {
        url += `?keyword=${encodeURIComponent(input)}`;
      } else {
        url += `?question=${encodeURIComponent(input)}`;
      }
      const res = await fetch(url);
      const isJson = res.headers.get("content-type")?.includes("application/json");
      const result = isJson ? await res.json() : await res.text();

      if ((typeof result === "string" && (!result || result.includes("없습니다"))) || (Array.isArray(result) && result.length === 0)) {
        const gptRes = await fetch("http://localhost:80/chatBot/api", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              {
                role: "system",
                content: "당신은 범죄 피해 지원 및 대처 요령, FAQ에 대한 내용을 친절히 설명하는 한국어 챗봇입니다. 질문에 맞는 정보가 없을 경우에도 부드럽게 안내해주세요."
              },
              {
                role: "user",
                content: `"${input}"이라는 질문에 대한 정보가 없을 경우 사용자에게 어떻게 안내해줄 수 있을까?`
              }
            ]
          })
        });

        const gptData = await gptRes.json();
        const gptContent = gptData.choices?.[0]?.message?.content || "해당 정보는 아직 준비되지 않았어요. 조금만 기다려 주세요!";

        setChatLog(prev => [...prev, { role: "assistant", content: gptContent }]);
        scrollToBottom();
        return;
      }

      const backButtons = {
        role: "assistant",
        content: (
          <div>
            <div>{typeof result === 'string' ? result : result.map((p, i) => `${i + 1}. ${p.name} (${p.address})`).join("\n")}</div>
            <div style={{ marginTop: '8px' }}>
              <button className="chat-option-button" onClick={() => handleMenuSelect("🚩 이전으로")}>🚩 이전으로</button>
              <button className="chat-option-button" onClick={() => handleMenuSelect("🏠 처음으로")}>🏠 처음으로</button>
            </div>
          </div>
        )
      };

      setChatLog(prev => [...prev, backButtons]);
      scrollToBottom();
    } catch (err) {
      console.error("백엔드 호출 실패:", err);
      setChatLog(prev => [...prev, { role: "assistant", content: "서버 오류가 발생했어요 😥" }]);
      scrollToBottom();
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">🧐 NuriBot 😎</div>
      <div className="chat-window">
        {chatLog.map((msg, i) => {
          if (msg.role === "menu") {
            return (
              <div key={i} className="chat-bubble assistant option-wrapper">
                {msg.options.map((opt, j) => (
                  <button
                    key={j}
                    className="chat-option-button"
                    onClick={() => msg.isSubDetail
                      ? handleFinalSelection(msg.parentMenu, opt)
                      : msg.isSubMenu
                      ? handleSubMenuSelect(msg.parentMenu, opt)
                      : handleMenuSelect(opt)}>
                    <span className="option-text">{opt}</span>
                  </button>
                ))}
              </div>
            );
          }
          return (
            <div key={i} className={`chat-bubble ${msg.role === "user" ? "user" : "assistant"}`}>
              {msg.content}
            </div>
          );
        })}
        {isLoading && (
          <div className="chat-bubble assistant typing-indicator">
            <div>타닥타닥... ⌨️💭<br></br>
                 누리봇이 답변 작성중 👨‍🚀🚀 </div>
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {policeSearchMode && (
        <div className="input-area">
          <input
            type="text"
            className="chat-input"
            placeholder="예: 강남구, 신림, 삼성동"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (() => {
              setChatLog(prev => [...prev, { role: "user", content: question }]);
              setQuestion("");
              fetchBackendAndRespond("police", question);
            })()}
          />
          <button onClick={() => fetchBackendAndRespond("police", question)} className="send-btn">전송</button>
        </div>
      )}
    </div>
  );
};