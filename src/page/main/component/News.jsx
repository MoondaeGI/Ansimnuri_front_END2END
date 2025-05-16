import React, { useState, useEffect } from "react";
import axios from "axios";
import "./css/News.css";

export const News = () => {
  const [newsList, setNewsList] = useState([]);

  useEffect(() => {
    axios.get("http://localhost/api/news")
      .then(res => {
        console.log(res)
        setNewsList(res.data);
      })
  }, []);

  return (
    <div className="newsContainer">
      <div className="newsCardList">
        {newsList.map((article, index) => (
          <div className="newsCard" key={index}>
            <div className="newsImgWrapper">
              <div className="newsImg">{article.title}</div>
            </div>
            <div className="newsContent">
              <h3 className="newsTitle">
                <a href={article.url} className="newsTitleLink" target="_blank" rel="noopener noreferrer">
                  {article.description}
                </a>
              </h3>
              <p className="newsDate">{new Date(article.regDate).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

