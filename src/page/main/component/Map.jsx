import {Note, NoteReply} from "../../../component";
import {useEffect, useState} from "react";
import axios from "axios";

export const Map = () => {
  const [noteList, setNoteList] = useState([])

  useEffect(() => {
    axios.get("http://localhost:80/api/note")
        .then(res => {
          setNoteList(res.data.map(dto => <Note dto={dto}/>));
        })
  }, [])

  return <div>지도</div>
}
