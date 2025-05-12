import React, { useState, useEffect } from "react";
import axios from "axios";
import "./css/News.css";

export const News = () => {
  const [newsList, setNewsList] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:80/api/news")
      .then(res => {
        console.log(res)
        setNewsList(res.data);
      })
  }, []);

  return (
    <div className="newsContainer">
      <div className="newsCardList">
        {newsList.map((article) => (
          <div className="newsCard" key={article.id || article.title}>
            <div className="newsImgWrapper">
              <img src={article.thumbnailImg} alt="뉴스 썸네일" className="newsImg"/>
            </div>
            <div className="newsContent">
              <h3 className="newsTitle">
                <a href={article.url} className="newsTitleLink" target="_blank" rel="noopener noreferrer">
                  {article.title}
                </a>
              </h3>
              {article.description && (
                <p className="newsDescription">{article.description}</p>
              )}
              <p className="newsDate">{new Date(article.regDate).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

