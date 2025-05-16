import {parseDate} from "../util";
import {Button, Marker} from "../component";
import {useState} from "react";
import caxios from "../lib/caxios";
import "./css/Note.css";
import "./css/Popup.css";
import {useAuthStore, useNoteStore } from "../store";
import {Popup} from "react-map-gl/mapbox";

export const Note = ({id: _id}) => {
    const dto = useNoteStore(state => state.noteList.find(note => note.id == _id))
    console.log(dto)

    const {id, content, userId, nickname, latitude, longitude, regDate, recCount, replyCount} = dto
    const date = parseDate(regDate)

    const loginId = useAuthStore(state => state.userId)

    const [form, setForm] = useState(() =>({...dto}))
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
                {(loginId && loginId === userId) && (
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

export const NoteList = () => {
    const noteList = useNoteStore(state => state.noteList)
    const [selectedNote, setSelectedNote] = useState(null);

    return (
        <>
            {noteList.map(note => (
                <Marker
                    key={note.id}
                    latitude={note.latitude}
                    longitude={note.longitude}
                    onClick={(e) => {  // onClick 오타 수정
                        e.originalEvent.stopPropagation();
                        setSelectedNote(note);
                    }}
                >
                    <div className="marker">📍</div>  {/* 마커 스타일링을 위한 div 추가 */}
                </Marker>
            ))}

            {/* Popup을 Marker 밖으로 이동 */}
            {selectedNote && (
                <Popup
                    longitude={selectedNote.longitude}
                    latitude={selectedNote.latitude}
                    anchor="bottom"
                    closeButton={false}
                    closeOnClick={false}      // 맵 클릭 시 팝업 닫기 방지
                    closeOnMove={false}       // 맵 이동 시 팝업 닫기 방지
                    onClick={(e) => {         // 팝업 내부 클릭 이벤트 처리
                        e.stopPropagation();
                    }}
                    interactive={true}
                    className="custom-popup"
                    onClose={() => setSelectedNote(null)}
                >
                    <div onClick={(e) => e.stopPropagation()}>  {/* 추가 이벤트 버블링 방지 */}
                        <Note id={selectedNote.id} />
                    </div>
                </Popup>
            )}
        </>
    )
}