import {parseDate} from "../util";
import {Button} from "../component";
import {useState} from "react";
import caxios from "../lib/caxios";
import "./css/Note.css";
import {useAuthStore} from "../store";

export const Note = ({dto}) => {
    const {id, content, userId, nickname, latitude, longitude, regDate, recCount, replyCount} = dto
    const date = parseDate(regDate)

    const loginId = useAuthStore(state => state.userId)

    const [form, setForm] = useState({
        id: id,
        latitude: latitude,
        longitude: longitude,
        content: content,
        userId: userId
    })
    const [replyList, setReplyList] = useState([])
    const [isUpdate, setIsUpdate] = useState(false)

    function toggleUpdateForm() {
        setIsUpdate(!isUpdate)
    }

    function update(e) {
        e.preventDefault();
        caxios.put('/api/note', form)
            .then(res => {
                alert("수정이 완료되었습니다.")
                toggleUpdateForm()
            })
    }

    function deleteById(e) {
        e.preventDefault();
        if(window.confirm("해당 쪽지를 삭제하시겠습니까?")) {
            caxios.delete('/api/note/' + id)
                .then(res => {
                    alert("삭제되었습니다.")
                })
        }
    }

    function openReply(e) {
        e.preventDefault();

        caxios.get('/api/note/reply/' + id)
            .then(res => {
                console.log(res)
                setReplyList(prev =>
                    res.data.map(reply =>
                        <NoteReply key={reply.id} dto={reply} />)
                )
            })
            .catch(ignored => {})
    }

    const noteContent = () => {
        return (
            <>
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="badge bg-secondary">#{id}</span>
                    <small className="text-muted">{date}</small>
                </div>
                <h1 className="card-text mb-3">{form.content}</h1>
                <div className="mb-2">
                    <small className="text-muted me-2">작성자: {nickname}</small>
                    <small className="text-muted">추천: {recCount}</small>
                </div>
                {(loginId && loginId === form.userId) && (
                    <div className="d-flex justify-content-end mb-3">
                        <Button className="btn btn-outline-primary btn-sm me-2"
                                onClick={(e) => {
                                    e.preventDefault();
                                    toggleUpdateForm();
                                }
                                }>수정</Button>
                        <Button className="btn btn-outline-secondary btn-sm" onClick={deleteById}>삭제</Button>
                    </div>
                )}
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
                    <Button className="btn btn-primary btn-sm me-2" onClick={update}>수정완료</Button>
                    <Button className="btn btn-danger btn-sm"
                            onClick={(e) => {
                                e.preventDefault();
                                toggleUpdateForm()}
                            }>돌아가기</Button>
                </div>
            </>
        )
    }

    return (
        <div className="note-wrapper">
            <div className="card post-it-note">
                <div className="card-body">
                    {isUpdate ? updateNote() : noteContent()}

                    <hr className="note-divider" />

                    <div className="reply-section">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="card-title mb-0">댓글 {replyCount}개</h6>
                            <Button className="btn btn-outline-secondary btn-sm" onClick={openReply}>
                                열기
                            </Button>
                        </div>
                        <div className="reply-list mb-3">{replyList}</div>
                        <div className="mb-3">
                            <textarea className="form-control note-textarea" rows="2" placeholder="댓글을 입력하세요..."></textarea>
                        </div>
                        <div className="d-flex justify-content-end">
                            <Button className="btn btn-primary btn-sm me-2">등록</Button>
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
        caxios.post('/api/note', form)
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