import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import TypewriterEffect from './TypewriterEffect';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileLines, faMagnifyingGlass, faPaperPlane, faRetweet, faRobot } from '@fortawesome/free-solid-svg-icons';
const Chatbot = ({systemId, llmId, token, baseUrl, enterpriseSearchId, enterpriseSearchToken}) => {
  const [input, setInput] = useState('');
  const [inputEnterprise, setInputEnterprise] = useState('');
  const [messages, setMessages] = useState([]);
  const newRef = useRef(null);
  const enterpriseRef = useRef(null);
  const [openEnterpriseChat, setOpenEnterpriseChat] = useState(false);
  const [openChat, setOpenChat] = useState(false);
  const [showTyping, setShowTyping] = useState(false);
  const [showLoader, setShowLoader] = useState(false);
  const [showLoadingText, setShowLoadingText] = useState('text1');
  const [showLoaderEnterprise, setShowLoaderEnterprise] = useState(false);
  const [enterpriseResponseList, setEnterpriseResponseList] = useState([]);
  const [sampleQuestionList, setSampleQuestionList] = useState([]);
  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  });

  useEffect(() => { 
    const loadPost = async () => { 
      const historyUrl = baseUrl + systemId + '/questionshistory';
      const historyQuestionsRes = fetch(historyUrl, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `SSWS ` + token
        },
      }).then(historyQuestionsRes => historyQuestionsRes.json());
      if(historyQuestionsRes && historyQuestionsRes) {
        const keys = Object.keys(historyQuestionsRes);
          if(keys && keys.length) {
            keys.forEach(key => {
              if(key) {
                let questionObject = [];
                if(historyQuestionsRes[key]) {
                  let questions = Object.keys(historyQuestionsRes[key]);
                  if(questions && questions.length) {
                    questions.forEach(question => {
                      if(question && historyQuestionsRes[key][question]) {
                        questionObject.push({questionId: question, question: historyQuestionsRes[key][question]})
                      }
                    });
                  }
                }
                let threeQuestions = questionObject.splice(0, 3);
                if(threeQuestions) {
                  setSampleQuestionList(threeQuestions)
                }
              }
            });
          }
      }
      }; 

      loadPost(); 
  }, []); 


  const chatWithUs = async (userInput) => {

    setShowLoader(true);
    setShowLoadingText('Comprehending the question')
    const textTimeout = setInterval(() => {
      const el = document.getElementById('loadingText');
      if(el && el.innerText === 'Comprehending the question') {
        el.innerText = 'Finding relevant content';
      } else if(el && el.innerText === 'Finding relevant content') {
        el.innerText = 'Formulating the response';
      }
    }, 1500);

    const url = baseUrl + systemId + '/answer?questionText=' + userInput + '&llmProviderId=' + llmId;
    const systems = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'SSWS ' + token
      },
    }).then(systems => systems.json());
    clearInterval(textTimeout);
    if(systems && systems.answer && systems.answer.length) {
      setShowLoader(false)
      return systems
    } else {
      setShowLoader(false)
      return ' '
    }
  };

  const handleSubmit = async (e) => {
    setShowTyping(true)
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = { text: input, user: true, sources: [] };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setShowLoader(true);
    const response1 = await chatWithUs(input);
    const newAiMessage = { text: response1.answer, user: false, sources: response1.context };
    setMessages((prevMessages) => [...prevMessages, newAiMessage]);
    setInput('');
  };

  const handleEnterpriseOpenChat = () => {
    openEnterpriseChat === false? setOpenEnterpriseChat(true): setOpenEnterpriseChat(false);
  }

  const handleSwitchToOpenChat = () => {
    setOpenChat(false);
    setOpenEnterpriseChat(true);
  }

  const handleOpenChat = () => {
    openChat === false? setOpenChat(true): setOpenChat(false);
    handleEnterpriseOpenChat();
    if(openChat === false) {
      setShowTyping(false)
    } else {
      setShowTyping(true)
    }
  }

  const clearChat = () => {
    if(messages && messages.length) {
      setMessages([])
    }
  }

  const handleSubmitForEnterprise = async (e) => {
    e.preventDefault();
    if (!inputEnterprise.trim()) return;
    setEnterpriseResponseList([])
    setShowLoaderEnterprise(true);
    setShowLoadingText('Comprehending the question')
    const textTimeout = setInterval(() => {
      const el = document.getElementById('showLoadingTextEnterprise');
      if(el && el.innerText === 'Comprehending the question') {
        el.innerText = 'Finding relevant content';
      } else if(el && el.innerText === 'Finding relevant content') {
        el.innerText = 'Formulating the response';
      }
    }, 1000);

    const sementicUrl = baseUrl + enterpriseSearchId + '/search?query=' + inputEnterprise;
    const sementicRes = await fetch(sementicUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `SSWS ` + enterpriseSearchToken
      },
    }).then(sementicRes => sementicRes.json());
    clearInterval(textTimeout)
    setShowLoaderEnterprise(false)
    if(sementicRes && sementicRes.searchResultsList && sementicRes.searchResultsList.length) {
      setEnterpriseResponseList(sementicRes.searchResultsList);
    }

  }

  const handleOutsideClick = (e) => {
    if (newRef.current && !newRef.current.contains(e.target)) {
      setOpenChat(false);
    }
    if (enterpriseRef.current && !enterpriseRef.current.contains(e.target)) {
      setOpenEnterpriseChat(false);
    }
  };

  const searchQuestion = async (question) => {
    setShowTyping(true)
    if (!question.trim()) return;
    const userMessage = { text: question, user: true, sources: [] };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setShowLoader(true);
    const response1 = await chatWithUs(question);
    const newAiMessage = { text: response1.answer, user: false, sources: response1.context };
    setMessages((prevMessages) => [...prevMessages, newAiMessage]);
  }
  
  return (
    <div style={{width: 'fit-content'}}>
      { openChat === true || openEnterpriseChat === true? <div className="blurDiv"></div>: ''}
    <div className='chatbot-wrapper-div'>
      {openEnterpriseChat === false ? <div className='chatbot-chat-div' onClick={handleEnterpriseOpenChat}>Chat with us. </div> : null}
      {openEnterpriseChat === true ? <div ref={enterpriseRef} className="chatbot-container">
      <div className='inside-chatbot-container'> 
        <div>
          <form onSubmit={handleSubmitForEnterprise}>
            <div className='enterprise-input-div'>
              <input className='enterprise-input'
                type="text"
                value={inputEnterprise}
                onChange={(e) => setInputEnterprise(e.target.value)}
                placeholder="Type your message..."
              />
              <div  className='switch-div' onClick={handleOpenChat}>
                <span>
                <FontAwesomeIcon icon={faRetweet} />
                </span>
                <span className='switch-span'>
                  Ask AI
                </span>
              </div>
            </div>
          </form>
        </div>  
        {showLoaderEnterprise ? <div className='enterprise-body'> <span><div className="spinner"></div></span> <span className='loader-span' id="showLoadingTextEnterprise">{showLoadingText}</span>  </div>: ''}
        {enterpriseResponseList && enterpriseResponseList.length ? <div className='enterprise-body'>
           {enterpriseResponseList.map((list, index) => (<div className={`${index > 0 ? 'enterprise-data-div' : ''}`}><div><span>
            <FontAwesomeIcon icon={faFileLines} />
            </span><a href={list.link} target='_blank' rel="noreferrer" className='text-decoration-none'> <span className='link-span'>{list.link.split('/')[list.link.split('/').length - 1]}</span></a></div><div className='margin-top-20'>{list.data}</div></div>))}
           </div> : ''}
      </div> </div> : ''}
      
    {openChat === true ? <div ref={newRef} className="chatbot-container">
      <div className='inside-chatbot-container'>
        <div className='ask-ai-div'>
          <span>Ask AI</span>
          <span >
            <span className='clear-chat-span' onClick={clearChat}>
              Clear
            </span>
            <span className='clear-chat-span-search' onClick={handleSwitchToOpenChat}>
              <span className='search-icon'>
                <FontAwesomeIcon icon={faMagnifyingGlass} />
                </span>
              <span>Search</span>
              
            </span>
            </span>
        </div>
      <div className="chatbot-messages">
        <div><div className='bot-div'>
          <FontAwesomeIcon icon={faRobot} style={{ color: '#724ae8', width: '25px', height: '25px' }}/>
           </div> <div className='ai-message'>Hi!
          I'm an AI assistant trained on documentation, help articles, and other content.</div>  </div>
        {messages && messages.length === 0 && sampleQuestionList && sampleQuestionList.length ? <div className='example-question-div'> EXAMPLE QUESTIONS <br></br> {sampleQuestionList.map((question, i) => (
          <div className='example-question-span' onClick={() => searchQuestion(question.question)}>
            {question.question}
          </div>
        ))} </div> : ''}  
        {messages.map((message, index) => (
          <div>
            <div
              key={index}
              className={`message ${message.user ? 'user-message' : ''}`}
            >
              {message.user ? <p className='ai-message-para'> {message.text} </p>: index < messages.length-1 ?<div> <div className='bot-div'>
                <FontAwesomeIcon icon={faRobot} style={{ color: '#724ae8', width: '25px', height: '25px' }}/>
                 </div> <div className='ai-message'>{message.text}</div>  </div>: ''}
              {(index < messages.length -1) && !message.user ? <div className='sources-div'> <div className='source-header'>Sources</div> {message.sources.map((source, i) => (<div className='source-ind-div'><div className='display-inline-block'>
                 <FontAwesomeIcon icon={faFileLines} />
                </div> <div className='display-inline-block'><a href={source.link} target='_blank' rel="noreferrer" className='text-decoration-none'><span className='link-span'>{source.link.split('/')[source.link.split('/').length - 1]} </span></a></div> <div className='margin-top-20' title={source.data}> {source.data.substring(0, 100) + '...'}</div></div>))} </div>: ''}
              {(index === messages.length - 1 && showTyping) && !message.user && message.text.length ? <TypewriterEffect key={index} text={message.text} sources={message.sources} speed={10} />: 
              !message.user && index === messages.length - 1 ? <div> <div> <div className='bot-div'>
                <FontAwesomeIcon icon={faRobot} style={{ color: '#724ae8', width: '25px', height: '25px' }}/>
                </div> <div className='ai-message'>{message.text}</div>  </div> <div className='sources-div'> <div className='source-header'>Sources</div> {message.sources.map((source, i) => (<div className='source-ind-div'><div className='display-inline-block'>
                   <FontAwesomeIcon icon={faFileLines} />
                    </div> <div className='display-inline-block'><a href={source.link} target='_blank' rel="noreferrer" className='text-decoration-none'><span className='link-span'>{source.link.split('/')[source.link.split('/').length - 1]} </span></a></div> <div className='margin-top-20' title={source.data}> {source.data.substring(0, 100) + '...'} </div> </div>))} </div>  </div>:''}
            </div>
          </div>
        ))}
        { showLoader ? <div> <div className='bot-div'>
          <FontAwesomeIcon icon={faRobot} style={{ color: '#724ae8', width: '25px', height: '25px' }}/>
           </div> <div className='ai-message'><span><div className="spinner"></div></span> <span className='loader-span' id="loadingText">{showLoadingText}</span> </div>  </div>: ''}
      </div>
      <div className='chatbot-footer'>
        <form className="chatbot-input-form" onSubmit={handleSubmit}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
          />
          
          <button className='submitSpan' type="submit">
            <FontAwesomeIcon icon={faPaperPlane} />
            </button>
        </form>
      </div>
    </div> </div>: null }
    </div>
    </div>
  );
};
export default Chatbot;