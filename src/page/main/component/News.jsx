import React, { useState, useEffect } from "react";
import axios from "axios";

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
    <div>
      <h2>뉴스</h2>
      {newsList.map((article) => (
        <div key={article.id || article.title}>
          <h3>
            <a href={article.url}  style={{ textDecoration: "none", color: "black" }} target="_blank" rel="noopener noreferrer">
              {article.title}
            </a>
          </h3>
          <p>{new Date(article.regDate).toLocaleString()}</p>
        </div>
      ))}
    </div>
  );
};
