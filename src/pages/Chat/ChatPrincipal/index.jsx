import "./style.css";

import imagemPerfil from "../../../assets/images/logo.jpg";
import SearchIcon from "@mui/icons-material/Search";
import { useRef, useEffect, useState } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import jwt from 'jwt-decode'
import io from 'socket.io-client';
import apiRequest from '../../../services/api.js'



export default function ChatPrincipal({ setLogado }) {

  const [message, setMessage] = useState("");
  const [token, setToken] = useState('');
  const [socket, setSocket] = useState(null);
  const [usuarioSelecionado, setUsuarioSelecionado] = useState({});
  const [chat, setChat] = useState('')
  const { idChat } = useParams();
  const [arrayMensagens, setarrayMensagens] = useState([]);
  const [messagesDB, setMessagesDB] = useState([])

  const { idUsuario } = useParams();
  const navigate = useNavigate();
  const conteudoRef = useRef(null);
  

  //ScrollBar


  useEffect(() => {
    setToken(document.cookie.replace(/(?:(?:^|.*;\s*)jwt\s*\=\s*([^;]*).*$)|^.*$/, '$1'))
    setSocket(io('https://dubium.herokuapp.com'));
  }, [])

  useEffect(() => {
    if (token) {
      getUsuario()
    }
  }, [token])

  useEffect(() => {
    if (socket) {
      socket.emit('joinInstance', usuarioSelecionado.chats)
      socket.on("receivedMessage", (message) => {
        setarrayMensagens((prevarrayMensagens) => [...prevarrayMensagens, message]);
      });
    }
  }, [usuarioSelecionado]);

  const getChat = async () => {
    await apiRequest
      .get(`/chat/${idChat}`, {
        headers: {
          Authorization: "Bearer " + token,
        }
      })
      .then(data => {
        setChat(data.data)
        setMessagesDB(data.data.mensagens)
      })
      .catch(error => {
        console.log(error)
      })
  }

  const scrollDown = () => {
    const container = document.getElementsByClassName('conteudoChat')[0];
    if(container){
      console.log(container)
      container.scrollTop = container.scrollHeight
    }
  }

  useEffect(() => {
    if (messagesDB) {
      scrollDown()
    }
  }, [messagesDB]);




  useEffect(() => {
    if (token && idChat) {
      getChat()
    }
  }, [token, idChat]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    let _message = {
      user: jwt(token).secret,
      message: message,
      horario: new Date(),
      idRoom: idChat
    }
    setarrayMensagens((prevarrayMensagens) => [...prevarrayMensagens, _message]);
    socket.emit("sendMessage", _message)
    setMessage("")
  }

  const getUsuario = async () => {
    await apiRequest
      .get(`/usuario/${jwt(token).secret.id}`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      })
      .then((response) => {
        setUsuarioSelecionado(response.data);
      })
      .catch((err) => {
        console.error("ops! ocorreu um erro" + err);
      });
  }

  const saveMessages = async () => {
    await apiRequest
      .post("/chat/messages", { messages: arrayMensagens, idChat: idChat }, {
        headers: {
          Authorization: "Bearer " + token
        }
      })
      .then(data => {
        console.log(data)
      })
      .catch(err => {
        console.log(err)
      })
  }

  useEffect(() => {
    if (arrayMensagens.length >= 1) {
      saveMessages()
      setMessagesDB([...messagesDB, ...arrayMensagens]);
      setarrayMensagens([])
    }
  }, [arrayMensagens])

  return token && socket && chat && usuarioSelecionado && arrayMensagens && messagesDB && (
    <div className="containerChat">
      <div className="chat-principal">

        <div id="corFundo">
          <div className="dadosUsuario">
            <img id="imagemPerfilChat" src={imagemPerfil} alt="imagemPerfil" />
            <span>{chat.usuarios[0].user.id == jwt(token).secret.id ? chat.usuarios[0].userTarget.nome : chat.usuarios[0].user.nome}</span>
            <div id="searchIcon"><SearchIcon /></div>
          </div>


          <div className="conteudoChat" >
            {messagesDB.map((mensagem, index) => {
              return (
                <Link
                  key={index}
                >

                  <div
                    className={jwt(token).secret.id == mensagem.user.id ? "textoChat1" : "textoChatOutro"}>
                    {mensagem.user.nome}: {mensagem.message}
                  </div>
                </Link>
              );
            })
            }

            {arrayMensagens.map((mensagem, index) => {
              return (
                <Link
                  key={index}
                >
                  {mensagem.idRoom == idChat && <div
                    className={jwt(token).secret.id == mensagem.user.id ? "textoChat1" : "textoChatOutro"}>
                    {mensagem.user.nome}: {mensagem.message}
                  </div>}
                </Link>
              );
            })}

          </div>
        </div >

        <form className="formEntradas" action="" onSubmit={handleSubmit}>
          <div className="entradasChat">
            <input
              id="campoDigitacao"
              type="text"
              placeholder="Mensagem"
              value={message}
              required
              maxLength='30'
              onChange={e => setMessage(e.target.value)}
            />
            <button type="submit" className="sendMessage">
              Enviar
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
