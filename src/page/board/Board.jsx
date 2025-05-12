import { Detail, List, Write } from "./component";
import { Route, Routes } from "react-router-dom";

const Board = ({type, title}) => {
    const columnList = (type === 'notice') ? ['번호', '제목', '등록일자'] : ['번호', '제목', '글쓴이', '등록일자'];
    const dataList = [{'id': 1, 'title': '제목', 'regDate': '2020-10-19'}];

    return (
        <div>
            <h3>{title}</h3>
            <div>
                <Routes>
                    <Route path="detail" element={<Detail />} />
                    <Route path="list" element={<List columnList={columnList} dataList={dataList}/>} />
                    <Route path="write" element={<Write />} />
                </Routes>
            </div>
        </div>
    );
};

export default Board;
