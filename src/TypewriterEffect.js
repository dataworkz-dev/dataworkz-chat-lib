import React, { useState, useEffect, useRef } from 'react';
import './Chatbot.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileLines, faRobot } from '@fortawesome/free-solid-svg-icons';

const TypewriterEffect = ({ text, speed = 1, sources = [] }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);
  const [showSources, setShowSources] = useState(false);
  const myRef = useRef(null)
  const sourceRef = useRef(null)
  useEffect(() => {
    if(text == 'FAILED') {
      setDisplayedText("Sorry, I couldn't answer you at this point in time.");
      myRef.current.scrollIntoView() 
      sourceRef.current.scrollIntoView() 
    } else if (index < text.length) {
      const timer = setTimeout(() => {
        setDisplayedText(displayedText + text[index]);
        setIndex(index + 1);
        myRef.current.scrollIntoView() 
      }, speed);
      return () => {
        clearTimeout(timer); 
        myRef.current.scrollIntoView() 
      }
    } else {
        setShowSources(true);
        myRef.current.scrollIntoView() 
        sourceRef.current.scrollIntoView() 
    }
  }, [index, displayedText, text, speed, showSources]);

  return (
  <div>
    <div>
    <div className='bot-div'>
      <FontAwesomeIcon icon={faRobot} style={{ color: '#724ae8', width: '25px', height: '25px' }}/>
    </div>
    <div className='ai-message'> { text == 'FAILED' ? <span style={{color: 'red'}}>Sorry, I couldn't answer you at this point in time.</span> : <span>{displayedText}</span> }</div>
    </div>
    
    {<div className='sources-div'>
      
      {showSources ? <div><div className='source-header'>{sources && sources.length ? 'Sources' : ''}</div>
      {sources.map((source, i) => (
        <div>
          <div key={i} className='source-ind-div'>
            <div className='display-inline-block'>
               <FontAwesomeIcon icon={faFileLines} />
              </div> 
            <div className='display-inline-block'><a href={source.link} target='_blank' rel="noreferrer" className='text-decoration-none'><span className='link-span'> {source.link.split('/')[source.link.split('/').length - 1]} </span></a> </div> <div className='margin-top-20' title={source.data}>{source.data.substring(0, 100) + '...'}</div>
          </div>
        </div>
      ))}</div>: ''}
      <div ref={sourceRef} ></div>
    </div>}
    <div ref={myRef}></div>
  </div>)
};

export default TypewriterEffect;
