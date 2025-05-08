import {Chat, ChatBot, Map, News} from './component'

const Main = () => {
  return (
    <div>
      <div>
        <News />
        <Map />
        <ChatBot />
      </div>
      <div>
        <Chat />
      </div>
    </div>
  )
}

export default Main
