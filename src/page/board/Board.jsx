import { Detail, List, Write } from "./component";
import {Table} from '../../component'

const Board = ({type, title}) => {
    const columnList = (type === 'notice') ? ['번호', '제목', '등록일자'] : ['번호', '제목', '글쓴이', '등록일자'];
    const dataList = [{'id': 1, 'title': '제목', 'regDate': '2020-10-19'}];

    return (
        <div>
            <h3>{title}</h3>
            <Table columnList={columnList} dataList={dataList} />
        </div>
    );
};

export default Board;
