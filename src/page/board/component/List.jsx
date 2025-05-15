import {Table} from "../../../component";
import {useNavigate} from "react-router-dom";
import {Button} from "react-bootstrap";

export const List = ({columnList, dataList}) => {
    const navigate = useNavigate();

    return (
        <div>
            <Table columnList={columnList} dataList={dataList} />
            <div>
                <Button onClick={() => navigate('/board/write')}>글쓰기</Button>
            </div>
        </div>
    )
}
