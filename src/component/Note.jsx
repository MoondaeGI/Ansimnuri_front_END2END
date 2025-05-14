import {parseDate} from "../util";
import {Button} from "react-bootstrap";
import {useState} from "react";
import axios from "axios";
import "./css/Note.css";

export const Note = ({dto}) => {
    const {id, content, userId, nickname, regDate, recCount, replyCount} = dto
    const date = parseDate(regDate)

    const [form, setForm] = useState({
        id: id,
        content: content,
        userId: userId
    })
    const [replyList, setReplyList] = useState([])
    const [isUpdate, setIsUpdate] = useState(false)

    function toggleUpdateForm(e) {
        e.preventDefault();
        setIsUpdate(!isUpdate)
    }

    function update(e) {
        e.preventDefault();
        axios.put('http://localhost/api/note', form)
            .then(res => {
                console.log(res)
            })
    }

    function deleteById(e) {
        e.preventDefault();
        axios.delete('http://localhost/api/note/' + id)
            .then(res => {
                console.log(res)
            })
    }

    function openReply(e) {
        e.preventDefault();

        axios.get('http://localhost/api/note/reply/' + id)
            .then(res => {
                console.log(res)
                setReplyList(prev =>
                    res.data.map(reply =>
                        <NoteReply key={reply.id} dto={reply} />)
                )
            })
            .catch(ignore => {})
    }

    const noteContent = () => {
        return (
            <>
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-secondary">#{id}</span>
                    <small className="text-muted">{date}</small>
                </div>
                <p className="card-text mb-3">{content}</p>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                        <small className="text-muted me-2">작성자: {nickname}</small>
                        <small className="text-muted">추천: {recCount}</small>
                    </div>
                    <div>
                        <Button className="btn btn-outline-primary btn-sm me-2" onClick={update}>수정</Button>
                        <Button className="btn btn-outline-secondary btn-sm" onClick={toggleUpdateForm}>돌아가기</Button>
                    </div>
                </div>
            </>

        );
    }

    const updateNote = () => {
        return (
            <>
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-secondary">#{id}</span>
                </div>
                <div className="mb-3">
                    <textarea
                        className="form-control"
                        name="content"
                        value={form.content}
                        onChange={(e) => setForm({...form, content: e.target.value})}
                        rows="3"
                    />
                </div>
                <div className="d-flex justify-content-end mb-3">
                    <Button className="btn btn-primary btn-sm me-2" onClick={toggleUpdateForm}>수정</Button>
                    <Button className="btn btn-danger btn-sm" onClick={deleteById}>삭제</Button>
                </div>
            </>
        )
    }

    return (
        <div className="note-wrapper">
            <div className="card shadow-sm">
                <div className="card-body">
                    {isUpdate ? updateNote() : noteContent()}

                    <hr className="my-3" />

                    <div className="reply-section">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="card-title mb-0">댓글 {replyCount}개</h6>
                            <Button className="btn btn-outline-secondary btn-sm" onClick={openReply}>열기</Button>
                        </div>
                        <div className="reply-list mb-3">{replyList}</div>
                        <div className="mb-3">
                            <textarea className="form-control" rows="2" placeholder="댓글을 입력하세요..."></textarea>
                        </div>
                        <div className="d-flex justify-content-end">
                            <Button className="btn btn-primary btn-sm me-2">등록</Button>
                            <Button className="btn btn-outline-secondary btn-sm">삭제</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export const NoteReply = ({dto}) => {
    const {id, content, userId, nickname, regDate, recCount} = dto
    const date = parseDate(regDate)

    const update = (e) => {
        e.preventDefault();
    }

    const deleteById = (e) => {
        e.preventDefault();
    }

    return (
        <div>
            <div>
                <div>{id}</div>
                <div>{content}</div>
                <div>{userId}</div>
                <div>{recCount}</div>
                <div>{nickname}</div>
                <div>{date}</div>
            </div>
            <div>
                <Button onClick={update}>수정</Button>
                <Button onClick={deleteById}>삭제</Button>
            </div>
        </div>
    )
}

export const EmptyNote = ({latitude, longitude}) => {
    const [form, setForm] = useState({
        latitude: latitude,
        longitude: longitude,
        content: ''
    })

    const save = (e) => {
        e.preventDefault();
        axios.post('http://localhost/api/note', form)
            .then(res => {
                console.log(res)
            })
    }

    const back = (e) => {
        e.preventDefault();
    }

    return (
        <div>
            <form>
                <textarea name="content"></textarea>
                <div>
                    <Button onClick={save}>등록</Button>
                    <Button oncClick={back}>취소</Button>
                </div>
            </form>
        </div>
    )
}